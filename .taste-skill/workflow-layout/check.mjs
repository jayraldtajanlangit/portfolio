import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
await mkdir('.taste-skill/workflow-layout', { recursive: true });
const browser = await Browser.launch(), results = [];
try {
  const page = await browser.newPage();
  for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
    await page.goto(pathToFileURL(resolve(`projects/${slug}.html`)).href, { settleMs: 100 });
    await page.eval(async () => {
      for (const image of document.querySelectorAll('.workflow-media img')) image.loading = 'eager';
      await Promise.all([...document.querySelectorAll('.workflow-media img')].map(image => image.decode()));
      await document.fonts.ready;
    });
    for (const theme of ['light', 'dark']) {
      await page.eval(theme => document.documentElement.dataset.theme = theme, theme);
      for (const width of [320, 390, 768, 1440, 1857]) {
        await page.setViewport({ width, height: 1000 });
        const detail = await page.eval(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          rows: [...document.querySelectorAll('.workflow-entry')].map(entry => {
            const title = entry.querySelector('h3').getBoundingClientRect(), image = entry.querySelector('img'), i = image.getBoundingClientRect(), stage = entry.querySelector('.workflow-media-stage'), s = stage.getBoundingClientRect(), caption = entry.querySelector('figcaption').getBoundingClientRect();
            return { gap: i.top - title.bottom, aligned: Math.abs(i.left - title.left) < 1 && Math.abs(i.left - caption.left) < 1, round: getComputedStyle(stage).borderRadius, plain: getComputedStyle(stage).backgroundColor === 'rgba(0, 0, 0, 0)', ratioError: Math.abs(i.width / i.height - image.naturalWidth / image.naturalHeight), noLetterbox: Math.abs(s.width - i.width) < 1 && Math.abs(s.height - i.height) < 1, fits: i.left >= 0 && i.right <= innerWidth, order: caption.top >= i.bottom };
          })
        }));
        const pass = !detail.overflow && detail.rows.length === 3 && detail.rows.every(row => row.gap >= 15 && row.gap <= 17 && row.aligned && row.round === '16px' && row.plain && row.ratioError < .002 && row.noLetterbox && row.fits && row.order);
        results.push({ slug, theme, width, pass, detail });
        if (!pass) { process.exitCode = 1; console.log('FAIL', slug, theme, width, detail); }
        if (['skyfire', 'pulso'].includes(slug) && [390, 1440].includes(width)) {
          await page.eval(() => document.querySelector('.workflow-entry').scrollIntoView({ block: 'start', behavior: 'instant' }));
          await page.screenshot({ path: `.taste-skill/workflow-layout/${slug}-${theme}-${width}.png` });
        }
      }
    }
  }
  console.log(`${results.filter(result => result.pass).length}/${results.length} workflow layout checks passed`);
} finally {
  await writeFile('.taste-skill/workflow-layout/results.json', JSON.stringify(results, null, 2));
  await browser.close();
}
