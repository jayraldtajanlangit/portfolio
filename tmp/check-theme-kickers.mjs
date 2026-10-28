import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { join, resolve, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const root = resolve('.');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await Browser.launch();
try {
  const page = await browser.newPage();
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await page.goto(`http://127.0.0.1:${server.address().port}/#about`, { settleMs: 100 });
  await page.eval(() => document.fonts.ready);
  for (const theme of ['light', 'dark']) {
    await page.eval(value => document.documentElement.dataset.theme = value, theme);
    for (const width of [320, 1440]) {
      await page.setViewport({ width, height: 1000 });
      const labels = await page.eval(() => [...document.querySelectorAll('.section-kicker')].map(el => ({ text: el.textContent, size: getComputedStyle(el).fontSize })));
      const pass = labels.length === 4 && labels.every(label => label.size === '11px');
      console.log(pass ? 'PASS' : 'FAIL', theme, width, JSON.stringify(labels));
      if (!pass) process.exitCode = 1;
      await page.eval(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: join(tmpdir(), 'portfolio-theme-refinement', `${theme}-${width}-top.png`) });
      if (width === 1440) {
        await page.eval(() => document.querySelector('#contact').scrollIntoView({ behavior: 'instant' }));
        await page.screenshot({ path: join(tmpdir(), 'portfolio-theme-refinement', `${theme}-contact.png`) });
      }
    }
  }
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise(done => server.close(done));
}
