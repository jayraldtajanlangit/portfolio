import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),out='.taste-skill/wide-layout-final',results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch();
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`);if(!pass)process.exitCode=1;};
try{
 const page=await browser.newPage();
 const base=`http://127.0.0.1:${server.address().port}`;
 await page.goto(base+'/index.html',{settleMs:300});
 await page.eval(()=>document.fonts.ready);
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const mode of ['light','dark']){
  await page.eval(mode=>{if(document.documentElement.dataset.theme!==mode)document.querySelector('[data-theme-trigger]').click();},mode);
  for(const width of [320,390,768,1024,1440,1857,1920,2560]){
   await page.setViewport({width,height:1000});
   const layout=await page.eval(()=>{
    const box=el=>el.getBoundingClientRect();
    const header=box(document.querySelector('.header-layout')),hero=box(document.querySelector('.intro-section')),work=box(document.querySelector('#work'));
    const nav=box(document.querySelector('.primary-nav')),word=box(document.querySelector('.wordmark')),actions=box(document.querySelector('.header-actions'));
    const shells=[...document.querySelectorAll('.shell')].map(box);
    const paragraphs=[...document.querySelectorAll('.intro-description>p,.work-section .selected-project-summary,.selected-project-contribution,.about-copy>p')];
    const textMeasure=document.createElement('canvas').getContext('2d');
    const readable=paragraphs.every(p=>{const style=getComputedStyle(p);textMeasure.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;return box(p).width<=60*textMeasure.measureText('0').width+1;});
    return {overflow:document.documentElement.scrollWidth>innerWidth,width:hero.width,margin:hero.left,equal:Math.abs(hero.left-(innerWidth-hero.right))<2,aligned:shells.every(b=>Math.abs(b.left-header.left)<2&&Math.abs(b.right-header.right)<2),centered:innerWidth<768||Math.abs((nav.left+nav.right)/2-(header.left+header.right)/2)<2,collisions:innerWidth>=768&&(word.right>nav.left||nav.right>actions.left),readable,previewWidth:box(document.querySelector('.selected-project-media')).width,headingLines:[...document.querySelectorAll('h1,h2,h3')].every(h=>box(h).height/parseFloat(getComputedStyle(h).lineHeight)<=2.15)};
   });
   check(`${mode} ${width}px: shared width, centered header and readable text`,!layout.overflow&&layout.equal&&layout.aligned&&layout.centered&&!layout.collisions&&layout.readable&&layout.headingLines&&(width<1500||Math.abs(layout.width-1400)<1),layout);
   if(width<768){
    const menu=await page.eval(()=>{const toggle=document.querySelector('[data-nav-toggle]');toggle.click();const nav=document.querySelector('.primary-nav').getBoundingClientRect(),actions=document.querySelector('.header-actions').getBoundingClientRect();return {open:toggle.getAttribute('aria-expanded')==='true',below:nav.top>=actions.bottom,fit:document.documentElement.scrollWidth<=innerWidth};});
    check(`${mode} ${width}px: expanded menu sits below header controls`,menu.open&&menu.below&&menu.fit,menu);
    await page.eval(()=>document.querySelector('[data-nav-toggle]').click());
   }
   if([390,1857].includes(width)){await page.eval(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${out}/home-${mode}-${width}.jpg`});}
  }
 }
 for(const slug of ['maistra','skyfire','bulk-buying-companion','pulso','sige']){
  await page.goto(base+`/projects/${slug}.html`,{settleMs:100});
  for(const width of [320,390,768,1440,1857]){
   await page.setViewport({width,height:1000});
   const layout=await page.eval(()=>{const boxes=[...document.querySelectorAll('.shell')].map(el=>el.getBoundingClientRect());return {overflow:document.documentElement.scrollWidth>innerWidth,aligned:boxes.every(b=>Math.abs(b.left-boxes[0].left)<2&&Math.abs(b.right-boxes[0].right)<2),width:boxes[0].width};});
   check(`${slug} ${width}px: case-study frame fits and aligns`,!layout.overflow&&layout.aligned&&(width<1500||Math.abs(layout.width-1400)<1),layout);
   if(slug==='maistra'&&width===1857)await page.screenshot({path:`${out}/case-1857.jpg`});
  }
 }
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await page.setViewport({width:1857,height:1000});
 await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.wideMotionEntries=[];const nativeAnimate=Element.prototype.animate;Element.prototype.animate=function(frames,options){window.wideMotionEntries.push(this.className);return nativeAnimate.call(this,frames,options);};`});
 await page.goto(base+'/index.html',{settleMs:100});
 const movement=await page.eval(async()=>{for(let top=0;top<document.documentElement.scrollHeight;top+=600){scrollTo({top,behavior:'instant'});await new Promise(resolve=>setTimeout(resolve,120));}return window.wideMotionEntries;});
 check('1857px: existing entrance animations still run while scrolling',movement.length>=8,{count:movement.length});
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
