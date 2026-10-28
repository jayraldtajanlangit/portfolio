import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
const browser = await Browser.launch(), results = [];
try {
  const page = await browser.newPage();
  for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
    await page.goto(pathToFileURL(resolve(`projects/${slug}.html`)).href, { settleMs: 150 });
    await page.eval(async () => {
      const video = document.querySelector('video');
      if (!video.readyState) await new Promise(done => video.addEventListener('loadedmetadata', done, { once: true }));
      video.pause();
      video.currentTime = Math.min(10, video.duration - .5);
      await new Promise(done => video.addEventListener('seeked', done, { once: true }));
      await document.fonts.ready;
    });
    for (const theme of ['dark', 'light']) {
      await page.eval(theme => document.documentElement.dataset.theme = theme, theme);
      for (const width of [320, 390, 768, 1440, 1857]) {
        await page.setViewport({ width, height: 1000 });
        await page.eval(() => document.querySelector('.case-lead-media').scrollIntoView({ block: 'start', behavior: 'instant' }));
        const detail = await page.eval(() => {
          const card = document.querySelector('.case-lead-media');
          const video = card.querySelector('video'), v = video.getBoundingClientRect();
          const c = card.getBoundingClientRect(), stage = card.querySelector('.project-media-stage').getBoundingClientRect();
          const heading = card.querySelector('h2').getBoundingClientRect(), caption = card.querySelector('figcaption').getBoundingClientRect();
          return { transparent: getComputedStyle(card).backgroundColor === 'rgba(0, 0, 0, 0)', padding: getComputedStyle(card).padding, radius: getComputedStyle(video).borderTopLeftRadius, phoneFrames: card.querySelectorAll('.phone-frame').length, overflow: document.documentElement.scrollWidth > innerWidth, controls: video.controls, fit: getComputedStyle(video).objectFit, ratioError: Math.abs(v.width / v.height - video.videoWidth / video.videoHeight), insetLeft: stage.left - c.left, insetRight: c.right - stage.right, headingDelta: heading.left - stage.left, captionDelta: caption.left - stage.left, height: v.height, inside: v.left >= c.left && v.right <= c.right, captionColor: getComputedStyle(card.querySelector('figcaption')).color, textColor: getComputedStyle(document.body).color };
        });
        const pass = !detail.overflow && detail.controls && detail.fit === 'contain' && detail.ratioError < .002 && detail.height <= 721 && detail.inside && detail.transparent && detail.padding === '0px' && detail.radius === '16px' && detail.phoneFrames === 0 && detail.captionColor === detail.textColor && [detail.insetLeft, detail.insetRight, detail.headingDelta, detail.captionDelta].every(value => Math.abs(value) < 1);
        results.push({ slug, theme, width, pass, detail });
        if (!pass) { process.exitCode = 1; console.log('FAIL', slug, theme, width, detail); }
        if (['skyfire', 'maistra', 'pulso'].includes(slug) && theme === 'dark' && [390, 768, 1440].includes(width)) await page.screenshot({ path: `.taste-skill/walkthrough-framing/${slug}-${width}.png` });
      }
    }
  }
  console.log(`${results.filter(r => r.pass).length}/${results.length} walkthrough framing checks passed`);
} finally {
  await writeFile('.taste-skill/walkthrough-framing/results.json', JSON.stringify(results, null, 2));
  await browser.close();
}
