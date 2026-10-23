import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),out='.taste-skill/tech-icons-final',results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch();
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`);if(!pass)process.exitCode=1;};
try{
 const page=await browser.newPage();
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{settleMs:300});
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 const assets=await page.eval(async()=>{
   const icons=[...document.querySelectorAll('.tech-logo')];
   return Promise.all(icons.map(async icon=>{const url=getComputedStyle(icon).maskImage.match(/url\("?(.*?)"?\)/)?.[1];if(!url)return false;const image=new Image();image.src=url;await image.decode();return image.naturalWidth>0&&image.naturalHeight>0&&new URL(url).origin===location.origin;}));
 });
 check('all seven SVG masks decode locally',assets.length===7&&assets.every(Boolean),assets);
 const links=await page.eval(async()=>{const anchors=[...document.querySelectorAll('.tech-logo-link')];return Promise.all(anchors.map(async a=>({label:a.getAttribute('aria-label'),valid:(await fetch(a.href)).ok,local:new URL(a.href).origin===location.origin,decorative:a.querySelector('.tech-logo').getAttribute('aria-hidden')==='true'})));});
 check('icons have accessible names and local case-study destinations',links.length===7&&links.every(a=>a.label&&a.valid&&a.local&&a.decorative),links);
 for(const mode of ['light','dark']){
  await page.eval(mode=>{if(document.documentElement.dataset.theme!==mode)document.querySelector('[data-theme-trigger]').click();},mode);
  for(const width of [320,390,768,1440]){
   await page.setViewport({width,height:800});
   const layout=await page.eval(()=>{
    const section=document.querySelector('#tech-stack');section.scrollIntoView({block:'start',behavior:'instant'});
    return {overflow:document.documentElement.scrollWidth>innerWidth,links:[...section.querySelectorAll('.tech-logo-link')].map(a=>{const b=a.getBoundingClientRect(),t=a.querySelector('.tech-logo-name');return {fits:b.left>=0&&b.right<=innerWidth,large:b.width>=44&&b.height>=44,hidden:getComputedStyle(t).visibility==='hidden'};})};
   });
   check(`${mode} ${width}px: icon layout fits with accessible hit targets`,!layout.overflow&&layout.links.every(a=>a.fits&&a.large&&a.hidden),layout);
   for(let i=0;i<7;i++){
    const focus=await page.eval(i=>{const a=document.querySelectorAll('.tech-logo-link')[i];a.focus();const label=a.querySelector('.tech-logo-name'),b=label.getBoundingClientRect();return {visible:getComputedStyle(label).visibility==='visible',fits:b.left>=0&&b.right<=innerWidth,focus:getComputedStyle(a).outlineStyle!=='none'};},i);
    check(`${mode} ${width}px: icon ${i+1} label appears on keyboard focus`,focus.visible&&focus.fits&&focus.focus,focus);
   }
   await page.eval(()=>{document.activeElement?.blur();document.querySelector('#tech-stack').scrollIntoView({block:'start',behavior:'instant'});});
   if([390,1440].includes(width))await page.screenshot({path:`${out}/${mode}-${width}.jpg`});
  }
 }
 check('reduced motion keeps logo feedback still',await page.eval(()=>getComputedStyle(document.querySelector('.tech-logo')).transitionDuration==='0s'));
 await page.send('Emulation.setScriptExecutionDisabled',{value:true});
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{settleMs:100});
 check('icons and case-study links exist without JavaScript',await page.eval(()=>document.querySelectorAll('.tech-logo-link').length===7));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
