import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { renderHomePage } from '../scripts/render-home.mjs';

const root = resolve('.');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.webm': 'video/webm' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const results = [];
const check = (name, pass, detail = {}) => {
  results.push({ name, pass, ...detail });
  if (!pass) process.exitCode = 1;
};
try {
  check('homepage matches renderer', (await readFile('index.html', 'utf8')) === renderHomePage());
  browser = await Browser.launch();
  const page = await browser.newPage();
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const path of ['index.html', 'projects/skyfire.html', 'projects/maistra.html', 'projects/bulk-buying-companion.html', 'projects/pulso.html', 'projects/sige.html']) {
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 100 });
    await page.eval(async () => {
      for (const img of document.images) img.loading = 'eager';
      await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    });
    for (const width of path === 'index.html' ? [320, 390, 768, 1440] : [390, 1440]) {
      await page.setViewport({ width, height: 900 });
      const detail = await page.eval(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, brokenImages: [...document.images].filter(img => !img.naturalWidth).length }));
      check(`${path} at ${width}px`, !detail.overflow && detail.brokenImages === 0, detail);
    }
  }
  await page.setViewport({ width: 390, height: 900 });
  await page.goto(base, { timeoutMs: 10000, settleMs: 100 });
  const interactions = await page.eval(() => {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('#primary-navigation');
    toggle.click();
    const menuOpens = !menu.hidden && toggle.getAttribute('aria-expanded') === 'true';
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const escapeCloses = menu.hidden && document.activeElement === toggle;
    toggle.click(); menu.querySelector('a').click();
    const linkCloses = menu.hidden;
    const walkthrough = document.querySelector('.project-walkthrough');
    walkthrough.querySelector('summary').click();
    const walkthroughOpens = walkthrough.open && walkthrough.querySelector('video').controls;
    const validAnchors = [...document.querySelectorAll('a[href^="#"]')].every(a => document.getElementById(a.hash.slice(1)));
    return { menuOpens, escapeCloses, linkCloses, walkthroughOpens, validAnchors };
  });
  check('menu, keyboard, project links, walkthrough', Object.values(interactions).every(Boolean), interactions);
  const destinations = await page.eval(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(href => !/^(https?:|mailto:|#)/.test(href)));
  for (const path of new Set(destinations)) check(`local destination ${path}`, (await stat(resolve(root, path))).isFile());
  await page.send('Emulation.setScriptExecutionDisabled', { value: true });
  await page.goto(base, { timeoutMs: 10000, settleMs: 100 });
  const fallback = await page.eval(() => ({ visibleNavigation: !document.querySelector('#primary-navigation').hidden, projectCount: document.querySelectorAll('.work-entry, .additional-project').length, readable: [...document.querySelectorAll('.work-copy')].every(el => getComputedStyle(el).opacity === '1') }));
  check('no JavaScript fallback', fallback.visibleNavigation && fallback.projectCount === 5 && fallback.readable, fallback);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  await writeFile('.taste-skill/internship-functional.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}
