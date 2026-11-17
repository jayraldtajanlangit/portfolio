import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('.'), out = resolve('.taste-skill/theme-reveal');
await mkdir(out, { recursive: true });
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
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await Browser.launch(), results = [];
const check = (label, pass, detail) => { results.push({ label, pass, detail }); console.log(pass ? 'PASS' : 'FAIL', label, JSON.stringify(detail || '')); if (!pass) process.exitCode = 1; };
try {
  const page = await browser.newPage();
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  for (const [path, width] of [['index.html', 1440], ['index.html', 390], ['projects/skyfire.html', 1440]]) {
    await page.setViewport({ width, height: 900 });
    await page.goto(`${base}/${path}#top`, { settleMs: 300 });
    await page.eval(() => { localStorage.setItem('portfolio-theme', 'light'); window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio-theme', newValue: 'light' })); });
    await page.eval(() => document.fonts.ready);
    await page.eval(() => { scrollTo({ top: 0, behavior: 'instant' }); document.querySelectorAll('video').forEach(video => video.pause()); });
    for (const target of ['dark', 'light']) {
      const detail = await page.eval(async () => {
        const before = scrollY;
        document.querySelector('[data-theme-trigger]').click();
        let animation;
        for (let frame = 0; frame < 90; frame++) {
          animation = document.getAnimations().find(animation => animation.animationName === 'theme-reveal');
          if (animation) break;
          await new Promise(requestAnimationFrame);
        }
        if (!animation) return { animated: false, theme: document.documentElement.dataset.theme };
        animation.pause(); animation.currentTime = 150;
        window.__themeCheckAnimation = animation;
        return { animated: true, theme: document.documentElement.dataset.theme, duration: animation.effect.getTiming().duration, clip: getComputedStyle(document.documentElement, '::view-transition-new(root)').clipPath, origin: document.documentElement.style.getPropertyValue('--theme-reveal-x'), scrollStable: scrollY === before };
      });
      check(`${path} ${width}px reveal to ${target}`, detail.animated && detail.theme === target && detail.scrollStable && detail.duration === 480 && detail.clip.startsWith('circle('), detail);
      if (!process.argv.includes('--quick')) await page.screenshot({ path: `${out}/${path.replaceAll('/', '-').replace('.html', '')}-${width}-${target}-mid.jpg` });
      await page.eval(async () => { const animation = window.__themeCheckAnimation; if (animation) { animation.finish(); await animation.finished; } });
      await page.eval(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      check(`${width}px ${target} transition cleans up`, await page.eval(() => !document.documentElement.dataset.themeTransition));
    }
  }
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const reduced = await page.eval(() => { document.querySelector('[data-theme-trigger]').click(); return { theme: document.documentElement.dataset.theme, running: !!document.documentElement.dataset.themeTransition, animated: document.getAnimations().some(animation => animation.animationName === 'theme-reveal') }; });
  check('reduced motion switches immediately', reduced.theme === 'dark' && !reduced.running && !reduced.animated, reduced);
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await page.eval(() => { const button = document.querySelector('[data-theme-trigger]'); button.click(); button.click(); button.click(); });
  await page.eval(() => new Promise(resolve => setTimeout(resolve, 650)));
  const rapid = await page.eval(() => ({ theme: document.documentElement.dataset.theme, saved: localStorage.getItem('portfolio-theme'), running: !!document.documentElement.dataset.themeTransition }));
  check('rapid input preserves the final theme', rapid.theme === 'light' && rapid.saved === 'light' && !rapid.running, rapid);
  await page.eval(() => document.querySelector('[data-theme-trigger]').focus());
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await page.eval(() => new Promise(resolve => setTimeout(resolve, 650)));
  const keyboard = await page.eval(() => ({ theme: document.documentElement.dataset.theme, saved: localStorage.getItem('portfolio-theme'), focus: document.activeElement.outerHTML.slice(0, 180) }));
  check('keyboard toggle works and retains focus', keyboard.theme === 'dark' && keyboard.focus.includes('data-theme-trigger'), keyboard);
} finally { await browser.close(); server.closeAllConnections(); await new Promise(done => server.close(done)); }
await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
