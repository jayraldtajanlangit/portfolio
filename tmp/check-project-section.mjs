import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const stage = process.argv[2] || 'after';
const out = join(tmpdir(), 'portfolio-project-section', stage);
await mkdir(out, { recursive: true });
const browser = await Browser.launch();
const results = [];
try {
  const page = await browser.newPage();
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await page.goto('http://127.0.0.1:5500/#work', { settleMs: 100 });
  await page.eval(() => document.fonts.ready);
  for (const theme of ['dark', 'light']) {
    await page.eval(theme => document.documentElement.dataset.theme = theme, theme);
    for (const width of [320, 390, 768, 1024, 1440, 1820]) {
      await page.setViewport({ width, height: 1000 });
      await page.eval(() => document.querySelector('#work').scrollIntoView({ block: 'start', behavior: 'instant' }));
      const detail = await page.eval(() => {
        const title = document.querySelector('#work-title').getBoundingClientRect();
        const description = document.querySelector('#work > .section-heading p');
        const subtitle = description.getBoundingClientRect();
        const rows = ['skyfire', 'maistra'].map(slug => {
          const row = document.querySelector(`#project-${slug}`);
          const media = row.querySelector('figure').getBoundingClientRect();
          const heading = row.querySelector('h3').getBoundingClientRect();
          const copy = row.querySelector('.selected-project-copy').getBoundingClientRect();
          return { slug, sideBySide: copy.left >= media.right, topGap: heading.top - media.top, stackedGap: copy.top - media.bottom, fits: copy.left >= 0 && copy.right <= innerWidth && media.left >= 0 && media.right <= innerWidth };
        });
        return { description: description.textContent, headerGap: subtitle.top - title.bottom, headerLeft: Math.abs(subtitle.left - title.left), rows, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      const pass = !detail.overflow && detail.headerGap >= 8 && detail.headerGap <= 16 && detail.headerLeft <= 1 && detail.rows.every(row => row.fits && (width > 900 ? row.sideBySide && Math.abs(row.topGap) <= 10 : !row.sideBySide && row.stackedGap >= 15 && row.stackedGap <= 28));
      results.push({ theme, width, pass, ...detail });
      console.log(pass ? 'PASS' : 'FAIL', theme, width, JSON.stringify(detail));
      if (!pass) process.exitCode = 1;
      if ([390, 1440].includes(width)) {
        await page.screenshot({ path: join(out, `${theme}-${width}-projects.png`) });
        await page.eval(() => document.querySelector('#project-maistra').scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.screenshot({ path: join(out, `${theme}-${width}-maistra.png`) });
      }
    }
  }
} finally {
  await browser.close();
  await writeFile(join(out, 'results.json'), JSON.stringify(results, null, 2));
  console.log('Screenshots:', out);
}
