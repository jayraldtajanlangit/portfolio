import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { renderHeroComposition } from '../scripts/render-hero-composition.mjs';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
const root=resolve('.'),out=join(tmpdir(),'portfolio-hero-trail');await mkdir(out,{recursive:true});
const types={'.css':'text/css','.ttf':'font/ttf','.webp':'image/webp'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/'){
      res.setHeader('Content-Type','text/html');
      return res.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${['fonts','tokens','global','home','hero'].map(file=>`<link rel="stylesheet" href="css/${file}.css">`).join('')}</head><body class="home-page"><main class="shell" style="padding-block:24px">${renderHeroComposition()}</main></body></html>`);
    }
    const file=resolve(root,'.'+pathname);if(!file.startsWith(root+sep))return res.writeHead(403).end();
    res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));
  }catch{res.writeHead(404).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await Browser.launch(),results=[];
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(pass?'PASS':'FAIL',name,JSON.stringify(detail??''));if(!pass)process.exitCode=1;};
try{
  const page=await browser.newPage();
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.goto(`http://127.0.0.1:${server.address().port}/`,{settleMs:100});
  await page.eval(()=>document.fonts.ready);
  for(const theme of ['dark','light']){
    await page.eval(value=>document.documentElement.dataset.theme=value,theme);
    for(const width of [320,1440]){
      await page.setViewport({width,height:900});
      const detail=await page.eval(async()=>{
        const nodes=[...document.querySelectorAll('.hero-build-trail li')];
        const animations=document.getAnimations().filter(a=>a.animationName?.startsWith('hero-trail-'));
        animations.forEach(a=>{a.currentTime=700;a.play();});
        const first=getComputedStyle(nodes[0],'::after').backgroundPosition;
        await new Promise(done=>setTimeout(done,350));
        const second=getComputedStyle(nodes[0],'::after').backgroundPosition;
        return {animations:animations.length,moving:first!==second,nodeDelays:nodes.map(node=>getComputedStyle(node,'::before').animationDelay),signalDelays:nodes.slice(0,3).map(node=>getComputedStyle(node,'::after').animationDelay),overflow:document.documentElement.scrollWidth>innerWidth};
      });
      check(`${theme} ${width}px signal and pulse sequence`,detail.animations===7&&detail.moving&&!detail.overflow&&JSON.stringify(detail.nodeDelays)===JSON.stringify(['0s','1.6s','3.2s','4.8s'])&&JSON.stringify(detail.signalDelays)===JSON.stringify(['0.3s','1.9s','3.5s']),detail);
      await page.eval(()=>document.getAnimations().filter(a=>a.animationName?.startsWith('hero-trail-')).forEach(a=>{a.pause();a.currentTime=2600;}));
      await page.screenshot({path:join(out,`${theme}-${width}.png`)});
    }
  }
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const reduced=await page.eval(()=>({animations:document.getAnimations().filter(a=>a.animationName?.startsWith('hero-trail-')).length,signal:getComputedStyle(document.querySelector('.hero-build-trail li'),'::after').animationName}));
  check('reduced motion keeps the trail static',reduced.animations===0&&reduced.signal==='none',reduced);
}finally{
  await writeFile(join(out,'results.json'),JSON.stringify(results,null,2));
  await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));
  console.log(`Verified ${results.filter(r=>r.pass).length}/${results.length}. Screenshots: ${out}`);
}
