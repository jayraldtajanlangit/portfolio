import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve('.'), out = join(tmpdir(), 'portfolio-hero-composition');
await mkdir(out, { recursive: true });
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.ttf':'font/ttf', '.svg':'image/svg+xml', '.webp':'image/webp', '.jpg':'image/jpeg', '.mp4':'video/mp4', '.webm':'video/webm' };
const server = createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0,'127.0.0.1',done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await Browser.launch();
const results = [];
const check = (name,pass,detail) => { results.push({name,pass,detail}); console.log(pass?'PASS':'FAIL',name,JSON.stringify(detail??'')); if(!pass)process.exitCode=1; };
try {
  const page = await browser.newPage();
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await page.goto(base+'/',{settleMs:100});
  await page.eval(() => document.fonts.ready);
  await page.eval(() => Promise.all([...document.querySelectorAll('.hero-composition img')].map(img=>img.decode())));
  for(const theme of ['dark','light']) {
    await page.eval(value=>document.documentElement.dataset.theme=value,theme);
    for(const width of [320,390,768,1024,1440,1820]) {
      await page.setViewport({width,height:1100});
      await page.eval(()=>scrollTo({top:0,behavior:'instant'}));
      const detail = await page.eval(() => {
        const rect=selector=>document.querySelector(selector).getBoundingClientRect();
        const hero=rect('.intro-section'), copy=rect('.intro-copy'), stage=rect('.hero-stage'), composition=rect('.hero-composition');
        const parts=['.intro-copy h1','.intro-description','.hero-preview--web','.hero-preview--mobile','.hero-build-trail'].map(selector=>{const b=rect(selector);return {selector,fits:b.left>=hero.left-1&&b.right<=hero.right+1&&b.top>=hero.top-1&&b.bottom<=hero.bottom+1};});
        const images=[...document.querySelectorAll('.hero-composition img')].map(img=>({loaded:img.complete&&img.naturalWidth>0,width:img.naturalWidth,height:img.naturalHeight}));
        const links=[...document.querySelectorAll('.hero-preview')].map(a=>{a.focus({preventScroll:true});return {href:a.getAttribute('href'),focus:getComputedStyle(a).outlineStyle!=='none',height:a.getBoundingClientRect().height};});
        const cards=[...document.querySelectorAll('.selected-work .selected-project')].map(el=>{const b=el.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth;});
        return {overflow:document.documentElement.scrollWidth>innerWidth,parts,images,links,sideBySide:composition.left>=copy.right,stageHeight:stage.height,heroHeight:hero.height,cards,phoneFrames:document.querySelectorAll('.selected-work .phone-frame').length,videos:document.querySelectorAll('video').length,watermark:!!document.querySelector('.startup-watermark')};
      });
      check(`${theme} ${width}px composition and project bounds`,!detail.overflow&&detail.parts.every(p=>p.fits)&&detail.images.every(i=>i.loaded)&&detail.links.every(a=>a.focus&&a.height>=44)&&detail.cards.length===5&&detail.cards.every(Boolean)&&detail.phoneFrames===3&&detail.videos===5&&!detail.watermark&&(width<=1000||detail.sideBySide),detail);
      if([390,1440].includes(width)) {
        await page.eval(()=>document.activeElement?.blur());
        await page.screenshot({path:join(out,`${theme}-${width}.png`)});
      }
    }
  }
  // The real browser must create a name animation, then remove the dialog by its
  // original deadline. Inspect the animation itself rather than arbitrary pixels.
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  for(const width of [390,1440]) {
    await page.setViewport({width,height:1100});
    await page.eval(()=>{sessionStorage.removeItem('portfolio-startup-canvas-seen');localStorage.setItem('portfolio-theme','dark');});
    await page.goto(base+'/',{settleMs:50});
    await page.eval(()=>document.fonts.ready);
    const handoff = await page.eval(async()=>{
      const splash=document.querySelector('[data-startup]');
      if(!splash?.open)return {started:false};
      return await new Promise(resolve=>{
        splash.addEventListener('startup:reveal',()=>{
          const name=splash.querySelector('[data-startup-name]');
          const animation=name.getAnimations().find(a=>a.effect?.getTiming().duration===400);
          let targetDelta;
          if(animation) {
            animation.pause();animation.currentTime=400;
            const landed=name.getBoundingClientRect(),target=document.querySelector('[data-hero-name]').getBoundingClientRect();
            // Ignore the hero heading's independent entrance translation when
            // comparing its final position to the migrating name.
            const transform=new DOMMatrix(getComputedStyle(document.querySelector('#hero-title')).transform);
            targetDelta={x:Math.abs(landed.left-(target.left-transform.m41)),y:Math.abs(landed.top-(target.top-transform.m42))};
            animation.currentTime=0;animation.play();
          }
          resolve({started:true,matched:!!animation,targetDelta,frames:animation?.effect.getKeyframes().map(frame=>frame.transform),phase:splash.dataset.phase});
        },{once:true});
      });
    });
    check(`${width}px intro moves name toward hero`,handoff.started&&handoff.matched&&handoff.targetDelta?.x<1&&handoff.targetDelta?.y<1,handoff);
    await page.eval(()=>new Promise(done=>setTimeout(done,850)));
    // The composition has a 400ms entrance stagger plus its 700ms animation.
    // Wait for that real animation to settle before asserting final opacity.
    await page.eval(async()=>{await Promise.all([...document.querySelectorAll('#hero-title, .hero-composition')].flatMap(el=>el.getAnimations()).map(animation=>animation.finished.catch(()=>{})));});
    const done=await page.eval(()=>({closed:!document.querySelector('[data-startup]'),nameVisible:getComputedStyle(document.querySelector('#hero-title')).opacity==='1',compositionVisible:getComputedStyle(document.querySelector('.hero-composition')).opacity==='1'}));
    check(`${width}px intro completes and exposes composition`,done.closed&&done.nameVisible&&done.compositionVisible,done);
    await page.screenshot({path:join(out,`after-intro-${width}.png`)});
  }
  const plain=await browser.newPage();
  await plain.send('Emulation.setScriptExecutionDisabled',{value:true});
  await plain.goto(base+'/',{settleMs:100});
  check('hero and links work without JavaScript',await plain.eval(()=>document.querySelector('.startup').hidden&&document.querySelectorAll('.hero-preview').length===2&&getComputedStyle(document.querySelector('.hero-composition')).opacity==='1'));
} finally {
  await writeFile(join(out,'results.json'),JSON.stringify(results,null,2));
  await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));
  console.log(`Verified ${results.filter(r=>r.pass).length}/${results.length}. Screenshots: ${out}`);
}
