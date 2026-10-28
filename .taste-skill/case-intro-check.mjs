import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const stage = process.argv[2] || 'after';
const out = `.taste-skill/case-intro/${stage}`;
await mkdir(out, { recursive: true });
const root = resolve('.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm' };
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
const results = [];
try {
  const page = await browser.newPage();
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
    await page.goto(`http://127.0.0.1:${server.address().port}/projects/${slug}.html`, { settleMs: 100 });
    await page.eval(() => document.fonts.ready);
    for (const theme of ['dark', 'light']) {
      await page.eval(theme => document.documentElement.dataset.theme = theme, theme);
      for (const width of [320, 390, 768, 1440, 1820]) {
        await page.setViewport({ width, height: 1000 });
        const detail = await page.eval(() => {
          const box = selector => document.querySelector(selector).getBoundingClientRect();
          const title = box('.case-title-block'), dossier = box('.case-dossier'), media = box('.case-lead-media');
          const rows = [...document.querySelectorAll('.case-dossier > div')].map(el => {
            const label = el.querySelector('dt').getBoundingClientRect(), value = el.querySelector('dd').getBoundingClientRect();
            return { gap: value.top - label.bottom, readable: value.left >= 0 && value.right <= innerWidth, stacked: value.top >= label.bottom - 1 };
          });
          const description = document.querySelector('.case-description');
          return { description: description?.textContent, overflow: document.documentElement.scrollWidth > innerWidth, titleGap: dossier.top - title.bottom, mediaGap: media.top - dossier.bottom, rows, controls: document.querySelector('video').controls };
        });
        const pass = !!detail.description && !detail.overflow && detail.titleGap <= 25 && detail.mediaGap <= 25 && detail.rows.every(row => row.readable && row.stacked && row.gap <= 8) && detail.controls;
        results.push({ slug, theme, width, pass, ...detail });
        if (stage === 'after' && !pass) { process.exitCode = 1; console.log('FAIL', slug, theme, width, JSON.stringify(detail)); }
        if (['skyfire', 'pulso'].includes(slug) && theme === 'dark' && [390, 768, 1820].includes(width)) {
          await page.screenshot({ path: `${out}/${slug}-${width}.png` });
        }
      }
    }
  }
  console.log(JSON.stringify({ stage, checks: results.length, passing: results.filter(r => r.pass).length, example: results.find(r => r.slug === 'skyfire' && r.width === 1820) }, null, 2));
} finally {
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
  server.closeAllConnections();
  await new Promise(done => server.close(done));
}
