import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { renderStartup } from '../scripts/render-startup.mjs';

const root=resolve('.'), out=join(tmpdir(),'portfolio-startup-ambience');
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.ttf':'font/ttf','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/ambience-preview.html') {
      res.setHeader('Content-Type','text/html');
      return res.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${['fonts','tokens','global','startup'].map(file=>`<link rel="stylesheet" href="css/${file}.css">`).join('')}</head><body>${renderStartup()}</body></html>`);
    }
    const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+sep))return res.writeHead(403).end();
    res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');
    res.end(await readFile(file));
  }catch{res.writeHead(404).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await Browser.launch(),results=[];
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(pass?'PASS':'FAIL',name,JSON.stringify(detail??''));if(!pass)process.exitCode=1;};
try {
  // The controller-free preview lets CSS run independently of the five-second
  // deadline. Leave JS execution enabled so the sampling timer can complete.
  const page=await browser.newPage();
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.goto(base+'/ambience-preview.html',{settleMs:100});
  await page.eval(()=>{
    const d=document.querySelector('.startup');d.hidden=false;d.showModal();
    document.querySelectorAll('[data-pipeline-stage]').forEach((el,i)=>el.dataset.state=['complete','active','active','pending'][i]);
  });
  await page.eval(()=>document.fonts.ready);
  for(const theme of ['dark','light']){
    await page.eval(value=>document.documentElement.dataset.theme=value,theme);
    for(const width of [390,1440]){
      await page.setViewport({width,height:1000});
      const detail=await page.eval(async()=>{
        const ambient=document.querySelector('.startup-ambience'),d=document.querySelector('.startup');
        const first=getComputedStyle(ambient,'::before').transform;
        await new Promise(done=>setTimeout(done,350));
        const second=getComputedStyle(ambient,'::before');
        return {animation:second.animationName,moving:first!==second.transform,hidden:ambient.getAttribute('aria-hidden'),pointerEvents:getComputedStyle(ambient).pointerEvents,layer:getComputedStyle(ambient).zIndex,overflow:d.scrollWidth>d.clientWidth,viewportOverflow:document.documentElement.scrollWidth>innerWidth};
      });
      check(`${theme} ${width}px: ambient movement stays behind workflow`,detail.animation==='startup-ambient-drift'&&detail.moving&&detail.hidden==='true'&&detail.pointerEvents==='none'&&detail.layer==='-1'&&!detail.overflow&&!detail.viewportOverflow,detail);
      await page.screenshot({path:join(out,`${theme}-${width}.png`)});
    }
  }
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const reduced=await page.eval(()=>{const s=getComputedStyle(document.querySelector('.startup-ambience'),'::before');return {animation:s.animationName,transform:s.transform};});
  check('reduced motion leaves a static gradient',reduced.animation==='none'&&reduced.transform==='none',reduced);

  const live=await browser.newPage();
  await live.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await live.goto(base+'/',{settleMs:100});
  const cleanup=await live.eval(async()=>{
    if(!document.querySelector('.startup')?.open)return false;
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{observer.disconnect();reject(Error('Intro did not close'));},5800);
      const observer=new MutationObserver(()=>{if(!document.querySelector('.startup')){clearTimeout(timeout);observer.disconnect();resolve();}});
      observer.observe(document.body,{childList:true});
    });
    return !document.querySelector('.startup-ambience')&&!document.getAnimations().some(animation=>animation.animationName==='startup-ambient-drift');
  });
  check('intro removes the background and stops its animation on completion',cleanup);
}finally{
  await writeFile(join(out,'results.json'),JSON.stringify(results,null,2));
  await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));
  console.log(`Verified ${results.filter(r=>r.pass).length}/${results.length}. Screenshots: ${out}`);
}
