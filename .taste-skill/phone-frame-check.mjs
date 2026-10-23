import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),out='.taste-skill/phone-frame-review',results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch();
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`);if(!pass)process.exitCode=1;};
const measure=()=>{
 const frames=[...document.querySelectorAll('.phone-frame')];
 const text=[...document.querySelectorAll('.case-lead-media--portrait > h2,.case-lead-media--portrait figcaption,.case-lead-media--portrait .walkthrough-video-link')];
 return {overflow:document.documentElement.scrollWidth>innerWidth,count:frames.length,readableText:text.every(el=>getComputedStyle(el).color===getComputedStyle(document.body).color),frames:frames.map(frame=>{
  const screen=frame.querySelector('.phone-frame-screen'),video=frame.querySelector('video'),b=frame.getBoundingClientRect(),s=screen.getBoundingClientRect(),v=video.getBoundingClientRect();
  return {frameWidth:b.width,height:b.height,fit:b.left>=0&&b.right<=innerWidth,screenFit:Math.abs(s.width-v.width)<1&&Math.abs(s.height-v.height)<1,ratio:Math.abs(v.width/v.height-390/844)<.002,controls:video.controls,decorative:frame.querySelector('.phone-frame-buttons').getAttribute('aria-hidden')==='true',topBezel:s.top-b.top,bottomBezel:b.bottom-s.bottom};
 })};
};
const valid=detail=>!detail.overflow&&detail.readableText&&detail.frames.every(f=>f.fit&&f.screenFit&&f.ratio&&f.controls&&f.decorative&&f.topBezel>=20&&f.bottomBezel>=15);
try{
 const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`;
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await page.goto(base+'/index.html',{settleMs:150});
 for(const mode of ['light','dark']){
  await page.eval(mode=>document.documentElement.dataset.theme=mode,mode);
  for(const width of [320,390,768,1024,1440,1857]){
   await page.setViewport({width,height:1000});
   const detail=await page.eval(measure);
   const panels=await page.eval(()=>[...document.querySelectorAll('.selected-project-media--mobile')].every(el=>getComputedStyle(el).backgroundColor==='rgba(0, 0, 0, 0)'));
   check(`home ${mode} ${width}px: three phones fit without side panels`,valid(detail)&&detail.count===3&&panels,{...detail,panels});
   if([390,768,1857].includes(width)){
    await page.eval(width=>{document.querySelector(width===1857?'.selected-projects-mobile':'#project-pulso').scrollIntoView({block:'start',behavior:'instant'});},width);
    await page.screenshot({path:`${out}/home-${mode}-${width}.jpg`});
   }
  }
 }
 for(const slug of ['bulk-buying-companion','pulso','sige']){
  await page.goto(base+`/projects/${slug}.html`,{settleMs:100});
  for(const mode of ['light','dark']){
   await page.eval(mode=>document.documentElement.dataset.theme=mode,mode);
   for(const width of [320,390,768,1440]){
    await page.setViewport({width,height:1000});
    const detail=await page.eval(measure);
    check(`${slug} ${mode} ${width}px: framed player fits the viewport`,valid(detail)&&detail.count===1&&detail.frames[0].height<=721,detail);
    if(slug==='pulso'&&[390,1440].includes(width)){
     await page.eval(()=>document.querySelector('.case-lead-media').scrollIntoView({block:'start',behavior:'instant'}));
     await page.screenshot({path:`${out}/case-${mode}-${width}.jpg`});
    }
   }
  }
  await page.eval(()=>{const v=document.querySelector('video');v.scrollIntoView({block:'center',behavior:'instant'});v.play().catch(()=>{});});
  await new Promise(resolve=>setTimeout(resolve,350));
  const playing=await page.eval(()=>{const v=document.querySelector('video');v.focus();return {playing:!v.paused&&v.currentTime>0,focused:document.querySelector('.phone-frame').matches(':focus-within'),controls:v.controls};});
  check(`${slug}: manual playback and keyboard focus work`,playing.playing&&playing.focused&&playing.controls,playing);
 }
 const full=await page.send('Runtime.evaluate',{expression:'document.querySelector("video").requestFullscreen().then(()=>document.fullscreenElement===document.querySelector("video"))',awaitPromise:true,returnByValue:true,userGesture:true});
 check('native video can enter fullscreen',full.result?.value===true,full.result);
 await page.eval(()=>document.exitFullscreen());
 await page.goto(base+'/projects/pulso.html',{settleMs:100});
 await page.eval(()=>{const v=document.querySelector('video');v.scrollIntoView({block:'center',behavior:'instant'});v.dispatchEvent(new Event('error'));});
 await new Promise(resolve=>setTimeout(resolve,150));
 const fallback=await page.eval(()=>{const image=document.querySelector('[data-media-fallback]'),screen=document.querySelector('.phone-frame-screen');const b=image.getBoundingClientRect(),s=screen.getBoundingClientRect();return {shown:!image.hidden&&getComputedStyle(image).visibility==='visible',fits:Math.abs(b.width-s.width)<1&&Math.abs(b.height-s.height)<1,link:!!document.querySelector('.walkthrough-video-link')};});
 check('failed video still displays its image inside the phone',fallback.shown&&fallback.fits&&fallback.link,fallback);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
