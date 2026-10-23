import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),out='.taste-skill/autoplay-previews',results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch();
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`);if(!pass)process.exitCode=1;};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const until=async(page,fn,arg)=>{for(let n=0;n<35;n++){if(await page.eval(fn,arg))return true;await wait(100);}return false;};
const slugs=['skyfire','maistra','bulk-buying-companion','pulso','sige'];
try{
 const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`;
 for(const path of ['/index.html','/.taste-skill/editorial-concept/index.html']){
  await page.setViewport({width:1857,height:1100});
  await page.goto(base+path,{settleMs:150});
  await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
  for(const slug of slugs){
   await page.eval(slug=>document.querySelector(`#project-${slug} .selected-project-media`).scrollIntoView({block:'center',behavior:'instant'}),slug);
   const plays=await until(page,slug=>{const v=document.querySelector(`#project-${slug} video`);return !v.paused&&v.currentTime>.1&&!v.controls&&v.muted&&v.loop;},slug);
   check(`${path}: ${slug} autoplays without hover or controls`,plays);
  }
  await page.eval(()=>document.querySelector('.selected-projects-mobile').scrollIntoView({block:'start',behavior:'instant'}));
  const concurrent=await until(page,()=>[...document.querySelectorAll('.selected-projects-mobile video')].every(v=>!v.paused&&v.currentTime>.1&&!v.controls));
  check(`${path}: all three phone previews play together`,concurrent);
  const pulso=await page.eval(()=>{const v=document.querySelector('#project-pulso video'),b=v.getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2};});
  await page.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...pulso});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...pulso});
  check(`${path}: clicking pauses only Pulso`,await until(page,()=>document.querySelector('#project-pulso video').paused&&[...document.querySelectorAll('#project-bulk-buying-companion video,#project-sige video')].every(v=>!v.paused)));
  await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
  await page.eval(()=>{scrollTo({top:0,behavior:'instant'});});await wait(200);
  await page.eval(()=>document.querySelector('.selected-projects-mobile').scrollIntoView({block:'start',behavior:'instant'}));await wait(200);
  check(`${path}: intentional pause survives scrolling and mouse movement`,await page.eval(()=>document.querySelector('#project-pulso video').paused));
  await page.eval(()=>document.querySelector('#project-pulso video').focus());
  await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  check(`${path}: keyboard resumes Pulso with other phones still playing`,await until(page,()=>[...document.querySelectorAll('.selected-projects-mobile video')].every(v=>!v.paused)));
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  check(`${path}: reduced motion pauses all previews`,await until(page,()=>[...document.querySelectorAll('[data-walkthrough-preview] video')].every(v=>v.paused)));
  await page.eval(()=>document.querySelector('#project-pulso video').click());
  check(`${path}: explicit play works with reduced motion`,await until(page,()=>!document.querySelector('#project-pulso video').paused&&[...document.querySelectorAll('#project-bulk-buying-companion video,#project-sige video')].every(v=>v.paused)));
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.eval(()=>document.querySelector('#project-pulso video').blur());
  await page.screenshot({path:`${out}/${path.includes('editorial')?'concept':'home'}-desktop.jpg`});
  const target=await browser.send('Target.createTarget',{url:'about:blank',background:false});await browser.send('Target.activateTarget',{targetId:target.targetId});
  check(`${path}: hidden tab pauses all players`,await until(page,()=>document.hidden&&[...document.querySelectorAll('[data-walkthrough-preview] video')].every(v=>v.paused)));
  await page.send('Page.bringToFront');await browser.send('Target.closeTarget',{targetId:target.targetId});
 }
 await page.setViewport({width:390,height:844,mobile:true});await page.goto(base+'/index.html',{settleMs:100});
 for(const slug of slugs){await page.eval(slug=>document.querySelector(`#project-${slug} .selected-project-media`).scrollIntoView({block:'center',behavior:'instant'}),slug);check(`touch: ${slug} loops without controls`,await until(page,slug=>{const v=document.querySelector(`#project-${slug} video`);return !v.paused&&v.currentTime>.1&&!v.controls;},slug));}
 await page.eval(()=>document.querySelector('#project-pulso').scrollIntoView({block:'start',behavior:'instant'}));await wait(200);await page.screenshot({path:`${out}/home-mobile.jpg`});
 await page.goto(base+'/projects/pulso.html',{settleMs:100});
 check('case study keeps full native playback controls',await page.eval(()=>document.querySelector('[data-project-video]').controls));
 await page.send('Emulation.setScriptExecutionDisabled',{value:true});await page.goto(pathToFileURL(resolve('index.html')).href,{settleMs:100});
 await page.eval(()=>document.querySelector('.selected-projects-mobile').scrollIntoView({block:'start',behavior:'instant'}));
 check('local-file/no-JavaScript markup keeps muted autoplay without controls',await until(page,()=>[...document.querySelectorAll('.selected-projects-mobile video')].every(v=>!v.paused&&!v.controls&&v.muted&&v.loop)));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
