import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),out='.taste-skill/projects-heading',results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch();
try{
 const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`;
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await page.goto(base+'/index.html',{settleMs:150});await page.eval(()=>document.fonts.ready);
 for(const theme of ['light','dark']){
  await page.eval(theme=>document.documentElement.dataset.theme=theme,theme);
  for(const width of [320,390,768,900,1024,1440,1920,2560,3840]){
   await page.setViewport({width,height:900});await page.eval(()=>document.querySelector('#work').scrollIntoView({block:'start',behavior:'instant'}));
   const detail=await page.eval(()=>{const h=document.querySelector('#work-title'),p=h.nextElementSibling,title=h.getBoundingClientRect(),intro=p.getBoundingClientRect(),media=document.querySelector('#project-skyfire .selected-project-media').getBoundingClientRect(),copy=document.querySelector('#project-skyfire .selected-project-copy').getBoundingClientRect();return {title:h.textContent,wording:p.textContent,titleAligned:Math.abs(title.left-media.left)<1,copyAligned:Math.abs(intro.left-copy.left)<1,bottomAligned:Math.abs(title.bottom-intro.bottom)<1,stacked:intro.top>=title.bottom+10&&intro.top<=title.bottom+17,introFits:intro.left>=0&&intro.right<=innerWidth,overflow:document.documentElement.scrollWidth>innerWidth};});
   const pass=detail.title==='Projects'&&detail.wording.includes('flight bookings')&&detail.titleAligned&&detail.introFits&&!detail.overflow&&(width>900?detail.copyAligned&&detail.bottomAligned:detail.stacked);
   results.push({name:`${theme} ${width}px: composed Projects introduction`,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${theme} ${width}px ${pass?'':JSON.stringify(detail)}`);if(!pass)process.exitCode=1;
   if(theme==='light'&&[390,1920,2560].includes(width))await page.screenshot({path:`${out}/${width}.jpg`});
  }
 }
}finally{await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
