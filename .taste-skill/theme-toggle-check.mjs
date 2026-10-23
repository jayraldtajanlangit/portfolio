import { createServer } from 'node:http';
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root = resolve('.'), out = '.taste-skill/theme-toggle-final', results = [];
await mkdir(out, { recursive: true });
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.ttf':'font/ttf', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.mp4':'video/mp4', '.webm':'video/webm' };
const server = createServer(async (req,res) => {
  try {
    let path = resolve(root, '.' + new URL(req.url, 'http://local').pathname);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream'); res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await Browser.launch();
const check = (name, pass, detail) => { results.push({name,pass,detail}); console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`); if (!pass) process.exitCode = 1; };
try {
  const page = await browser.newPage();
  const base = `http://127.0.0.1:${server.address().port}`;
  const key = async (key, code, virtual) => { await page.send('Input.dispatchKeyEvent', {type:'keyDown',key,code,windowsVirtualKeyCode:virtual, ...(key === 'Enter' ? { text:'\r' } : {})}); await page.send('Input.dispatchKeyEvent', {type:'keyUp',key,code,windowsVirtualKeyCode:virtual}); };
  const choose = mode => page.eval(mode => { if (document.documentElement.dataset.theme !== mode) document.querySelector('[data-theme-trigger]').click(); }, mode);
  const paths = ['index.html', ...['maistra','skyfire','bulk-buying-companion','pulso','sige'].map(slug => `projects/${slug}.html`), '.taste-skill/editorial-concept/index.html'];
  for (const path of paths) {
    await page.goto(`${base}/${path}`, { settleMs: 150 });
    const control = await page.eval(() => { const button = document.querySelector('[data-theme-trigger]'); return !!button && !button.closest('[hidden]') && button.getAttribute('role') === 'switch' && button.getAttribute('aria-label') === 'Dark mode' && !document.querySelector('[data-theme-menu],[data-theme-option]'); });
    check(`${path}: switch is visible and dropdown is removed`, control);
    await choose('light');
    await page.eval(() => document.querySelector('[data-theme-trigger]').focus());
    await key(' ', 'Space', 32);
    check(`${path}: Space enables and saves dark mode`, await page.eval(() => document.documentElement.dataset.theme === 'dark' && document.querySelector('[data-theme-trigger]').getAttribute('aria-checked') === 'true' && localStorage.getItem('portfolio-theme') === 'dark'));
    await key('Enter', 'Enter', 13);
    const entered = await page.eval(() => ({ theme: document.documentElement.dataset.theme, focused: document.activeElement.matches('[data-theme-trigger]'), checked: document.querySelector('[data-theme-trigger]').getAttribute('aria-checked') }));
    check(`${path}: Enter returns to light mode without losing focus`, entered.theme === 'light' && entered.focused && entered.checked === 'false', entered);
    for (const width of [320,390,768,1440]) {
      await page.setViewport({ width, height: 900 });
      const fits = await page.eval(() => { const box = document.querySelector('[data-theme-trigger]').getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth && box.height >= 44 && box.width >= 44 && document.documentElement.scrollWidth <= innerWidth; });
      check(`${path}: header and switch fit ${width}px`, fits);
    }
    if (['index.html','projects/maistra.html'].includes(path)) {
      for (const mode of ['light','dark']) {
        await choose(mode);
        for (const width of [390,1440]) {
          await page.setViewport({ width, height: 500 });
          await page.eval(() => { document.activeElement?.blur(); scrollTo({top:0,behavior:'instant'}); return new Promise(resolve=>setTimeout(resolve,300)); });
          await page.screenshot({ path: `${out}/${path==='index.html'?'home':'case'}-${mode}-${width}.jpg` });
        }
      }
    }
  }
  await choose('dark');
  await page.goto(base + '/index.html', { settleMs: 100 });
  check('navigation preserves the saved dark preference', await page.eval(() => document.documentElement.dataset.theme === 'dark'));
  await page.eval(() => localStorage.removeItem('portfolio-theme'));
  await page.send('Emulation.setEmulatedMedia', { features: [{name:'prefers-color-scheme',value:'dark'}, {name:'prefers-reduced-motion',value:'reduce'}] });
  await page.goto(base + '/index.html', { settleMs: 100 });
  check('first visit follows device dark mode and reduces thumb motion', await page.eval(() => document.documentElement.dataset.theme === 'dark' && document.querySelector('[data-theme-trigger]').getAttribute('aria-checked') === 'true' && getComputedStyle(document.querySelector('.theme-thumb')).transitionDuration === '0s'));
  await choose('light');
  await page.goto(base + '/index.html', { settleMs: 100 });
  check('saved light mode overrides device dark mode on reload', await page.eval(() => document.documentElement.dataset.theme === 'light' && document.querySelector('[data-theme-trigger]').getAttribute('aria-checked') === 'false'));
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(window, 'localStorage', {get() {throw new Error('Storage denied');}});` });
  await page.goto(base + '/index.html', { settleMs: 100 });
  await choose('light');
  check('storage denial leaves the switch usable', await page.eval(() => document.documentElement.dataset.theme === 'light' && !document.querySelector('.theme-control').hidden));
} finally {
  await browser.close(); await new Promise(resolve=>server.close(resolve));
  await writeFile(`${out}/results.json`, JSON.stringify(results,null,2));
}
