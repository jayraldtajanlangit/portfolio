import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),out='.taste-skill/case-walkthrough-final',results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch();
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`);if(!pass)process.exitCode=1;};
try{
 const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`;
 const play=async()=>{
  await page.eval(()=>document.querySelector('[data-project-video]').scrollIntoView({block:'center',behavior:'instant'}));
  await new Promise(resolve=>setTimeout(resolve,150));
  await page.eval(()=>{document.querySelector('[data-project-video]').play().catch(error=>{window.walkthroughPlayError=error.name;});});
  await new Promise(resolve=>setTimeout(resolve,300));
  return page.eval(()=>{const video=document.querySelector('[data-project-video]');return {controls:video.controls,source:video.currentSrc,playing:!video.paused&&video.currentTime>0,width:video.videoWidth,height:video.videoHeight,failed:video.dataset.mediaFailed,heading:document.querySelector('#walkthrough-title').textContent};});
 };
 for(const slug of ['skyfire','maistra','bulk-buying-companion','pulso','sige']){
  await page.goto(base+'/index.html',{settleMs:100});
  let off,timer;
  const loaded=new Promise((resolve,reject)=>{off=browser.on(page.sessionId,'Page.loadEventFired',()=>{clearTimeout(timer);resolve();});timer=setTimeout(()=>reject(Error('case link navigation timeout')),10000);});
  try{await page.eval(slug=>document.querySelector(`#project-${slug} .selected-project-links a`).click(),slug);await loaded;}finally{off?.();clearTimeout(timer);}
  const playback=await play();
  check(`${slug}: homepage project link opens a playable guided MP4`,playback.controls&&playback.playing&&playback.width>0&&playback.source.endsWith(`${slug}-polished.mp4`)&&!playback.failed&&playback.heading==='Project walkthrough',playback);
  for(const mode of ['light','dark']){
   await page.eval(mode=>{if(document.documentElement.dataset.theme!==mode)document.querySelector('[data-theme-trigger]').click();},mode);
   for(const width of [320,390,1440,1857]){
    await page.setViewport({width,height:900});
    const layout=await page.eval(()=>{const video=document.querySelector('[data-project-video]');video.scrollIntoView({block:'center',behavior:'instant'});const b=video.getBoundingClientRect(),style=getComputedStyle(video);return {overflow:document.documentElement.scrollWidth>innerWidth,fit:b.left>=0&&b.right<=innerWidth,controls:video.controls,height:b.height,visible:style.visibility==='visible'};});
    check(`${slug} ${mode} ${width}px: player is visible and fits`,!layout.overflow&&layout.fit&&layout.controls&&layout.visible&&layout.height<=720,layout);
    if(['maistra','pulso'].includes(slug)&&[390,1440].includes(width)){
     await page.eval(()=>{document.querySelector('video').pause();document.querySelector('.case-lead-media').scrollIntoView({block:'start',behavior:'instant'});});
     await page.screenshot({path:`${out}/${slug}-${mode}-${width}.jpg`});
    }
   }
  }
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await page.goto(base+`/projects/${slug}.html`,{settleMs:150});
  const reduced=await play();
  check(`${slug}: manual playback works with reduced motion`,reduced.controls&&reduced.playing&&!reduced.failed,reduced);
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.send('Emulation.setScriptExecutionDisabled',{value:true});
  await page.goto(base+`/projects/${slug}.html`,{settleMs:100});
  const nojs=await play();
  check(`${slug}: native player works without JavaScript`,nojs.controls&&nojs.playing&&nojs.source.endsWith(`${slug}-polished.mp4`),nojs);
  await page.send('Emulation.setScriptExecutionDisabled',{value:false});
  await page.goto(pathToFileURL(resolve(`projects/${slug}.html`)).href,{settleMs:100});
  const file=await play();
  check(`${slug}: local-file walkthrough works`,file.controls&&file.playing&&file.source.startsWith('file:')&&file.source.endsWith(`${slug}-polished.mp4`),file);
 }
 await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.originalVideoPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));};`});
 await page.goto(base+'/projects/maistra.html',{settleMs:100});
 await page.eval(()=>document.querySelector('[data-project-video]').scrollIntoView({block:'center',behavior:'instant'}));
 const blocked=await page.eval(async()=>{await new Promise(resolve=>setTimeout(resolve,250));const v=document.querySelector('[data-project-video]');return {controls:v.controls,failed:v.dataset.mediaFailed,visible:getComputedStyle(v).visibility==='visible',fallbackHidden:document.querySelector('[data-media-fallback]').hidden};});
 check('autoplay denial leaves a visible player for manual play',blocked.controls&&blocked.visible&&blocked.fallbackHidden&&!blocked.failed,blocked);
 await page.eval(()=>{HTMLMediaElement.prototype.play=window.originalVideoPlay;});
 const retry=await play();
 check('manual play succeeds after autoplay denial',retry.controls&&retry.playing&&!retry.failed,retry);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
