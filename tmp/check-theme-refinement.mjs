import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const out = join(tmpdir(), 'portfolio-theme-refinement');
await mkdir(out, { recursive: true });
const browser = await Browser.launch();
const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(pass ? 'PASS' : 'FAIL', name, JSON.stringify(detail ?? ''));
  if (!pass) process.exitCode = 1;
};

function inspect() {
  const rgb = color => (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const luminance = color => rgb(color).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
  const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const root = getComputedStyle(document.documentElement);
  const background = el => {
    for (let current = el; current; current = current.parentElement) {
      const color = getComputedStyle(current).backgroundColor;
      if (color.startsWith('rgb(')) return color;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  const selectors = document.body.matches('.home-page')
    ? ['.section-kicker', '.intro-description p', '.selected-project-role', '.selected-project-contribution strong', '.selected-project-chip', '.button-link', '.selected-project-case-study', '.about-copy p', '.education-detail p', '.contact-copy', '.contact-location', '.contact-copy-status']
    : ['.section-kicker', '.case-deck', '.case-description', '.case-dossier dt', '.case-dossier dd', '.case-prose p', '.workflow-media figcaption', '.decision-ledger thead th', '.system-flow p'];
  const samples = selectors.flatMap(selector => [...document.querySelectorAll(selector)].filter(el => el.getClientRects().length).map(el => {
    const style = getComputedStyle(el), bg = background(el);
    return { selector, contrast: +contrast(style.color, bg).toFixed(2), color: style.color, bg };
  }));
  const buttons = [...document.querySelectorAll('.button-link, .selected-project-case-study, .contact-copy')].filter(el => el.getClientRects().length).map(el => {
    const box = el.getBoundingClientRect(), style = getComputedStyle(el);
    el.focus({ preventScroll: true });
    return { height: box.height, radius: style.borderRadius, focus: getComputedStyle(el).outlineStyle !== 'none' };
  });
  return {
    overflow: document.documentElement.scrollWidth > innerWidth,
    paper: root.getPropertyValue('--color-paper').trim(),
    body: getComputedStyle(document.body).backgroundColor,
    badContrast: samples.filter(sample => sample.contrast < 4.5),
    minContrast: Math.min(...samples.map(sample => sample.contrast)),
    labels: [...document.querySelectorAll('.section-kicker')].map(el => el.textContent),
    buttons,
    videos: document.querySelectorAll('video').length
  };
}

try {
  const page = await browser.newPage();
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const path of ['/#work', '/projects/skyfire.html', '/projects/maistra.html', '/projects/bulk-buying-companion.html', '/projects/pulso.html', '/projects/sige.html']) {
    await page.goto(`http://127.0.0.1:5500${path}`, { settleMs: 100 });
    await page.eval(() => document.fonts.ready);
    for (const theme of ['dark', 'light']) {
      await page.eval(value => document.documentElement.dataset.theme = value, theme);
      for (const width of [320, 768, 1440]) {
        await page.setViewport({ width, height: 1000 });
        const detail = await page.eval(inspect);
        const home = path.startsWith('/#');
        check(`${path} ${theme} ${width}px`, !detail.overflow && detail.badContrast.length === 0 && detail.buttons.every(b => b.height >= 44 && b.radius === '10px' && b.focus) && detail.labels.length === (home ? 4 : 1) && detail.videos === (home ? 5 : 1), detail);
        if (width === 1440 && home) {
          for (const [name, selector] of [['hero', '.intro-section'], ['projects', '#work'], ['toolkit', '#tech-stack'], ['about', '#about'], ['contact', '#contact']]) {
            await page.eval(sel => document.querySelector(sel).scrollIntoView({ block: 'start', behavior: 'instant' }), selector);
            await page.screenshot({ path: join(out, `${theme}-${name}.png`) });
          }
        }
        if (width === 320 && home || width === 1440 && path.includes('skyfire')) {
          await page.eval(() => scrollTo({ top: 0, behavior: 'instant' }));
          await page.screenshot({ path: join(out, `${theme}-${home ? 'phone' : 'case-study'}.png`) });
        }
      }
    }
  }
  // Verify the CSS fallback with JS disabled, independently of saved preferences.
  const plain = await browser.newPage();
  await plain.send('Emulation.setScriptExecutionDisabled', { value: true });
  await plain.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await plain.goto('http://127.0.0.1:5500/', { settleMs: 100 });
  const fallback = await plain.eval(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, icons: document.querySelectorAll('.tech-logo').length, startup: document.querySelector('.startup').hidden }));
  check('system dark fallback without JavaScript', !fallback.theme && fallback.bg === 'rgb(17, 26, 21)' && fallback.icons === 16 && fallback.startup, fallback);

  await page.goto('http://127.0.0.1:5500/', { settleMs: 50 });
  await page.eval(() => { sessionStorage.removeItem('portfolio-startup-canvas-seen'); localStorage.setItem('portfolio-theme', 'dark'); });
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:5500/', { settleMs: 200 });
  await page.eval(() => document.fonts.ready);
  await page.screenshot({ path: join(out, 'dark-workflow.png') });
  const workflow = await page.eval(() => {
    const el = document.querySelector('.startup'), card = document.querySelector('.pipeline-stage');
    return { open: el.open, bg: getComputedStyle(el).backgroundColor, card: getComputedStyle(card).backgroundColor, radius: getComputedStyle(card).borderRadius };
  });
  check('workflow shares refined palette and media radius', workflow.open && workflow.bg === 'rgb(17, 26, 21)' && workflow.card === 'rgb(29, 43, 34)' && workflow.radius === '12px', workflow);
  await page.eval(() => new Promise(done => setTimeout(done, 5200)));
  check('intro still reveals the homepage after five seconds', await page.eval(() => !document.querySelector('.startup') && !document.body.classList.contains('startup-active')));
} finally {
  await browser.close();
  await writeFile(join(out, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`Verified ${results.filter(r => r.pass).length}/${results.length}. Screenshots: ${out}`);
}
