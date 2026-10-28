import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const out = join(tmpdir(), 'portfolio-project-cards');
await mkdir(out, { recursive: true });
const browser = await Browser.launch();
const results = [];
const check = (name, pass, detail) => { results.push({ name, pass, detail }); console.log(pass ? 'PASS' : 'FAIL', name, JSON.stringify(detail ?? '')); if (!pass) process.exitCode = 1; };
try {
  const page = await browser.newPage();
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await page.goto('http://127.0.0.1:5500/#work', { settleMs: 100 });
  await page.eval(() => document.fonts.ready);
  for (const theme of ['dark', 'light']) {
    await page.eval(theme => document.documentElement.dataset.theme = theme, theme);
    for (const width of [320, 390, 768, 1024, 1440, 1820]) {
      await page.setViewport({ width, height: 1000 });
      const detail = await page.eval(() => {
        const cards = [...document.querySelectorAll('[data-walkthrough-preview]')].map(card => {
          const box = card.getBoundingClientRect();
          const role = card.querySelector('.selected-project-role').getBoundingClientRect();
          const title = card.querySelector('h3').getBoundingClientRect();
          const button = card.querySelector('.selected-project-case-study').getBoundingClientRect();
          const video = card.querySelector('video');
          const media = video.getBoundingClientRect();
          const allTextFits = [...card.querySelectorAll('.selected-project-role, h3, .selected-project-summary, .selected-project-contribution, .selected-project-chip')].every(el => {
            const b = el.getBoundingClientRect(); return b.left >= box.left && b.right <= box.right && el.scrollWidth <= el.clientWidth;
          });
          return { id: card.id, fits: box.left >= 0 && box.right <= innerWidth && allTextFits && media.left >= box.left && media.right <= box.right && button.bottom <= box.bottom, roleFirst: role.bottom <= title.top + 1, chips: card.querySelectorAll('.selected-project-chip').length, button: { top: button.top, width: button.width, height: button.height }, video: video.muted && video.loop && !video.controls && getComputedStyle(video).objectFit === 'contain', sideBySide: card.querySelector('.selected-project-copy').getBoundingClientRect().left >= card.querySelector('figure').getBoundingClientRect().right };
        });
        const mobile = cards.filter(card => ['project-bulk-buying-companion', 'project-pulso', 'project-sige'].includes(card.id));
        return { overflow: document.documentElement.scrollWidth > innerWidth, cards, phoneFrames: document.querySelectorAll('.phone-frame').length, browserFrames: document.querySelectorAll('.project-preview-bar').length, mobileButtonDelta: Math.max(...mobile.map(card => card.button.top)) - Math.min(...mobile.map(card => card.button.top)) };
      });
      check(`${theme} ${width}px: all five card layouts and previews`, !detail.overflow && detail.cards.length === 5 && detail.cards.every(card => card.fits && card.roleFirst && card.chips >= 4 && card.video && card.button.height >= 44 && card.button.width >= 44) && detail.phoneFrames === 3 && detail.browserFrames === 2 && (width <= 1100 || detail.mobileButtonDelta <= 1), detail);
      if ([390, 1440].includes(width)) {
        await page.eval(() => document.querySelector('#work').scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.screenshot({ path: join(out, `${theme}-${width}-skyfire.png`) });
        await page.eval(() => document.querySelector('#project-maistra').scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.screenshot({ path: join(out, `${theme}-${width}-maistra.png`) });
        if (width === 1440) {
          await page.setViewport({ width, height: 1600 });
          await page.eval(() => document.querySelector('.selected-projects-mobile').scrollIntoView({ block: 'start', behavior: 'instant' }));
          await page.screenshot({ path: join(out, `${theme}-${width}-mobile-projects.png`) });
        }
      }
    }
  }
  await page.setViewport({ width: 1440, height: 1000 });
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await page.eval(() => document.querySelector('#project-skyfire').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.eval(() => new Promise(done => setTimeout(done, 900)));
  check('SkyFire preview still plays in its browser frame', await page.eval(() => { const v = document.querySelector('#project-skyfire video'); return !v.paused && v.currentTime > 0; }));
  await page.eval(() => document.querySelector('.selected-projects-mobile').scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.eval(() => new Promise(done => setTimeout(done, 900)));
  check('all three phone previews still play together', await page.eval(() => [...document.querySelectorAll('.selected-projects-mobile video')].every(v => !v.paused && v.currentTime > 0)));
  check('case-study link accepts keyboard focus with a visible outline', await page.eval(() => { const a = document.querySelector('#project-sige .selected-project-case-study'); a.focus({ preventScroll: true }); return document.activeElement === a && getComputedStyle(a).outlineStyle !== 'none'; }));
} finally {
  await browser.close();
  await writeFile(join(out, 'results.json'), JSON.stringify(results, null, 2));
  console.log('Screenshots:', out);
}
