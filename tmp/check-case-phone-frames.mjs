import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
const root=resolve('.'),out=join(tmpdir(),'portfolio-case-phone-frames');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.ttf':'font/ttf','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+sep))return res.writeHead(403).end();
    res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));
  }catch{res.writeHead(404).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}`,browser=await Browser.launch(),results=[];
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(pass?'PASS':'FAIL',name,JSON.stringify(pass?{}:detail));if(!pass)process.exitCode=1;};
const mobile=['bulk-buying-companion','pulso','sige'];
try{
  const page=await browser.newPage();
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  for(const slug of [...mobile,'skyfire','maistra']){
    await page.goto(`${base}/projects/${slug}.html`,{settleMs:100});await page.eval(()=>document.fonts.ready);
    for(const theme of ['dark','light']){
      await page.eval(value=>document.documentElement.dataset.theme=value,theme);
      for(const width of [320,390,768,1440]){
        await page.setViewport({width,height:1000});
        const detail=await page.eval(()=>{
          const v=document.querySelector('[data-project-video]'),media=document.querySelector('.case-lead-media'),caption=media.querySelector('figcaption');
          const frames=[...document.querySelectorAll('.phone-frame')].map(frame=>{
            const device=frame.getBoundingClientRect(),screen=frame.querySelector('.phone-frame-screen').getBoundingClientRect(),capture=frame.querySelector('video,img'),box=capture.getBoundingClientRect();
            return {fits:device.left>=0&&device.right<=innerWidth,captureFits:Math.abs(box.left-screen.left)<1&&Math.abs(box.top-screen.top)<1&&Math.abs(box.width-screen.width)<1&&Math.abs(box.height-screen.height)<1,ratio:Math.abs(box.width/box.height-390/844)<.005,height:device.height};
          });
          const d=media.querySelector('.phone-frame')?.getBoundingClientRect();
          return {overflow:document.documentElement.scrollWidth>innerWidth,frames,insidePhone:!!v.closest('.phone-frame-screen'),controls:v.controls,contain:getComputedStyle(v).objectFit==='contain',captionBelow:!d||caption.getBoundingClientRect().top>=d.bottom,leadHeight:d?.height,heightLimit:Math.min(innerHeight*.72,720),sources:[...v.querySelectorAll('source')].map(s=>s.getAttribute('src'))};
        });
        const portrait=mobile.includes(slug);
        check(`${slug} ${theme} ${width}px: framed captures fit`,!detail.overflow&&detail.controls&&detail.contain&&detail.captionBelow&&(portrait?detail.insidePhone&&detail.frames.length===4&&detail.frames.every(f=>f.fits&&f.captureFits&&f.ratio)&&detail.leadHeight<=detail.heightLimit+1:!detail.insidePhone&&detail.frames.length===0),detail);
        if(portrait&&[390,1440].includes(width)&&theme==='dark'){
          await page.eval(()=>document.querySelector('.case-lead-media').scrollIntoView({block:'start',behavior:'instant'}));
          await page.screenshot({path:join(out,`${slug}-${width}.png`)});
        }
      }
    }
  }
  // Follow the actual homepage case-study links and check playback inside each
  // restored phone. No changes to navigation or manual video controls required.
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.setViewport({width:1440,height:1000});
  for(const slug of mobile){
    await page.goto(base+'/#work',{settleMs:100});
    const href=await page.eval(s=>document.querySelector(`#project-${s} .selected-project-case-study`).href,slug);
    await page.goto(href,{settleMs:100});
    await page.eval(()=>document.querySelector('.case-lead-media').scrollIntoView({block:'start',behavior:'instant'}));
    await page.eval(()=>new Promise(done=>setTimeout(done,800)));
    const playback=await page.eval(()=>{const v=document.querySelector('[data-project-video]');return {inPhone:!!v.closest('.phone-frame-screen'),playing:!v.paused,time:v.currentTime,controls:v.controls};});
    check(`${slug}: case-study link opens a playable phone preview`,playback.inPhone&&playback.playing&&playback.time>0&&playback.controls,playback);
    await page.eval(()=>document.querySelector('[data-project-video]').dispatchEvent(new Event('error')));
    const fallback=await page.eval(()=>{const img=document.querySelector('[data-media-fallback]'),screen=img.closest('.phone-frame-screen'),a=img.getBoundingClientRect(),b=screen.getBoundingClientRect();return {visible:!img.hidden,inside:!!screen,fits:Math.abs(a.width-b.width)<1&&Math.abs(a.height-b.height)<1};});
    check(`${slug}: fallback image stays inside the phone`,fallback.visible&&fallback.inside&&fallback.fits,fallback);
  }
}finally{
  await writeFile(join(out,'results.json'),JSON.stringify(results,null,2));
  await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));
  console.log(`Verified ${results.filter(r=>r.pass).length}/${results.length}. Screenshots: ${out}`);
}
