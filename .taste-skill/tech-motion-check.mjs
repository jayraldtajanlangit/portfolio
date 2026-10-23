import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),out='.taste-skill/tech-stack-centered',results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch(),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`);if(!pass)process.exitCode=1;};
try{
 const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`;
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await page.goto(base+'/index.html',{settleMs:150});await page.eval(()=>document.fonts.ready);
 for(const theme of ['dark','light']){
  await page.eval(theme=>document.documentElement.dataset.theme=theme,theme);
  for(const width of [320,390,768,1440,2560,3840]){
   await page.setViewport({width,height:900});await page.eval(()=>document.querySelector('#tech-stack').scrollIntoView({block:'start',behavior:'instant'}));
   const detail=await page.eval(()=>{const s=document.querySelector('#tech-stack'),groups=[...s.querySelectorAll('.tech-stack-group')],a=groups[0].getBoundingClientRect(),b=groups[1].getBoundingClientRect(),section=s.getBoundingClientRect(),title=s.querySelector('h2').getBoundingClientRect(),center=r=>r.left+r.width/2;return {titles:groups.map(g=>g.querySelector('h3').textContent),stacked:a.bottom<b.top,centered:Math.abs(center(title)-center(section))<1&&groups.every(g=>{const label=g.querySelector('h3').getBoundingClientRect(),list=g.querySelector('ul').getBoundingClientRect();return label.bottom<list.top&&Math.abs(center(label)-center(list))<1&&Math.abs(center(list)-center(section))<1;}),intro:s.querySelector('.section-heading p')!==null,links:[...s.querySelectorAll('.tech-logo-link')].every(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.width>=44&&r.height>=44;}),overflow:document.documentElement.scrollWidth>innerWidth};});
   check(`${theme} ${width}px: centered heading and labels above each logo row`,detail.stacked&&detail.centered&&!detail.intro&&detail.links&&!detail.overflow&&detail.titles.join(',')==='Languages,Frameworks',detail);
   if(theme==='dark'&&[390,2560].includes(width))await page.screenshot({path:`${out}/stack-${width}.jpg`});
  }
 }
 check('reduced motion leaves all seven logos still',await page.eval(()=>[...document.querySelectorAll('.tech-logo')].every(el=>getComputedStyle(el).animationName==='none')));
 check('all seven local icon masks decode',await page.eval(async()=>{const icons=[...document.querySelectorAll('.tech-logo')];const results=await Promise.all(icons.map(async el=>{const url=getComputedStyle(el).maskImage.match(/url\("?(.*?)"?\)/)?.[1];const image=new Image();image.src=url;await image.decode();return image.naturalWidth>0;}));return results.length===7&&results.every(Boolean);}));
 await page.setViewport({width:1440,height:900});await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});await wait(1000);
 check('all seven logos have gentle floating animations',await page.eval(()=>[...document.querySelectorAll('.tech-logo')].every(el=>{const s=getComputedStyle(el);return s.animationName==='tech-logo-float'&&s.animationDuration==='4.8s'&&s.animationPlayState==='running';})));
 const before=await page.eval(()=>[...document.querySelectorAll('.tech-logo')].map(el=>getComputedStyle(el).transform));await wait(600);
 const after=await page.eval(()=>[...document.querySelectorAll('.tech-logo')].map(el=>getComputedStyle(el).transform));
 check('logo positions change without moving the link targets',before.some((value,index)=>value!==after[index]));
 const point=await page.eval(()=>{document.querySelector('#tech-stack').scrollIntoView({block:'start',behavior:'instant'});const b=document.querySelector('.tech-logo-link').getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2};});
 await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await wait(100);
 check('hover pauses the language logos for reading',await page.eval(()=>[...document.querySelector('.tech-logo-list').querySelectorAll('.tech-logo')].every(el=>getComputedStyle(el).animationPlayState==='paused')));
 await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});await page.eval(()=>document.querySelectorAll('.tech-stack-group')[1].querySelector('.tech-logo-link').focus());
 check('keyboard focus pauses framework logos and shows their names',await page.eval(()=>{const a=document.activeElement;return [...a.closest('ul').querySelectorAll('.tech-logo')].every(el=>getComputedStyle(el).animationPlayState==='paused')&&getComputedStyle(a.querySelector('.tech-logo-name')).visibility==='visible';}));
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(100);
 check('enabling reduced motion cancels floating immediately',await page.eval(()=>[...document.querySelectorAll('.tech-logo')].every(el=>getComputedStyle(el).animationName==='none')));
 await page.send('Emulation.setScriptExecutionDisabled',{value:true});await page.goto(base+'/index.html',{settleMs:100});
 check('category layout and named links remain without JavaScript',await page.eval(()=>document.querySelectorAll('.tech-logo-link[aria-label]').length===7&&!document.querySelector('#tech-stack .section-heading p')));
}finally{await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
