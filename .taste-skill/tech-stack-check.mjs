import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const browser = await Browser.launch();
try {
  const page = await browser.newPage({ reducedMotion: true });
  for (const width of [1440, 390]) {
    await page.setViewport({width, height: 1000});
    await page.goto('http://127.0.0.1:8765/', {timeoutMs:6000, settleMs:300});
    const result = await page.eval(async () => {
      const section = document.querySelector('#tech-stack');
      section.scrollIntoView();
      const links = [...section.querySelectorAll('a')];
      const destinations = [...new Set(links.map(link => link.href))];
      return { categories:section.querySelectorAll('dt').length, technologies:links.length,
        linksValid:(await Promise.all(destinations.map(async url => (await fetch(url)).ok))).every(Boolean),
        overflow: document.documentElement.scrollWidth > innerWidth,
        navLink:!!document.querySelector('nav a[href="#tech-stack"]') };
    });
    await page.screenshot({path:`.taste-skill/tech-stack-${width}.jpg`});
    console.log(width, JSON.stringify(result));
    if(result.categories!==5 || result.technologies!==14 || !result.linksValid || result.overflow || !result.navLink) process.exitCode=1;
  }
} finally { await browser.close(); }
