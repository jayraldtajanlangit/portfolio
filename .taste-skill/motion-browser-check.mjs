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
    res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream'); res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`, results = [];
const check = (name, pass, detail = {}) => { results.push({ name, pass, ...detail }); if (!pass) process.exitCode = 1; };
const browser = await Browser.launch();
try {
  const page = await browser.newPage({ width: 1440, height: 900 });
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs', { urls: ['*api.fontshare.com*', '*cdn.fontshare.com*', '*fonts.googleapis.com*', '*fonts.gstatic.com*'] });
  for (const path of ['index.html', '.taste-skill/editorial-concept/index.html']) {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }, { name: 'prefers-color-scheme', value: 'light' }] });
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 100 });
    const initial = await page.eval(() => ({ typing: document.documentElement.classList.contains('typing-enhanced'), motion: document.documentElement.classList.contains('portfolio-motion'), noSeeking: !/seeking an internship|looking for a .*internship/i.test(document.body.innerText) }));
    check(`${path}: interests replace internship headline and motion initializes`, Object.values(initial).every(Boolean), initial);
    const cycling = await page.eval(async () => {
      const target = document.querySelector('[data-typing-words]'), seen = new Set(), tops = [];
      const phrases = JSON.parse(target.dataset.typingWords), start = performance.now();
      return new Promise(resolve => {
        const timer = setInterval(() => {
          if (phrases.includes(target.textContent)) seen.add(target.textContent);
          tops.push(document.querySelector('.actions, .intro-actions').getBoundingClientRect().top);
          if (seen.size === phrases.length || performance.now() - start > 14000) {
            clearInterval(timer);
            resolve({ seen: [...seen], stable: Math.max(...tops.slice(20)) - Math.min(...tops.slice(20)) < 1.5 });
          }
        }, 60);
      });
    });
    check(`${path}: all three interests type and erase`, cycling.seen.length === 3, cycling);
    check(`${path}: typing does not move the actions`, cycling.stable, cycling);
    check(`${path}: typing continues without a playback button`, await page.eval(() => !document.querySelector('[data-typing-toggle]') && document.documentElement.classList.contains('typing-enhanced')));
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewport({ width, height: 900 });
      const fits = await page.eval(() => document.documentElement.scrollWidth <= innerWidth);
      check(`${path}: fits at ${width}px`, fits);
    }
    if (path.includes('editorial')) {
      await page.eval(() => { window.scrollTo(0, 0); document.querySelector('[data-theme-trigger]').click(); document.querySelector('[data-theme-option="dark"]').click(); });
      await page.screenshot({ path: '.taste-skill/editorial-concept/typing-dark.jpg' });
      await page.setViewport({ width: 390, height: 844 });
      await page.screenshot({ path: '.taste-skill/editorial-concept/typing-phone.jpg' });
    }
    await page.eval(() => document.querySelector('.about, .about-section').scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.eval(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const entering = await page.eval(() => ({ running: document.getAnimations().some(animation => animation.effect?.target?.closest('.about, .about-section') && animation.playState === 'running'), scrollY, sectionTop: document.querySelector('.about, .about-section').getBoundingClientRect().top }));
    check(`${path}: scrolling triggers section entrances`, entering.running, entering);
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await page.eval(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const reduced = await page.eval(() => ({ static: getComputedStyle(document.querySelector('.typing-static')).position === 'static', hiddenVisual: getComputedStyle(document.querySelector('.typing-visual')).display === 'none', noEntrances: !document.documentElement.classList.contains('portfolio-motion'), fullCopy: document.querySelector('.typing-static').textContent.includes('mobile apps, and web apps') }));
    check(`${path}: reduced motion shows all interests without movement`, Object.values(reduced).every(Boolean), reduced);
  }
  const fallback = await browser.newPage({ width: 390, height: 844 });
  await fallback.send('Emulation.setScriptExecutionDisabled', { value: true });
  await fallback.goto(`${base}/.taste-skill/editorial-concept/index.html`, { timeoutMs: 10000, settleMs: 100 });
  const noScript = await fallback.eval(() => ({ staticVisible: getComputedStyle(document.querySelector('.typing-static')).position === 'static', visualHidden: getComputedStyle(document.querySelector('.typing-visual')).display === 'none', headingVisible: getComputedStyle(document.querySelector('h1')).opacity === '1' }));
  check('without JavaScript the introduction stays readable', Object.values(noScript).every(Boolean), noScript);
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve));
  await writeFile('.taste-skill/motion-results.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}
