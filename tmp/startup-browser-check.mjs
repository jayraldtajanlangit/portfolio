import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const root = resolve('.');
const out = 'tmp/startup-browser';
await mkdir(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + new URL(req.url, 'http://local').pathname);
    if (!path.startsWith(root + sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await Browser.launch();
const base = `http://127.0.0.1:${server.address().port}/index.html`;
const results = [];
const check = (name, pass, detail) => { results.push({ name, pass, detail }); console.log(pass ? 'PASS' : 'FAIL', name, detail ?? ''); if (!pass) process.exitCode = 1; };
try {
  const page = await browser.newPage();
  await page.goto(base, { settleMs: 0 });
  const fresh = async (theme = 'dark') => {
    await page.eval(theme => { sessionStorage.clear(); localStorage.setItem('portfolio-theme', theme); }, theme);
    await page.goto(base, { settleMs: 0 });
  };
  for (const theme of ['dark', 'light']) {
    for (const width of [320, 390, 1440]) {
      await page.setViewport({ width, height: 900 });
      await fresh(theme);
      const detail = await page.eval(() => {
        const d = document.querySelector('[data-startup]');
        const b = d?.getBoundingClientRect();
        const panel = d?.querySelector('.startup-panel').getBoundingClientRect();
        return { open: d?.open, modal: d?.matches(':modal'), focused: document.activeElement?.hasAttribute('data-startup-skip'), fits: panel?.left >= 0 && panel?.right <= innerWidth && d.scrollWidth <= innerWidth, bg: d && getComputedStyle(d).backgroundColor, body: getComputedStyle(document.body).backgroundColor, width: b?.width };
      });
      check(`${theme} ${width}px visible, focused, fits, matches theme`, detail.open && detail.modal && detail.focused && detail.fits && detail.bg === detail.body, detail);
      await page.screenshot({ path: `${out}/${theme}-${width}.png` });
      await page.eval(() => new Promise(resolve => setTimeout(resolve, 2100)));
      check(`${theme} ${width}px auto dismiss restores access`, await page.eval(() => !document.querySelector('[data-startup]') && !document.querySelector(':modal') && document.documentElement.scrollWidth <= innerWidth));
    }
  }
  await page.goto(base, { settleMs: 0 });
  check('reload does not replay', await page.eval(() => !document.querySelector('[data-startup]')));
  await fresh();
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  check('Escape dismisses dialog', await page.eval(() => !document.querySelector(':modal')));
  await fresh();
  await page.eval(() => document.querySelector('[data-startup-skip]').click());
  check('skip dismisses dialog', await page.eval(() => !document.querySelector(':modal')));
  await page.eval(() => sessionStorage.clear());
  await page.goto(base + '#work', { settleMs: 100 });
  check('deep link bypasses intro', await page.eval(() => !document.querySelector('[data-startup]')));
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await fresh();
  check('reduced motion bypasses intro', await page.eval(() => !document.querySelector('[data-startup]')));
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await page.send('Emulation.setScriptExecutionDisabled', { value: true });
  await page.goto(base, { settleMs: 100 });
  await page.send('Emulation.setScriptExecutionDisabled', { value: false });
  check('without JS dialog stays hidden, content available', await page.eval(() => document.querySelector('[data-startup]').hidden && !document.querySelector(':modal') && document.querySelector('#hero-title').getBoundingClientRect().height > 0));
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise(done => server.close(done));
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
}
