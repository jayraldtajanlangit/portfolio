import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
await mkdir('.taste-skill/outcome-layout', { recursive: true });
const browser = await Browser.launch(), results = [];
try {
  const page = await browser.newPage();
  for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
    await page.goto(pathToFileURL(resolve(`projects/${slug}.html`)).href, { settleMs: 100 });
    await page.eval(() => document.fonts.ready);
    for (const theme of ['light', 'dark']) {
      await page.eval(theme => document.documentElement.dataset.theme = theme, theme);
      for (const width of [320, 390, 768, 1440, 1857]) {
        await page.setViewport({ width, height: 1000 });
        const detail = await page.eval(() => {
          const section = document.querySelector('.case-section--outcome'), workflow = document.querySelector('.case-section--workflow').getBoundingClientRect();
          const title = section.querySelector('h2').getBoundingClientRect(), copy = section.querySelector('.case-prose').getBoundingClientRect(), paragraphs = [...section.querySelectorAll('p')].map(p => p.getBoundingClientRect());
          return { overflow: document.documentElement.scrollWidth > innerWidth, aligned: Math.abs(title.left - workflow.left) < 1 && Math.abs(copy.left - workflow.left) < 1, headingGap: copy.top - title.bottom, gaps: paragraphs.slice(1).map((p, i) => p.top - paragraphs[i].bottom), readable: copy.width <= 850, fits: copy.left >= 0 && copy.right <= innerWidth, plain: getComputedStyle(section).backgroundColor === 'rgba(0, 0, 0, 0)', count: paragraphs.length, paddingTop: getComputedStyle(section).paddingTop };
        });
        const pass = !detail.overflow && detail.aligned && Math.abs(detail.headingGap - 16) < 1 && detail.gaps.every(gap => Math.abs(gap - 16) < 1) && detail.readable && detail.fits && detail.plain && detail.count === 3 && detail.paddingTop === '24px';
        results.push({ slug, theme, width, pass, detail });
        if (!pass) { process.exitCode = 1; console.log('FAIL', slug, theme, width, detail); }
        if (['skyfire', 'pulso'].includes(slug) && [390, 1440].includes(width)) {
          await page.eval(() => document.querySelector('.case-section--outcome').scrollIntoView({ block: 'start', behavior: 'instant' }));
          await page.screenshot({ path: `.taste-skill/outcome-layout/${slug}-${theme}-${width}.png` });
        }
      }
    }
  }
  console.log(`${results.filter(result => result.pass).length}/${results.length} outcome layout checks passed`);
} finally {
  await writeFile('.taste-skill/outcome-layout/results.json', JSON.stringify(results, null, 2));
  await browser.close();
}
