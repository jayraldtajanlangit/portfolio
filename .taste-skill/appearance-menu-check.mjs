import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root = resolve('.'), results = [];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream'); res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const check = (name, pass, detail = {}) => { results.push({ name, pass, ...detail }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) process.exitCode = 1; };
const browser = await Browser.launch();
try {
  const page = await browser.newPage({ width: 1440, height: 900 });
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs', { urls: ['*fontshare.com*', '*fonts.googleapis.com*', '*fonts.gstatic.com*'] });
  const frames = () => page.eval(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const key = async key => { await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key }); await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key }); };
  const choose = mode => page.eval(mode => { document.querySelector('[data-theme-trigger]').click(); document.querySelector(`[data-theme-option="${mode}"]`).click(); }, mode);
  for (const path of ['index.html', '.taste-skill/editorial-concept/index.html', 'projects/maistra.html']) {
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 150 });
    const ready = await page.eval(() => !!document.querySelector('[data-theme-trigger]') && !document.querySelector('select[data-theme-select]'));
    check(`${path}: custom theme button replaces native select`, ready);
    if (!ready) continue;
    await choose('system');
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] }); await frames();
    check(`${path}: System follows device appearance`, await page.eval(() => document.documentElement.dataset.theme === 'dark' && document.querySelector('[data-theme-option="system"]').getAttribute('aria-checked') === 'true'));
    for (const mode of ['light', 'dark', 'system']) {
      await choose(mode);
      await page.eval(() => new Promise(resolve => setTimeout(resolve, 350)));
      const state = await page.eval(mode => ({ selected: document.documentElement.dataset.themeMode === mode && document.querySelector(`[data-theme-option="${mode}"]`).getAttribute('aria-checked') === 'true', saved: localStorage.getItem('portfolio-theme') === mode, closed: document.querySelector('[data-theme-menu]').hidden && document.querySelector('[data-theme-trigger]').getAttribute('aria-expanded') === 'false', icon: getComputedStyle(document.querySelector(`.theme-icon [data-theme-icon="${mode}"]`)).opacity === '1' }), mode);
      check(`${path}: choosing ${mode} applies, saves, and closes`, Object.values(state).every(Boolean), state);
    }
    await page.eval(() => document.querySelector('[data-theme-trigger]').focus());
    await key('ArrowDown'); await key('Home'); await key('ArrowDown');
    check(`${path}: arrow keys navigate the menu`, await page.eval(() => document.activeElement.dataset.themeOption === 'dark'));
    await key('Escape');
    check(`${path}: Escape closes and restores focus`, await page.eval(() => document.querySelector('[data-theme-menu]').hidden && document.activeElement.matches('[data-theme-trigger]')));
    await page.eval(() => document.querySelector('[data-theme-trigger]').click());
    await page.eval(() => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    check(`${path}: outside click dismisses menu`, await page.eval(() => document.querySelector('[data-theme-menu]').hidden));
    await choose('light');
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 150 });
    check(`${path}: reload preserves Light`, await page.eval(() => document.documentElement.dataset.theme === 'light' && document.querySelector('[data-theme-option="light"]').getAttribute('aria-checked') === 'true'));
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewport({ width, height: 900 });
      await page.eval(() => document.querySelector('[data-theme-trigger]').click());
      const fits = await page.eval(() => { const box = document.querySelector('[data-theme-menu]').getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth; });
      check(`${path}: open menu fits ${width}px`, fits);
      await key('Escape');
    }
    if (path.includes('editorial')) {
      for (const mode of ['light', 'dark']) {
        await choose(mode);
        await page.eval(() => document.querySelector('[data-theme-trigger]').click());
        await page.eval(() => new Promise(resolve => setTimeout(resolve, 350)));
        await page.screenshot({ path: `.taste-skill/editorial-concept/menu-${mode}.jpg` });
        await key('Escape');
      }
      await page.setViewport({ width: 390, height: 844 });
      await page.eval(() => document.querySelector('[data-theme-trigger]').click());
      await page.eval(() => new Promise(resolve => setTimeout(resolve, 200)));
      await page.screenshot({ path: '.taste-skill/editorial-concept/menu-phone.jpg' });
      await key('Escape');
      await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }); await frames();
      check('reduced motion disables icon and menu animation', await page.eval(() => { document.querySelector('[data-theme-trigger]').click(); return getComputedStyle(document.querySelector('.theme-icon svg')).transitionDuration === '0s' && getComputedStyle(document.querySelector('[data-theme-menu]')).animationName === 'none'; }));
    }
  }
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve));
  await writeFile('.taste-skill/appearance-menu-results.json', JSON.stringify(results, null, 2));
}
