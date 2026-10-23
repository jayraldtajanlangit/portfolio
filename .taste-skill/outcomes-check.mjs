import { createServer } from 'node:http';
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const root = resolve('.'), out = '.taste-skill/outcomes-functional';
await mkdir(out, { recursive: true });
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.ttf':'font/ttf', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.pdf':'application/pdf', '.mp4':'video/mp4', '.webm':'video/webm' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + new URL(req.url, 'http://local').pathname);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await Browser.launch(), results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${pass ? '' : ' ' + JSON.stringify(detail)}`);
  if (!pass) process.exitCode = 1;
};
try {
  const page = await browser.newPage();
  const base = `http://127.0.0.1:${server.address().port}`;
  const errors = [];
  browser.on(page.sessionId, 'Runtime.exceptionThrown', e => errors.push(e.exceptionDetails.text));
  await page.goto(base + '/index.html', { settleMs: 500 });
  await page.send('Page.bringToFront');
  for (const mode of ['light', 'dark']) {
    await page.eval(mode => { document.querySelector('[data-theme-trigger]').click(); document.querySelector(`[data-theme-option="${mode}"]`).click(); }, mode);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewport({ width, height: 900 });
      const layout = await page.eval(() => {
        const rect = el => el.getBoundingClientRect();
        const typing = document.querySelector('[data-typing-words]');
        const targets = JSON.parse(typing.dataset.typingWords);
        const original = typing.textContent;
        const positions = targets.map(word => { typing.textContent = word; return rect(document.querySelector('.intro-description')).top; });
        typing.textContent = original;
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          alignedPhones: (() => {
            const cards = [...document.querySelectorAll('.selected-projects-mobile .selected-project')].map(rect);
            return cards.length === 3 && (innerWidth > 1000 ? cards.every(card => Math.abs(card.top - cards[0].top) < 1) : cards.every((card, i) => !i || card.top >= cards[i - 1].bottom + 24));
          })(),
          stableTyping: Math.max(...positions) - Math.min(...positions) < 1,
          mobileIntroGap: rect(document.querySelector('.intro-description')).top - rect(document.querySelector('.intro-copy')).bottom,
          portraits: [...document.querySelectorAll('.selected-project-media--mobile')].map(frame => {
            const video = frame.querySelector('video'), box = rect(video);
            return { height: box.height, width: box.width, controls: video.controls, fits: box.left >= 0 && box.right <= innerWidth, aspect: box.width / box.height, left: box.left, frameLeft: rect(frame).left, frameWidth: rect(frame).width, frameCssWidth: getComputedStyle(frame).width, cssVideoWidth: getComputedStyle(video).width, parentWidth: rect(frame.parentElement).width };
          }),
          headings: [...document.querySelectorAll('h1,h2,h3')].filter(el => rect(el).height / parseFloat(getComputedStyle(el).lineHeight) > 2.15).map(el => el.textContent),
        };
      });
      check(`${mode} ${width}px: layout, full typing phrases and portrait controls`, !layout.overflow && layout.alignedPhones && layout.stableTyping && !layout.headings.length && (width >= 768 || layout.mobileIntroGap <= 24) && layout.portraits.every(p => p.fits && p.controls && p.height >= 375 && p.aspect > .44 && p.aspect < .49), layout);
      if ([390, 1440].includes(width)) {
        await page.eval(() => { document.querySelectorAll('video').forEach(v => v.pause()); scrollTo({ top: 0, behavior: 'instant' }); });
        await page.screenshot({ path: `${out}/${mode}-${width}-hero.jpg` });
        await page.eval(() => document.querySelector('#project-bulk-buying-companion').scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.eval(() => new Promise(resolve => setTimeout(resolve, 900)));
        await page.screenshot({ path: `${out}/${mode}-${width}-portrait.jpg` });
      }
    }
  }
  await page.setViewport({ width: 390, height: 900, mobile: true });
  await page.eval(() => { scrollTo({ top: 0, behavior: 'instant' }); document.querySelector('[data-nav-toggle]').click(); });
  const menuOpen = await page.eval(() => !document.querySelector('#primary-navigation').hidden);
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  const menuClosed = await page.eval(() => document.querySelector('#primary-navigation').hidden && document.activeElement === document.querySelector('[data-nav-toggle]'));
  check('mobile navigation opens and Escape restores focus', menuOpen && menuClosed);

  for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
    const playback = await page.eval(async slug => {
      const video = document.querySelector(`#project-${slug} video`);
      video.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise(resolve => setTimeout(resolve, 150));
      await video.play();
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = { playing: !video.paused && video.currentTime > 0, width: video.videoWidth, controls: video.controls, fullscreen: typeof video.requestFullscreen === 'function' };
      video.pause();
      return result;
    }, slug);
    check(`${slug}: walkthrough decodes, plays and retains native controls`, playback.playing && playback.width > 0 && playback.controls && playback.fullscreen, playback);
  }

  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const reduced = await page.eval(() => ({ staticText: getComputedStyle(document.querySelector('.typing-static')).position === 'static', overflow: document.documentElement.scrollWidth > innerWidth }));
  check('reduced motion displays static interests without overflow', reduced.staticText && !reduced.overflow, reduced);

  const pages = ['/index.html', ...['skyfire','maistra','bulk-buying-companion','pulso','sige'].map(slug => `/projects/${slug}.html`)];
  for (const path of pages) {
    await page.goto(base + path, { settleMs: 50 });
    const assets = await page.eval(async () => {
      const urls = [...new Set([...document.querySelectorAll('[href],[src],[poster]')].flatMap(el => ['href','src','poster'].map(attr => el.getAttribute(attr)).filter(Boolean)).map(url => new URL(url, location.href)).filter(url => url.origin === location.origin).map(url => url.href.split('#')[0]))];
      const failures = [];
      for (const url of urls) if (!(await fetch(url)).ok) failures.push(url);
      const meta = document.querySelector('meta[property="og:image"]');
      const image = new Image(); image.src = new URL(meta.content, location.href).href; await image.decode();
      return { failures, image: [image.naturalWidth, image.naturalHeight], favicon: !!document.querySelector('link[rel="icon"]'), resume: [...document.querySelectorAll('a[href$=".pdf"]')].length,
        repos: [...document.querySelectorAll('a[href*="github.com"]')].filter(a => new URL(a.href).pathname.split('/').filter(Boolean).length > 1).length,
        profile: !!document.querySelector('a[href="https://github.com/jayraldtajanlangit"]'),
        typingControl: !!document.querySelector('[data-typing-toggle]'),
        outcome: !!document.querySelector('#outcome-title'),
      };
    });
    check(`${path}: links, media, favicon and social image resolve`, !assets.failures.length && assets.image[0] === 1200 && assets.image[1] === 630 && assets.favicon && (path !== '/index.html' || assets.resume === 2), assets);
    check(`${path}: repository links removed, personal profile retained, no typing button`, !assets.repos && assets.profile && !assets.typingControl, assets);
    if (path !== '/index.html') {
      check(`${path}: outcome is present`, assets.outcome);
      for (const mode of ['light', 'dark']) {
        await page.eval(mode => { document.querySelector('[data-theme-trigger]').click(); document.querySelector(`[data-theme-option="${mode}"]`).click(); }, mode);
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewport({ width, height: 900 });
          const layout = await page.eval(() => {
            const section = document.querySelector('.case-section--outcome');
            section.scrollIntoView({ block: 'center', behavior: 'instant' });
            const prose = section.querySelector('.case-prose').getBoundingClientRect();
            return { overflow: document.documentElement.scrollWidth > innerWidth, fits: prose.left >= 0 && prose.right <= innerWidth, paragraphs: section.querySelectorAll('p').length };
          });
          check(`${path} ${mode} ${width}px: outcome remains readable`, !layout.overflow && layout.fits && layout.paragraphs === 3, layout);
          if (path.includes('skyfire') && [390, 1440].includes(width)) await page.screenshot({ path: `${out}/outcome-${mode}-${width}.jpg` });
        }
      }
    }
  }
  check('no browser JavaScript exceptions', !errors.length, errors);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
}
