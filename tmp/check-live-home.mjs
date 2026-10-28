import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const browser = await Browser.launch();
try {
  const page = await browser.newPage({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5500/', { settleMs: 0 });
  const detail = await page.eval(() => ({
    jobs: [...document.querySelectorAll('[data-pipeline-stage] h3')].map(n => n.textContent),
    old: document.body.textContent.includes('IDENTITY VERIFIED'),
    modal: !!document.querySelector('[data-startup]:modal'),
  }));
  if (detail.old || detail.jobs.join(',') !== 'Source,Build,Test,Deploy' || !detail.modal) throw Error(JSON.stringify(detail));
  console.log('PASS real localhost:5500 renders the rebuilt intro', JSON.stringify(detail));
  const finale = await page.eval(() => new Promise(done => {
    const deadline = performance.now() + 5000;
    const inspect = () => {
      const d = document.querySelector('[data-startup]');
      if (!d || performance.now() > deadline) return done({ visible: false });
      if (d.dataset.phase === 'welcome') return setTimeout(() => done({
        visible: getComputedStyle(d.querySelector('.startup-finale')).opacity === '1',
        text: d.querySelector('.startup-welcome').textContent,
        graph: Number(getComputedStyle(d.querySelector('.workflow-graph')).opacity),
      }), 700);
      setTimeout(inspect, 50);
    };
    inspect();
  }));
  if (!finale.visible || !finale.text.includes('Jayrald.') || finale.graph >= 0.2) throw Error(JSON.stringify(finale));
  console.log('PASS real localhost:5500 shows the full personal finale', JSON.stringify(finale));
  // Keep captures outside the watched project so Live Server does not reload.
  await page.screenshot({ path: join(tmpdir(), 'portfolio-live-workflow.png') });
  const closed = await page.eval(() => new Promise(done => {
    const d = document.querySelector('[data-startup]');
    if (!d) return done(true);
    d.addEventListener('close', () => done(true), { once: true });
    setTimeout(() => done(false), 6000);
  }));
  if (!closed) throw Error('Real homepage intro did not complete');
  console.log('PASS real localhost:5500 intro closes automatically');
} finally { await browser.close(); }
