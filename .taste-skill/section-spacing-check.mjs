import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),stage=process.argv[2]||'composed',out=`.taste-skill/section-spacing/${stage}`,results=[];
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
  for(const width of [320,390,768,1024,1440,1857]){
   await page.setViewport({width,height:700});
   const detail=await page.eval(()=>{
    const headers=[...document.querySelectorAll('#work > .section-heading,#tech-stack > .section-heading')].map(el=>{const h=el.querySelector('h2').getBoundingClientRect(),p=el.querySelector('p').getBoundingClientRect();return {left:Math.abs(h.left-p.left),horizontalGap:p.left-h.right,verticalGap:p.top-h.bottom,overlap:p.top<h.bottom&&p.bottom>h.top};});
    const groups=[...document.querySelectorAll('.tech-stack-group')].map(el=>{const h=el.querySelector('h3').getBoundingClientRect(),list=el.querySelector('ul').getBoundingClientRect();return {labelWidth:h.width,horizontalGap:list.left-h.right,verticalGap:list.top-h.bottom,stacked:Math.abs(list.left-h.left)<1};});
    const links=[...document.querySelectorAll('.tech-logo-link')].map(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth;});
    const categoryTops=[...document.querySelectorAll('.tech-stack-group')].map(el=>el.getBoundingClientRect().top);
    return {headers,groups,links,categoryTops,overflow:document.documentElement.scrollWidth>innerWidth};
   });
   const headersFit=detail.headers.every(h=>width<768?h.left<1&&h.verticalGap>=10&&h.verticalGap<=17:h.horizontalGap>=24&&h.horizontalGap<=57&&h.overlap);
   const categoriesFit=width<1100||Math.abs(detail.categoryTops[0]-detail.categoryTops[1])<1;
   check(`${theme} ${width}px: composed headings and balanced technology groups`,headersFit&&categoriesFit&&detail.groups.every(g=>g.stacked?g.verticalGap>=10&&g.verticalGap<=17:g.labelWidth<=120&&g.horizontalGap>=16&&g.horizontalGap<=25)&&detail.links.every(Boolean)&&!detail.overflow,detail);
   if([390,1440].includes(width))for(const id of ['work','tech-stack']){await page.eval(id=>document.getElementById(id).scrollIntoView({block:'start',behavior:'instant'}),id);await wait(50);await page.screenshot({path:`${out}/${theme}-${width}-${id}.jpg`});}
  }
 }
 await page.setViewport({width:390,height:700});await page.eval(()=>document.querySelector('.tech-logo-link').focus());
 check('technology label remains visible on keyboard focus',await page.eval(()=>{const link=document.activeElement,label=link.querySelector('.tech-logo-name'),r=label.getBoundingClientRect();return getComputedStyle(label).visibility==='visible'&&r.left>=0&&r.right<=innerWidth;}));
}finally{await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
