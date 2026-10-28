import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
await mkdir('.taste-skill/case-reading', { recursive: true });
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
        const detail = await page.eval(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          sections: [...document.querySelectorAll('.case-section--reading')].map(section => {
            const heading = section.querySelector('h2'), copy = section.querySelector('.case-prose');
            const h = heading.getBoundingClientRect(), c = copy.getBoundingClientRect(), style = getComputedStyle(copy);
            return { aligned: Math.abs(h.left - c.left) < 1, gap: c.top - h.bottom, fontSize: parseFloat(getComputedStyle(heading).fontSize), plain: style.backgroundColor === 'rgba(0, 0, 0, 0)' && style.borderLeftWidth === '0px' && style.padding === '0px', fits: c.left >= 0 && c.right <= innerWidth, readable: c.width <= 850 };
          })
        }));
        const pass = !detail.overflow && detail.sections.length === 3 && detail.sections.every(s => s.aligned && s.gap >= 15 && s.gap <= 17 && s.fontSize <= 44 && s.plain && s.fits && s.readable);
        results.push({ slug, theme, width, pass, detail });
        if (!pass) { console.log('FAIL', slug, theme, width, detail); process.exitCode = 1; }
        if (['skyfire', 'pulso'].includes(slug) && [390, 1440].includes(width)) {
          await page.eval(() => document.querySelector('.case-section--problem').scrollIntoView({ block: 'start', behavior: 'instant' }));
          await page.screenshot({ path: `.taste-skill/case-reading/${slug}-${theme}-${width}.png` });
        }
      }
    }
  }
  console.log(`${results.filter(r => r.pass).length}/${results.length} case-study reading layout checks passed`);
} finally {
  await writeFile('.taste-skill/case-reading/results.json', JSON.stringify(results, null, 2));
  await browser.close();
}
