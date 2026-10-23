import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),stage=process.argv[2]||'after',out=`.taste-skill/project-alignment/${stage}`,results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch(),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`);if(!pass)process.exitCode=1;};
const measure=()=>{
 const selectors=['.selected-project-title','.selected-project-summary','.selected-project-contribution','.selected-project-role','.selected-project-stack','.selected-project-links'];
 const cards=[...document.querySelectorAll('.selected-projects-mobile > .selected-project')];
 const tops=selectors.map(selector=>cards.map(card=>card.querySelector(selector).getBoundingClientRect().top));
 return {tops,aligned:tops.every(row=>Math.max(...row)-Math.min(...row)<1),overflow:document.documentElement.scrollWidth>innerWidth,readable:cards.every(card=>{
  const elements=[...card.querySelectorAll('.selected-project-copy > *')];
  return elements.every((el,index)=>{const b=el.getBoundingClientRect(),next=elements[index+1]?.getBoundingClientRect();return b.width>0&&b.height>0&&b.left>=0&&b.right<=innerWidth&&(!next||b.bottom<=next.top+1)&&getComputedStyle(el).visibility==='visible';});
 }),phones:cards.every(card=>{const v=card.querySelector('video');return !v.controls&&v.loop&&v.muted;})};
};
try{
 const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`;
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const path of ['/index.html','/.taste-skill/editorial-concept/index.html']){
  await page.goto(base+path,{settleMs:150});await page.eval(()=>document.fonts.ready);
  for(const theme of ['dark','light']){
   await page.eval(theme=>document.documentElement.dataset.theme=theme,theme);
   for(const width of [320,390,768,1000,1024,1200,1440,1857]){
    await page.setViewport({width,height:1100});
    await page.eval(width=>document.querySelector(width>1000?'.selected-projects-mobile':'#project-pulso').scrollIntoView({block:'start',behavior:'instant'}),width);await wait(100);
    const detail=await page.eval(measure);
    check(`${path} ${theme} ${width}px: ${width>1000?'matching text rows align':'all copy fits in reading order'}`,(!detail.overflow&&detail.readable&&detail.phones&&(width<=1000||detail.aligned)),detail);
    if(path==='/index.html'&&[390,768,1440].includes(width))await page.screenshot({path:`${out}/${theme}-${width}.jpg`});
   }
  }
 }
 if(stage==='after'){
  await page.setViewport({width:1440,height:1100});await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.goto(base+'/index.html',{settleMs:100});
  await page.eval(()=>document.querySelector('.selected-projects-mobile').scrollIntoView({block:'start',behavior:'instant'}));await wait(100);
  const running=await page.eval(()=>[...document.querySelectorAll('.selected-projects-mobile .selected-project-copy')].map(el=>el.getAnimations().map(a=>a.effect.getTiming())));
  check('three copy blocks reveal together with a short stagger',running.every(list=>list.some(timing=>timing.duration<=600&&timing.fill==='backwards'))&&running[0][0]?.delay===0&&running[1][0]?.delay===70&&running[2][0]?.delay===140,running);
  await wait(850);
  check('reveal settles into aligned readable rows',await page.eval(()=>document.querySelectorAll('.selected-projects-mobile .selected-project-copy').length===3&&[...document.querySelectorAll('.selected-projects-mobile .selected-project-copy')].every(el=>el.getAnimations().length===0)));
  check('all three mobile previews keep playing after the reveal',await page.eval(()=>[...document.querySelectorAll('.selected-projects-mobile video')].every(v=>!v.paused&&v.currentTime>0)));
  await page.send('Emulation.setScriptExecutionDisabled',{value:true});await page.goto(base+'/index.html',{settleMs:100});await page.eval(()=>document.querySelector('.selected-projects-mobile').scrollIntoView({block:'start',behavior:'instant'}));
  const fallback=await page.eval(measure);check('without JavaScript the aligned copy remains visible',fallback.aligned&&fallback.readable&&!fallback.overflow,fallback);
 }
}finally{await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
