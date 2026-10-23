import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),stage=process.argv[2]||'after',out=`.taste-skill/large-screens/${stage}`,results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch(),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`);if(!pass)process.exitCode=1;};
const measure=()=>{
 const shells=[...document.querySelectorAll('.home-page .shell')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};});
 const rows=['.selected-project-title','.selected-project-summary','.selected-project-contribution','.selected-project-role','.selected-project-stack','.selected-project-links'].map(selector=>[...document.querySelectorAll('.selected-projects-mobile > .selected-project')].map(card=>card.querySelector(selector).getBoundingClientRect().top));
 const paragraphs=[...document.querySelectorAll('.selected-project-summary,.selected-project-contribution')].map(el=>{const s=getComputedStyle(el);return {width:el.getBoundingClientRect().width,font:parseFloat(s.fontSize)};});
 const frames=[...document.querySelectorAll('.selected-projects-mobile .phone-frame')].map(el=>{const r=el.getBoundingClientRect();return {width:r.width,left:r.left,right:r.right};});
 const nav=document.querySelector('.primary-nav'),n=nav.getBoundingClientRect(),word=document.querySelector('.wordmark').getBoundingClientRect(),actions=document.querySelector('.header-actions').getBoundingClientRect();
 return {viewport:innerWidth,shells,occupancy:shells[0].width/innerWidth,alignedShells:shells.every(s=>Math.abs(s.left-shells[0].left)<1&&Math.abs(s.right-shells[0].right)<1),overflow:document.documentElement.scrollWidth>innerWidth,rowsAligned:rows.every(row=>Math.max(...row)-Math.min(...row)<1),paragraphs,frames,navFits:innerWidth<768||word.right<=n.left&&n.right<=actions.left};
};
try{
 const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`;
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await page.goto(base+'/index.html',{settleMs:150});await page.eval(()=>document.fonts.ready);
 for(const theme of ['dark','light']){
  await page.eval(theme=>document.documentElement.dataset.theme=theme,theme);
  for(const width of [320,390,768,1024,1440,1920,2560,3440,3840]){
   const height=width>=3440?1440:width>=2560?1440:width>=1920?1080:1000;
   await page.setViewport({width,height});
   const detail=await page.eval(measure);
   const sized=width<1600||detail.occupancy>=.85;
   const framesFit=detail.frames.every(f=>f.left>=0&&f.right<=width&&(width<1920||f.width>=300));
   const readable=detail.paragraphs.every(p=>p.width/p.font<=37&&p.font>=16);
   check(`${theme} ${width}px: fluid frame, readable copy and aligned projects`,sized&&framesFit&&readable&&detail.alignedShells&&!detail.overflow&&detail.navFits&&(width<=1000||detail.rowsAligned),detail);
   if(theme==='dark'&&[390,1920,2560].includes(width)){
    await page.eval(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${out}/home-${width}.jpg`});
    await page.eval(()=>document.querySelector('.selected-projects-mobile').scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:`${out}/phones-${width}.jpg`});
   }
  }
 }
 await page.setViewport({width:2073,height:1200,dsf:.9});const zoom=await page.eval(measure);
 check('90% desktop scaling still uses the viewport',zoom.occupancy>=.85&&!zoom.overflow&&zoom.rowsAligned,zoom);
 await page.setViewport({width:1920,height:1080,dsf:2});const hidpi=await page.eval(measure);
 check('HiDPI scaling retains the responsive layout',hidpi.occupancy>=.85&&!hidpi.overflow,hidpi);
 await page.setViewport({width:2560,height:1440});await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await page.goto(base+'/index.html',{settleMs:200});await page.eval(()=>document.querySelector('.selected-projects-mobile').scrollIntoView({block:'start',behavior:'instant'}));
 let plays=false;for(let i=0;i<40;i++){plays=await page.eval(()=>[...document.querySelectorAll('.selected-projects-mobile video')].every(v=>!v.paused&&v.currentTime>0&&!v.controls));if(plays)break;await wait(100);}
 check('QHD phone previews autoplay together without controls',plays);
}finally{await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
