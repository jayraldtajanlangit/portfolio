import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, sep, extname } from 'node:path';

const stage = process.argv[2] || 'after';
const out = new URL(`../.taste-skill/color-layers/${stage}/`, import.meta.url);
await mkdir(out, { recursive: true });
const root = resolve('.');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const server = createServer((req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!path.startsWith(root + sep)) return res.writeHead(403).end();
    res.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream', 'content-length': statSync(path).size });
    createReadStream(path).pipe(res);
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await Browser.launch();
const results = [];
try {
  const page = await browser.newPage({ reducedMotion: true });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html#main`, { settleMs: 300 });
  await page.eval(() => document.fonts.ready);
  for (const theme of ['light', 'dark']) {
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewport({ width, height: 900 });
      await page.eval(theme => { document.documentElement.dataset.theme = theme; document.querySelectorAll('video').forEach(video => video.pause()); }, theme);
      const detail = await page.eval(() => {
        const selectors = ['.portfolio-header', '.intro-section', '.tech-section', '.about-section', '.contact-section', '.selected-project--skyfire', '.selected-project--maistra', '.selected-project--bulk-buying-companion', '.selected-project--pulso', '.selected-project--sige'];
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          pairedProjects: (() => {
            const a = document.querySelector('#project-skyfire').getBoundingClientRect();
            const b = document.querySelector('#project-maistra').getBoundingClientRect();
            const next = document.querySelector('.selected-projects-mobile').getBoundingClientRect();
            const previews = [...document.querySelectorAll('.selected-project--featured video, .selected-project--wide video')].map(video => video.getBoundingClientRect());
            return {
              correctLayout: innerWidth > 767 ? Math.abs(a.top - b.top) < 2 && a.right < b.left : b.top >= a.bottom,
              alignedHeights: innerWidth <= 767 || Math.abs(a.height - b.height) < 2,
              previewsCompact: previews.every(rect => rect.height <= 321),
              nextRowBelow: next.top >= Math.max(a.bottom, b.bottom),
              cardHeight: Math.round(a.height),
              previewHeight: Math.round(previews[0].height),
            };
          })(),
          surfaces: Object.fromEntries(selectors.map(selector => [selector, getComputedStyle(document.querySelector(selector)).backgroundColor])),
          projects: [...document.querySelectorAll('.selected-project')].every(el => { const box = el.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth; }),
          text: ['.hero-name', '.intro-role', '.intro-description > p:last-child', '.tech-stack-group h3', '.about-copy > p', '.about-links a', '.contact-intro > p:not(.section-kicker)', '.contact-compose', '.selected-project-summary', '.selected-project-contribution', '.selected-project-chip', '.selected-project-case-study'].flatMap(selector => [...document.querySelectorAll(selector)].map(el => {
            const style = getComputedStyle(el);
            let parent = el, background;
            while (parent) { background = getComputedStyle(parent).backgroundColor; if (background !== 'rgba(0, 0, 0, 0)') break; parent = parent.parentElement; }
            return { selector, color: style.color, background };
          })),
        };
      });
      const rgb = value => {
        if (value.startsWith('color(srgb')) return value.match(/[\d.]+/g).slice(0, 3).map(Number);
        return value.match(/[\d.]+/g).slice(0, 3).map(v => Number(v) / 255);
      };
      const lum = value => rgb(value).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      detail.text.forEach(pair => { const a = lum(pair.color), b = lum(pair.background); pair.contrast = +((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2); });
      const pass = !detail.overflow && detail.projects && Object.entries(detail.pairedProjects).filter(([key]) => !['cardHeight', 'previewHeight'].includes(key)).every(([,value]) => value) && detail.text.every(pair => pair.contrast >= (pair.selector === '.hero-name' ? 3 : 4.5));
      results.push({ theme, width, pass, ...detail });
      console.log(`${pass ? 'PASS' : 'FAIL'} ${theme} ${width}px: layout, contrast and compact paired projects`, JSON.stringify(detail.pairedProjects));
      for (const [label, selector] of [['hero', '.portfolio-header'], ['projects', '#work'], ['mobile-previews', '.selected-projects-mobile'], ['tech', '#tech-stack'], ['about', '#about'], ['contact', '#contact']]) {
        await page.eval(selector => document.querySelector(selector).scrollIntoView({ behavior: 'instant' }), selector);
        await page.screenshot({ path: fileURLToPath(new URL(`${theme}-${width}-${label}.jpg`, out)) });
      }
      await page.screenshot({ path: fileURLToPath(new URL(`${theme}-${width}-full.jpg`, out)), fullPage: true });
    }
  }
} finally { await browser.close(); server.closeAllConnections(); await new Promise(done => server.close(done)); }
await writeFile(new URL('results.json', out), JSON.stringify(results, null, 2));
if (results.some(result => !result.pass)) process.exitCode = 1;
