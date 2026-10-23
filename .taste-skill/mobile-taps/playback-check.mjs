import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),out='.taste-skill/mobile-taps',results=[];
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch(),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=(name,pass)=>{results.push({name,pass});console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)process.exitCode=1;};
const until=async(page,fn,arg)=>{for(let n=0;n<40;n++){if(await page.eval(fn,arg))return true;await wait(100);}return false;};
try{
 const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`;
 for(const width of [1440,390]){
  await page.setViewport({width,height:1000});await page.goto(base+'/index.html',{settleMs:200});
  for(const slug of ['bulk-buying-companion','pulso','sige']){
   await page.eval(slug=>document.querySelector(`#project-${slug}`).scrollIntoView({block:'center',behavior:'instant'}),slug);
   check(`${width}px ${slug}: new MP4 autoplays inside the phone`,await until(page,slug=>{const v=document.querySelector(`#project-${slug} video`),b=v.getBoundingClientRect();return !v.paused&&v.currentTime>0&&v.videoWidth===390&&v.videoHeight===844&&!v.controls&&v.currentSrc.endsWith('-polished.mp4')&&Math.abs(b.width/b.height-390/844)<.002;},slug));
   await page.eval(slug=>{const v=document.querySelector(`#project-${slug} video`);v.querySelector('source[type="video/mp4"]').remove();v.load();v.play().catch(()=>{});},slug);
   const fallback = await until(page,slug=>{const v=document.querySelector(`#project-${slug} video`);return !v.paused&&v.currentTime>0&&v.currentSrc.endsWith('-polished.webm');},slug);
   check(`${width}px ${slug}: touch WebM fallback plays`,fallback);
   if(!fallback)console.log(await page.eval(slug=>{const v=document.querySelector(`#project-${slug} video`);return {src:v.currentSrc,paused:v.paused,time:v.currentTime,error:v.error&&{code:v.error.code,message:v.error.message},ready:v.readyState,network:v.networkState,muted:v.muted};},slug));
  }
  await page.goto(base+'/index.html',{settleMs:200});
  await page.eval(()=>document.querySelector('.selected-projects-mobile').scrollIntoView({block:'start',behavior:'instant'}));await wait(500);
  if(width===1440){
   await page.eval(()=>{for(const [index,v] of [...document.querySelectorAll('.selected-projects-mobile video')].entries()){v.pause();v.currentTime=[2.85,17.72,3.8][index];}});await wait(500);
  }else await page.eval(()=>document.querySelector('#project-pulso').scrollIntoView({block:'start',behavior:'instant'}));
  await page.screenshot({path:`${out}/phones-${width}.jpg`});
 }
 for(const slug of ['bulk-buying-companion','pulso','sige']){
  await page.goto(base+`/projects/${slug}.html`,{settleMs:100});
  await page.eval(()=>{const v=document.querySelector('[data-project-video]');v.scrollIntoView({block:'center',behavior:'instant'});v.play().catch(()=>{});});
  check(`${slug}: case-study touch walkthrough retains controls`,await until(page,()=>{const v=document.querySelector('[data-project-video]');return v.controls&&!v.paused&&v.currentTime>0&&v.currentSrc.endsWith('-polished.mp4');}));
 }
}finally{await writeFile(`${out}/playback-results.json`,JSON.stringify(results,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
