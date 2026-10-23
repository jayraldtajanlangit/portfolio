import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root = resolve('.'), results = [];
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.webm': 'video/webm', '.mp4': 'video/mp4' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream'); res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const check = (name, pass, detail = {}) => { results.push({ name, pass, ...detail }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${pass ? '' : ' ' + JSON.stringify(detail)}`); if (!pass) process.exitCode = 1; };
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const until = async (page, probe) => { for (let i = 0; i < 60; i++) { if (await page.eval(probe)) return true; await wait(50); } return false; };
const browser = await Browser.launch();
try {
  const page = await browser.newPage({ width: 1440, height: 900 });
  const move = (page, x, y) => page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  const enter = async (page, slug) => {
    await move(page, 2, 2);
    const point = await page.eval(slug => { const frame = document.querySelector(`#project-${slug} .selected-project-media`); frame.scrollIntoView({ block: 'center', behavior: 'instant' }); const box = frame.getBoundingClientRect(); return { x: box.left + box.width / 2, y: box.top + box.height / 2 }; }, slug);
    await wait(100); await move(page, point.x, point.y);
  };
  for (const path of ['index.html', '.taste-skill/editorial-concept/index.html']) {
    await page.goto(`${base}/${path}`, { timeoutMs: 10000, settleMs: 200 });
    await page.send('Page.bringToFront');
    check(`${path}: desktop uses hover playback`, await page.eval(() => matchMedia('(hover: hover) and (pointer: fine)').matches && [...document.querySelectorAll('[data-walkthrough-preview] video')].every(video => video.paused)));
    await page.eval(() => document.querySelector('#project-skyfire .selected-project-media').scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab' });
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab' });
    await page.eval(() => document.querySelector('#project-skyfire video').focus());
    check(`${path}: keyboard focus starts the visible player`, await until(page, () => !document.querySelector('#project-skyfire video').paused));
    await page.eval(() => document.querySelector('#project-skyfire video').blur());
    check(`${path}: leaving keyboard focus pauses the player`, await until(page, () => document.querySelector('#project-skyfire video').paused));
    for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
      await enter(page, slug);
      const playing = await until(page, `!document.querySelector('#project-${slug} video').paused && document.querySelector('#project-${slug} video').currentTime > .1`);
      const detail = await page.eval(slug => { const card = document.querySelector(`#project-${slug}`), video = card.querySelector('video'); return { currentSrc: video.currentSrc, playing: [...document.querySelectorAll('[data-walkthrough-preview] video')].filter(video => !video.paused).length, muted: video.muted, loop: video.loop, controls: video.controls, pointerInside: card.matches(':hover') }; }, slug);
      check(`${path}: hovering ${slug} plays only its polished video`, playing && detail.currentSrc.endsWith('-polished.mp4') && detail.playing === 1 && detail.muted && detail.loop && detail.controls, detail);
      await move(page, 2, 2);
      check(`${path}: leaving ${slug} pauses it`, await until(page, `document.querySelector('#project-${slug} video').paused`));
    }
    await enter(page, 'skyfire');
    await until(page, () => !document.querySelector('#project-skyfire video').paused);
    await page.eval(() => document.querySelector('#project-skyfire video').pause()); await wait(250);
    check(`${path}: manual pause survives while hovered`, await page.eval(() => document.querySelector('#project-skyfire video').paused));
    await enter(page, 'skyfire');
    check(`${path}: a new hover resumes the preview`, await until(page, () => !document.querySelector('#project-skyfire video').paused));
    await page.eval(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    check(`${path}: leaving the viewport pauses playback`, await until(page, () => [...document.querySelectorAll('[data-walkthrough-preview] video')].every(video => video.paused)));
    await enter(page, 'skyfire');
    await until(page, () => !document.querySelector('#project-skyfire video').paused);
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    check(`${path}: reduced motion disables automatic playback`, await until(page, () => document.querySelector('#project-skyfire video').paused));
    const manual = await page.eval(async () => { const video = document.querySelector('#project-skyfire video'); await video.play(); await new Promise(resolve => setTimeout(resolve, 150)); return !video.paused; });
    check(`${path}: explicit playback remains available under reduced motion`, manual);
    await page.eval(() => document.querySelector('#project-skyfire video').pause());
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await enter(page, 'skyfire');
    for (let i = 0; i < 5; i++) { await page.eval(() => { const card = document.querySelector('#project-skyfire'); card.dispatchEvent(new PointerEvent('pointerleave')); card.dispatchEvent(new PointerEvent('pointerenter')); }); }
    check(`${path}: rapid hover changes settle to playback`, await until(page, () => !document.querySelector('#project-skyfire video').paused));
    if (path.includes('editorial')) {
      await page.send('Runtime.evaluate', { expression: 'document.querySelector("#project-skyfire video").requestFullscreen()', userGesture: true, awaitPromise: true, returnByValue: true });
      check('native fullscreen keeps the polished video playing', await until(page, () => document.fullscreenElement === document.querySelector('#project-skyfire video') && !document.fullscreenElement.paused));
      await page.eval(() => document.exitFullscreen());
      await page.eval(() => { const video = document.querySelector('#project-skyfire video'); video.currentTime = 4.2; video.pause(); window.scrollTo({ top: document.querySelector('#work').offsetTop - 24, behavior: 'instant' }); });
      await wait(300);
      await page.screenshot({ path: '.taste-skill/editorial-concept/guided-preview.jpg' });
    }
  }
  const touch = await browser.newPage();
  await touch.setViewport({ width: 390, height: 844, mobile: true });
  await touch.goto(`${base}/.taste-skill/editorial-concept/index.html`, { timeoutMs: 10000, settleMs: 200 }); await touch.send('Page.bringToFront');
  check('touch device uses visible-player autoplay', await touch.eval(() => !matchMedia('(hover: hover) and (pointer: fine)').matches));
  for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
    await touch.eval(slug => document.querySelector(`#project-${slug} .selected-project-media`).scrollIntoView({ behavior: 'instant', block: 'center' }), slug);
    check(`touch: ${slug} autoplays when visible`, await until(touch, `!document.querySelector('#project-${slug} video').paused && document.querySelector('#project-${slug} video').currentTime > .1`));
    check(`touch: ${slug} is the only playing preview`, await touch.eval(() => [...document.querySelectorAll('[data-walkthrough-preview] video')].filter(video => !video.paused).length === 1));
  }
  await touch.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  check('touch: reduced motion pauses automatic previews', await until(touch, () => [...document.querySelectorAll('[data-walkthrough-preview] video')].every(video => video.paused)));
  await touch.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  check('touch: automatic playback resumes when reduced motion is turned off', await until(touch, () => !document.querySelector('#project-sige video').paused));
  const hidden = await browser.send('Target.createTarget', { url: 'about:blank', newWindow: false, background: false });
  await browser.send('Target.activateTarget', { targetId: hidden.targetId });
  const backgroundPass = await until(touch, () => document.hidden && [...document.querySelectorAll('[data-walkthrough-preview] video')].every(video => video.paused));
  check('background page has no playing preview', backgroundPass, await touch.eval(() => ({ hidden: document.hidden, visibility: document.visibilityState, players: [...document.querySelectorAll('[data-walkthrough-preview] video')].map(video => ({ paused: video.paused, time: video.currentTime })) })));
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve));
  await writeFile('.taste-skill/preview-playback-results.json', JSON.stringify(results, null, 2));
}
