import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root = resolve('.'), results = [];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.webm': 'video/webm', '.mp4': 'video/mp4' };
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
const check = (name, pass, detail = {}) => { results.push({ name, pass, ...detail }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${pass ? '' : ' ' + JSON.stringify(detail)}`); if (!pass) process.exitCode = 1; };
const browser = await Browser.launch();
try {
  const page = await browser.newPage({ width: 1440, height: 900 });
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs', { urls: ['https://*', 'http://api.*'] });
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const paths = ['index.html', '.taste-skill/editorial-concept/index.html', ...['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige'].map(slug => `projects/${slug}.html`)];
  for (const path of paths) {
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 100 });
    const fonts = await page.eval(async () => { await document.fonts.ready; return { body: getComputedStyle(document.body).fontFamily, heading: getComputedStyle(document.querySelector('h1')).fontFamily, loaded: [...document.fonts].filter(face => face.status === 'loaded').map(face => face.family.replace(/["']/g, '')) }; });
    check(`${path}: both local fonts load with outside services blocked`, fonts.body.includes('Manrope') && fonts.heading.includes('Bodoni Moda') && fonts.loaded.includes('Manrope') && fonts.loaded.includes('Bodoni Moda'), fonts);
    if (path.endsWith('index.html')) {
      const players = await page.eval(() => ({ count: document.querySelectorAll('.selected-project-media video').length, screenshots: document.querySelectorAll('.selected-project-media img').length, duplicate: !!document.querySelector('.selected-project-walkthrough') }));
      check(`${path}: walkthrough players replace all five selected-work previews`, players.count === 5 && players.screenshots === 0 && !players.duplicate, players);
      for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
        const playback = await page.eval(async slug => {
          const video = document.querySelector(`#project-${slug} video`);
          video.scrollIntoView({ behavior: 'instant', block: 'center' });
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          try {
            await video.play();
            await new Promise(resolve => setTimeout(resolve, 350));
            const result = { playing: !video.paused && video.currentTime > 0, controls: video.controls, inline: video.playsInline, dimensions: video.videoWidth > 0 && video.videoHeight > 0, duration: video.duration, noAutoplay: !video.autoplay };
            video.pause();
            return result;
          } catch (error) { return { error: error.message }; }
        }, slug);
        check(`${path}: ${slug} walkthrough decodes and plays`, playback.playing && playback.controls && playback.inline && playback.dimensions && playback.duration > 0 && playback.noAutoplay, playback);
      }
    }
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewport({ width, height: 900 });
      const layout = await page.eval(() => {
        const headings = [...document.querySelectorAll('h1, h2, h3')].filter(el => el.getBoundingClientRect().width > 0);
        return { overflow: document.documentElement.scrollWidth > innerWidth, long: headings.filter(el => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight) > 2.1).map(el => el.textContent.trim()), broken: [...document.images].filter(img => img.complete && !img.naturalWidth).map(img => img.getAttribute('src')) };
      });
      check(`${path}: readable headings and no overflow at ${width}px`, !layout.overflow && !layout.long.length && !layout.broken.length, layout);
      if (path.endsWith('index.html')) {
        const composition = await page.eval(() => {
          const feature = document.querySelector('.selected-project--featured');
          const media = feature.querySelector('.selected-project-media').getBoundingClientRect();
          const copy = feature.querySelector('.selected-project-copy').getBoundingClientRect();
          const pair = [...document.querySelector('.selected-projects-pair').children].map(el => el.getBoundingClientRect());
          return { feature: innerWidth > 900 ? copy.left >= media.right + 19 && media.width > copy.width : copy.top >= media.bottom + 15 && Math.abs(copy.left - media.left) < 2, pair: pair.length === 4 && (innerWidth > 700 ? [0, 2].every(i => Math.abs(pair[i].top - pair[i+1].top) < 2 && pair[i+1].left > pair[i].right) && pair[2].top > Math.max(pair[0].bottom, pair[1].bottom) : pair.every((box,i) => box.height > 300 && (!i || box.top > pair[i-1].bottom && Math.abs(box.left - pair[i-1].left) < 2))), frame: parseFloat(getComputedStyle(feature.querySelector('.selected-project-media')).paddingTop) <= 12 };
        });
        check(`${path}: selected work uses the approved layout at ${width}px`, Object.values(composition).every(Boolean), composition);
      }
    }
    if (path.endsWith('index.html')) {
      const spacing = await page.eval(() => ({ projectGap: parseFloat(getComputedStyle(document.querySelector('.selected-projects-pair')).marginTop), screenshotPadding: parseFloat(getComputedStyle(document.querySelector('.selected-project-media')).paddingTop), pageHeight: document.documentElement.scrollHeight }));
      check('portrait preview: project spacing is tighter than the previous design', spacing.projectGap < 96 && spacing.screenshotPadding < 48, spacing);
      for (const mode of ['light', 'dark']) {
        await page.eval(mode => { document.querySelector('[data-theme-trigger]').click(); document.querySelector(`[data-theme-option="${mode}"]`).click(); }, mode);
        await page.eval(() => window.scrollTo({ top: document.querySelector('#work').offsetTop - 24, behavior: 'instant' }));
        await page.screenshot({ path: `${path.includes('editorial') ? '.taste-skill/editorial-concept' : '.taste-skill'}/selected-work-${mode}.jpg` });
      }
      await page.eval(() => document.querySelector('#project-pulso').scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.screenshot({ path: `${path.includes('editorial') ? '.taste-skill/editorial-concept' : '.taste-skill'}/additional-selected-work.jpg` });
      await page.setViewport({ width: 390, height: 844 });
      await page.eval(() => window.scrollTo({ top: document.querySelector('#work').offsetTop - 20, behavior: 'instant' }));
      await page.screenshot({ path: `${path.includes('editorial') ? '.taste-skill/editorial-concept' : '.taste-skill'}/selected-work-phone.jpg` });
    }
    const links = await page.eval(() => [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href).filter(href => href.startsWith(location.origin) && new URL(href).pathname.includes('/projects/')))]);
    const statuses = await Promise.all(links.map(async href => ({ href, status: (await fetch(href)).status })));
    check(`${path}: project destinations remain available`, statuses.every(result => result.status === 200), { count: statuses.length });
  }
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve));
  await writeFile('.taste-skill/polish-results.json', JSON.stringify(results, null, 2));
}
