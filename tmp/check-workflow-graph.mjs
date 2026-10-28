import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep, join } from 'node:path';
import { tmpdir } from 'node:os';
import { renderHomePage } from '../scripts/render-home.mjs';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root = resolve('.'), out = join(tmpdir(), 'portfolio-workflow-finale');
await mkdir(out, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://local');
    if (url.pathname === '/__graph' || url.pathname === '/__finale') {
      // A frozen test response only, never written to a served project file.
      const finale = url.pathname === '/__finale';
      const html = renderHomePage().replace(/<script data-startup-controller>[\s\S]*?<\/script>/, `<script>const d=document.querySelector('[data-startup]');d.hidden=false;d.dataset.workflow='${finale ? 'complete' : 'running'}';d.dataset.step='${finale ? 'ready' : 'checks'}';${finale ? "d.dataset.phase='welcome';" : ''}d.showModal();document.querySelectorAll('[data-pipeline-stage]').forEach((n,i)=>n.dataset.state=${finale ? "'complete'" : "['complete','active','active','pending'][i]"});document.querySelector('[data-startup-status]').textContent='${finale ? 'Portfolio ready' : 'Building experiences'}';</script>`);
      res.setHeader('Content-Type', 'text/html'); return res.end(html);
    }
    const path = resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!path.startsWith(root + sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const results = [];
const check = (name, pass, detail) => { results.push({ name, pass, detail }); console.log(pass ? 'PASS' : 'FAIL', name, JSON.stringify(detail ?? '')); if (!pass) process.exitCode = 1; };
try {
  browser = await Browser.launch();
  const page = await browser.newPage();
  await page.goto(base + '/__graph', { settleMs: 100 });
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewport({ width, height: 900 });
      await page.eval(theme => document.documentElement.dataset.theme = theme, theme);
      await page.eval(() => document.fonts.ready);
      const detail = await page.eval(() => {
        const d = document.querySelector('[data-startup]');
        const links = [...document.querySelectorAll('.workflow-edges')].find(svg => getComputedStyle(svg).display !== 'none');
        const center = el => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
        const errors = [...links.querySelectorAll('path[data-from]')].map(path => {
          const from = document.querySelector(`[data-job="${path.dataset.from}"] .workflow-port--out`);
          const to = document.querySelector(`[data-job="${path.dataset.to}"] .workflow-port--in`);
          const a = path.getPointAtLength(0), b = path.getPointAtLength(path.getTotalLength());
          const p = new DOMPoint(a.x, a.y).matrixTransform(path.getScreenCTM());
          const q = new DOMPoint(b.x, b.y).matrixTransform(path.getScreenCTM());
          return Math.max(Math.hypot(p.x - center(from).x, p.y - center(from).y), Math.hypot(q.x - center(to).x, q.y - center(to).y));
        });
        // Ports deliberately protrude from the cards; measure text fit separately.
        const boxes = [...document.querySelectorAll('[data-pipeline-stage]')].map(el => { const b = el.getBoundingClientRect(); const fits = [...el.querySelectorAll('h3, .pipeline-description, .pipeline-meta')].filter(n => getComputedStyle(n).display !== 'none').every(n => { const r = n.getBoundingClientRect(); return r.left >= b.left && r.right <= b.right && r.top >= b.top && r.bottom <= b.bottom && n.scrollWidth <= n.clientWidth; }); return { x: b.x, right: b.right, width: b.width, fits }; });
        const bounds = d.getBoundingClientRect();
        return { modal: d.matches(':modal'), overflow: d.scrollWidth > d.clientWidth, boundsFit: bounds.left >= 0 && bounds.right <= innerWidth, errors, boxes, bg: getComputedStyle(d).backgroundColor, home: getComputedStyle(document.body).backgroundColor };
      });
      check(`${theme} ${width}px: ports aligned, cards fit, homepage background`, detail.modal && !detail.overflow && detail.boundsFit && detail.errors.every(n => n <= 2) && detail.boxes.every(b => b.x >= 0 && b.right <= width && b.fits) && detail.bg === detail.home, detail);
      if ([390, 1440].includes(width)) await page.screenshot({ path: `${out}/${theme}-${width}.png` });
    }
  }
  for (const theme of ['light', 'dark']) {
    await page.goto(base + '/__finale', { settleMs: 100 });
    await page.eval(theme => document.documentElement.dataset.theme = theme, theme);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewport({ width, height: 900 });
      await page.eval(async () => { await document.fonts.ready; await Promise.allSettled(document.querySelector('[data-startup]').getAnimations({ subtree: true }).filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished)); });
      const finale = await page.eval(() => {
        const name = document.querySelector('.startup-welcome strong').getBoundingClientRect();
        const copy = document.querySelector('.startup-finale-description').getBoundingClientRect();
        return { visible: getComputedStyle(document.querySelector('.startup-finale')).opacity === '1', nameFits: name.left >= 0 && name.right <= innerWidth && name.top >= 0 && copy.bottom <= innerHeight, graphRecedes: Number(getComputedStyle(document.querySelector('.workflow-graph')).opacity) < 0.2 };
      });
      check(`${theme} ${width}px personal finale visible and fits`, finale.visible && finale.nameFits && finale.graphRecedes, finale);
      await page.screenshot({ path: `${out}/finale-${theme}-${width}.png` });
    }
  }
  await page.goto(base + '/index.html', { settleMs: 0 });
  await page.eval(() => new Promise(done => setTimeout(done, 5300)));
  check('real startup completes and removes modal', await page.eval(() => !document.querySelector('[data-startup]') && !document.querySelector(':modal')));
} finally {
  await browser?.close(); server.closeAllConnections(); await new Promise(done => server.close(done));
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log('Screenshots:', out);
}
