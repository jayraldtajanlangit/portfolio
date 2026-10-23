import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'),stage=process.argv[2]||'after',out=`.taste-skill/landscape-fit/${stage}`,results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch();
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
 const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`;
 for(const path of ['/index.html','/.taste-skill/editorial-concept/index.html']){
  await page.goto(base+path,{settleMs:100});
  for(const theme of ['dark','light']){
   await page.eval(theme=>document.documentElement.dataset.theme=theme,theme);
   for(const width of [390,768,1381,1857]){
    await page.setViewport({width,height:1000});
    for(const slug of ['skyfire','maistra']){
     await page.eval(slug=>document.querySelector(`#project-${slug}`).scrollIntoView({block:'center',behavior:'instant'}),slug);
     for(let n=0;n<30;n++){
      if(await page.eval(slug=>{const v=document.querySelector(`#project-${slug} video`);return v.videoWidth>0&&!v.paused&&v.currentTime>0;},slug))break;
      await wait(100);
     }
     const detail=await page.eval(slug=>{
      const figure=document.querySelector(`#project-${slug} .selected-project-media`),video=figure.querySelector('video'),f=figure.getBoundingClientRect(),v=video.getBoundingClientRect(),cs=getComputedStyle(figure);
      return {figure:[f.x,f.y,f.width,f.height],video:[v.x,v.y,v.width,v.height],native:[video.videoWidth,video.videoHeight],ratioFits:Math.abs(v.width/v.height-video.videoWidth/video.videoHeight)<.002,edgeFits:Math.abs(f.x-v.x)<1&&Math.abs(f.y-v.y)<1&&Math.abs(f.width-v.width)<1&&Math.abs(f.height-v.height)<1,transparent:cs.backgroundColor==='rgba(0, 0, 0, 0)',playing:!video.paused,controls:video.controls,overflow:document.documentElement.scrollWidth>innerWidth,phoneCount:document.querySelectorAll('.phone-frame').length};
     },slug);
     const pass=detail.ratioFits&&detail.edgeFits&&detail.transparent&&detail.playing&&!detail.controls&&!detail.overflow&&detail.phoneCount===3;
     const name=`${path} ${theme} ${width}px ${slug}`;
     results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name} ${JSON.stringify(detail)}`);
     if(!pass)process.exitCode=1;
     if(path==='/index.html'&&theme==='dark'&&[390,1381].includes(width))await page.screenshot({path:`${out}/${slug}-${width}.jpg`});
    }
   }
  }
 }
}finally{
 await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));
 await browser.close();await new Promise(resolve=>server.close(resolve));
}
