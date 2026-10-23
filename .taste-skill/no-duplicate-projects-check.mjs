import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root = resolve('.'), results = [];
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.ttf':'font/ttf', '.webp':'image/webp', '.jpg':'image/jpeg', '.mp4':'video/mp4', '.webm':'video/webm' };
const server = createServer(async (req,res) => {
  try {
    let path = resolve(root, '.' + new URL(req.url,'http://local').pathname);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path,'index.html');
    res.setHeader('Content-Type',types[extname(path)] || 'application/octet-stream'); res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const browser = await Browser.launch();
const check = (name,pass,detail) => { results.push({name,pass,detail}); console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`); if(!pass) process.exitCode=1; };
try {
  const page=await browser.newPage({width:1440,height:900});
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{timeoutMs:10000,settleMs:100});
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  for(const width of [320,390,768,1440]) {
    await page.setViewport({width,height:900});
    const detail=await page.eval(()=>{
      const intro=document.querySelector('.intro-section'), work=document.querySelector('#work');
      const cards=[...work.querySelectorAll('[data-walkthrough-preview]')];
      return {noIndex:!document.querySelector('.project-index'),direct:intro.nextElementSibling===work,gap:work.querySelector('h2').getBoundingClientRect().top-intro.querySelector('.intro-layout').getBoundingClientRect().bottom,projects:cards.length,unique:new Set(cards.map(card=>card.id)).size,videos:cards.every(card=>card.querySelector('video source[src$="-polished.mp4"]')),overflow:document.documentElement.scrollWidth>innerWidth,sectionOrder:[...document.querySelector('main').children].map(section=>section.id || 'intro')};
    });
    check(`${width}px: one project section follows introduction with compact spacing`,detail.noIndex && detail.direct && detail.projects===5 && detail.unique===5 && detail.videos && !detail.overflow && detail.gap>=40 && detail.gap<=96 && detail.sectionOrder.join(',')==='intro,work,tech-stack,about,contact',detail);
  }
  const jump=await page.eval(async()=>{
    document.querySelector('.intro-actions a[href="#work"]').click();
    await new Promise(resolve=>setTimeout(resolve,500));
    const work=document.querySelector('#work'); return {hash:location.hash,top:work.getBoundingClientRect().top,margin:parseFloat(getComputedStyle(work).scrollMarginTop)};
  });
  check('View projects still jumps to all selected projects',jump.hash==='#work' && Math.abs(jump.top-jump.margin)<3,jump);
} finally {
  await browser.close(); await new Promise(resolve=>server.close(resolve));
  await writeFile('.taste-skill/no-duplicate-projects-results.json',JSON.stringify(results,null,2));
}
