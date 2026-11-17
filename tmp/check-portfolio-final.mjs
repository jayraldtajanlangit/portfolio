import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('.'), out = resolve('.taste-skill/portfolio-final');
await mkdir(out, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const server = createServer((req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!path.startsWith(root + sep)) return res.writeHead(403).end();
    res.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream', 'content-length': statSync(path).size });
    createReadStream(path).pipe(res);
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await Browser.launch(), results = [];
const check = (label, pass, detail) => { results.push({ label, pass, detail }); console.log(pass ? 'PASS' : 'FAIL', label, JSON.stringify(detail || '')); if (!pass) process.exitCode = 1; };
try {
  const page = await browser.newPage();
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base + '/index.html', { settleMs: 1000 });
  const typing = await page.eval(async () => {
    const target = document.querySelector('[data-typing-words]');
    const paragraph = document.querySelector('.intro-description > p:last-child');
    const seen = new Set(), positions = new Set(), start = performance.now();
    while (performance.now() - start < 11000) {
      const text = target.textContent;
      if (['AI Engineer', 'Mobile Developer', 'Web Developer'].includes(text)) seen.add(text);
      positions.add(Math.round(paragraph.getBoundingClientRect().top));
      if (seen.size === 3) break;
      await new Promise(done => setTimeout(done, 40));
    }
    document.querySelector('[data-typing-toggle]').click();
    const paused = target.textContent;
    await new Promise(done => setTimeout(done, 300));
    return { seen: [...seen], stable: positions.size === 1, pauses: target.textContent === paused, scroll: scrollY };
  });
  check('requested roles type in order without moving the layout', typing.seen.join('|') === 'AI Engineer|Mobile Developer|Web Developer' && typing.stable && typing.pauses && typing.scroll === 0, typing);
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewport({ width, height: 900 });
    for (const mode of ['light', 'dark']) {
      await page.eval(mode => { localStorage.setItem('portfolio-theme', mode); window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio-theme', newValue: mode })); scrollTo({ top: 0, behavior: 'instant' }); }, mode);
      const layout = await page.eval(() => {
        const main = document.querySelector('main');
        const hero = document.querySelector('.intro-section');
        const header = document.querySelector('.portfolio-header');
        const a = document.querySelector('#project-skyfire').getBoundingClientRect(), b = document.querySelector('#project-maistra').getBoundingClientRect();
        return {
          sections: [...main.children].map(section => section.id || 'hero'),
          overflow: document.documentElement.scrollWidth > innerWidth,
          hero: getComputedStyle(document.querySelector('.hero-name')).fontFamily.includes('Bodoni'),
          noHeroButton: !hero.querySelector('.button-link'),
          noHeaderDuplicates: !header.querySelector('.wordmark, .header-email'),
          paired: innerWidth > 767 ? Math.abs(a.top-b.top) < 2 : b.top >= a.bottom,
          phones: [...document.querySelectorAll('.selected-project-media--mobile .phone-frame')].map(frame => {
            const video = frame.querySelector('video'), rect = video.getBoundingClientRect(), bounds = frame.getBoundingClientRect();
            return { width: Math.round(rect.width), height: Math.round(rect.height), fits: rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom, loaded: video.readyState >= 2 };
          }),
          credentials: [...document.querySelectorAll('.credential-link')].map(link => ({ icon: !!link.querySelector('.credential-icon'), target: link.target, href: link.href })),
          staticRole: document.querySelector('.typing-static').textContent,
        };
      });
      check(`${mode} ${width}px retained hero, phone mockups and section order`, layout.credentials.length === 8 && layout.credentials.every(item => item.icon && item.target === '_blank') && !layout.overflow && layout.hero && layout.noHeroButton && layout.noHeaderDuplicates && layout.paired && layout.sections.join('|') === 'hero|about|work|tech-stack|certifications|contact' && layout.phones.length === 3 && layout.phones.every(phone => phone.width >= 145 && phone.height >= 310 && phone.fits), layout);
      if ([1440, 390].includes(width)) {
        for (const [part, selector] of [['hero','.portfolio-header'],['about','#about'],['projects','#work'],['phones','.selected-projects-mobile'],['certifications','#certifications'],['contact','#contact']]) {
          await page.eval(selector => document.querySelector(selector).scrollIntoView({ behavior: 'instant' }), selector);
          await page.screenshot({ path: `${out}/${mode}-${width}-${part}.jpg` });
        }
      }
    }
  }
  await page.eval(() => { scrollTo({top:0,behavior:'instant'}); document.querySelector('[data-nav-toggle]').click(); });
  const menuOpen = await page.eval(() => !document.querySelector('#primary-navigation').hidden && document.querySelector('[data-nav-toggle]').getAttribute('aria-expanded') === 'true');
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  check('mobile menu opens and Escape restores focus', menuOpen && await page.eval(() => document.querySelector('#primary-navigation').hidden && document.activeElement.matches('[data-nav-toggle]')));
  await page.setViewport({width:1440,height:900});
  await page.eval(() => document.querySelector('#project-bulk-buying-companion').scrollIntoView({behavior:'instant'}));
  await page.eval(() => new Promise(done => setTimeout(done, 250)));
  await page.eval(() => document.querySelector('#project-bulk-buying-companion [data-preview-toggle]').click());
  await page.eval(() => new Promise(done => setTimeout(done, 450)));
  const playing = await page.eval(() => {const card=document.querySelector('#project-bulk-buying-companion');return !card.querySelector('video').paused && card.querySelector('[data-preview-toggle]').textContent === 'Pause preview';});
  await page.eval(() => document.querySelector('#project-bulk-buying-companion [data-preview-toggle]').click());
  check('visible phone preview supports Play and Pause', playing && await page.eval(() => document.querySelector('#project-bulk-buying-companion video').paused));
  const links = await page.eval(async () => Promise.all([...document.querySelectorAll('.selected-project-case-study')].map(async link => ({name:link.getAttribute('aria-label'),status:(await fetch(link.href)).status}))));
  check('all five project detail links resolve', links.length === 5 && links.every(link => link.status === 200), links);
  await page.eval(() => document.querySelector('#project-skyfire .selected-project-case-study').click());
  await page.eval(() => new Promise(done => setTimeout(done, 350)));
  check('project link opens the correct detail page', await page.eval(() => location.pathname.endsWith('/projects/skyfire.html') && document.querySelector('h1').textContent === 'SkyFire'));
  check('no browser JavaScript exceptions', page.consoleErrors.length === 0, page.consoleErrors);
} finally { await browser.close(); server.closeAllConnections(); await new Promise(done => server.close(done)); }
await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
