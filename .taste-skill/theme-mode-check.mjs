import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const root = resolve('.');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.webm': 'video/webm' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const results = [];
const check = (name, pass, detail = {}) => { results.push({ name, pass, ...detail }); if (!pass) process.exitCode = 1; };
const luminance = color => {
  const c = color.match(/[\d.]+/g).slice(0, 3).map(value => Number(value) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
};
const contrast = (foreground, background) => {
  const a = luminance(foreground), b = luminance(background);
  return Number(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2));
};
const browser = await Browser.launch();
try {
  const page = await browser.newPage();
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs', { urls: ['*api.fontshare.com*', '*cdn.fontshare.com*', '*fonts.googleapis.com*', '*fonts.gstatic.com*'] });
  const media = async value => {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value }] });
    // A media-query change event is delivered during rendering, after the CDP reply.
    await page.eval(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const state = async () => page.eval(() => ({ theme: document.documentElement.dataset.theme, mode: document.documentElement.dataset.themeMode, background: getComputedStyle(document.body).backgroundColor, saved: localStorage.getItem('portfolio-theme'), overflow: document.documentElement.scrollWidth > innerWidth }));
  const choose = async value => page.eval(value => { document.querySelector('[data-theme-trigger]').click(); document.querySelector(`[data-theme-option="${value}"]`).click(); }, value);
  for (const path of ['index.html', '.taste-skill/editorial-concept/index.html']) {
    await media('light');
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 100 });
    const control = await page.eval(() => {
      const el = document.querySelector('[data-theme-trigger]');
      return Boolean(el && !el.closest('[hidden]') && ['light', 'dark', 'system'].every(value => document.querySelector(`[data-theme-option="${value}"]`)));
    });
    check(`${path}: usable Light, Dark, System selector`, control);
    if (!control) continue;
    for (const mode of ['light', 'dark', 'system']) {
      await choose(mode);
      await page.eval(() => new Promise(resolve => setTimeout(resolve, 400)));
      const icon = await page.eval(mode => {
        const icons = [...document.querySelectorAll('.theme-icon svg')];
        const visible = icons.filter(icon => Number(getComputedStyle(icon).opacity) > .99);
        return { matching: visible.length === 1 && visible[0].dataset.themeIcon === mode, animated: icons.length === 3 && icons.every(icon => parseFloat(getComputedStyle(icon).transitionDuration) > 0) };
      }, mode);
      check(`${path}: ${mode} has its own animated icon`, icon.matching && icon.animated, icon);
    }
    check(`${path}: typing playback button is removed`, await page.eval(() => !document.querySelector('[data-typing-toggle]')));
    await choose('light');
    await page.eval(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    check(`${path}: switching mode animates the icon`, await page.eval(() => document.getAnimations().some(animation => animation.effect?.target?.closest('.theme-icon') && animation.playState === 'running')));
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await choose('dark');
    check(`${path}: reduced motion disables icon transitions`, await page.eval(() => [...document.querySelectorAll('.theme-icon svg')].every(icon => getComputedStyle(icon).transitionDuration === '0s')));
    await media('light');
    await page.eval(() => localStorage.removeItem('portfolio-theme'));
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 100 });
    let current = await state();
    const lightBackground = current.background;
    check(`${path}: default follows light system`, current.theme === 'light' && current.mode === 'system', current);
    await media('dark'); current = await state();
    check(`${path}: system reacts live to dark`, current.theme === 'dark' && current.mode === 'system' && current.background !== lightBackground, current);
    await choose('light'); current = await state();
    check(`${path}: explicit light overrides dark system`, current.theme === 'light' && current.saved === 'light' && current.background === lightBackground, current);
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 100 }); current = await state();
    check(`${path}: explicit selection survives reload`, current.theme === 'light' && current.mode === 'light', current);
    await choose('dark'); await media('light'); current = await state();
    check(`${path}: explicit dark overrides light system`, current.theme === 'dark' && current.saved === 'dark', current);
    await choose('system'); current = await state();
    check(`${path}: returning to System uses current device setting`, current.theme === 'light' && current.mode === 'system' && current.saved === 'system', current);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewport({ width, height: 900 }); current = await state();
      check(`${path}: mode control fits at ${width}px`, !current.overflow, current);
    }
    await page.eval(() => localStorage.setItem('portfolio-theme', 'invalid-value'));
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 100 }); current = await state();
    check(`${path}: invalid saved mode falls back to System`, current.theme === 'light' && current.mode === 'system', current);
    if (path.includes('editorial')) {
      await page.setViewport({ width: 1440, height: 900 });
      for (const mode of ['light', 'dark']) { await choose(mode); await page.screenshot({ path: `.taste-skill/editorial-concept/${mode}-mode.jpg` }); }
      await page.setViewport({ width: 390, height: 844 });
      await page.screenshot({ path: '.taste-skill/editorial-concept/dark-mode-phone.jpg' });
    }
  }
  for (const slug of ['maistra', 'skyfire', 'bulk-buying-companion', 'pulso', 'sige']) {
    await page.goto(`${base}/projects/${slug}.html`, { timeoutMs: 10000, settleMs: 100 });
    const result = await page.eval(() => ({ theme: document.documentElement.dataset.theme, mode: document.documentElement.dataset.themeMode, overflow: document.documentElement.scrollWidth > innerWidth }));
    check(`${slug}: saved dark mode works on case study`, result.theme === 'dark' && result.mode === 'dark' && !result.overflow, result);
    const pairs = await page.eval(() => [
      ['System description', '.system-flow p', '.case-section--system'],
      ['Media caption', '.case-lead-media figcaption', '.case-lead-media'],
      ['Next project label', '.next-project a > span:first-child', '.next-project'],
      ['Footer', '.site-footer p', '.site-footer'],
    ].map(([name, text, field]) => ({ name, foreground: getComputedStyle(document.querySelector(text)).color, background: getComputedStyle(document.querySelector(field)).backgroundColor })));
    const measured = pairs.map(pair => ({ ...pair, ratio: contrast(pair.foreground, pair.background) }));
    check(`${slug}: dark section text contrast`, measured.every(pair => pair.ratio >= 4.5), { measured });
  }
  const blocked = await browser.newPage({ width: 390, height: 844 });
  await blocked.send('Page.addScriptToEvaluateOnNewDocument', { source: `Storage.prototype.getItem = Storage.prototype.setItem = function(){throw new DOMException('Blocked', 'SecurityError')};` });
  await blocked.goto(`${base}/.taste-skill/editorial-concept/index.html`, { timeoutMs: 10000, settleMs: 100 });
  const blockedResult = await blocked.eval(() => { const button = document.querySelector('[data-theme-trigger]'); if (!button) return false; button.click(); document.querySelector('[data-theme-option="dark"]').click(); return document.documentElement.dataset.theme === 'dark' && !button.closest('[hidden]'); });
  check('theme remains usable when storage is unavailable', blockedResult);
  const fallback = await browser.newPage({ width: 390, height: 844 });
  await fallback.send('Emulation.setScriptExecutionDisabled', { value: true });
  await fallback.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await fallback.goto(`${base}/.taste-skill/editorial-concept/index.html`, { timeoutMs: 10000, settleMs: 100 });
  const noScript = await fallback.eval(() => ({ dark: getComputedStyle(document.body).backgroundColor === 'rgb(23, 23, 23)', hiddenControl: document.querySelector('[data-theme-trigger]')?.closest('[hidden]') !== null }));
  check('without JavaScript the concept follows system dark mode', noScript.dark && noScript.hiddenControl, noScript);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  await writeFile('.taste-skill/theme-mode-results.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}
