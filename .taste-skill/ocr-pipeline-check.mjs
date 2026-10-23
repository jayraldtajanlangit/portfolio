import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const out='.taste-skill/ocr-pipeline',results=[];
await mkdir(out,{recursive:true});
const browser=await Browser.launch();
try {
 const page=await browser.newPage();
 await page.goto(pathToFileURL(resolve('projects/maistra.html')).href,{settleMs:100});
 for (const mode of ['light','dark']) {
  await page.eval(mode=>document.documentElement.dataset.theme=mode,mode);
  for (const width of [390,768,1440]) {
   await page.setViewport({width,height:1100});
   const detail=await page.eval(()=>{
    const section=document.querySelector('.case-section--system');
    section.scrollIntoView({block:'start',behavior:'instant'});
    const items=[...section.querySelectorAll('.system-flow li')];
    return {count:items.length,headings:items.map(el=>el.querySelector('h3').textContent),overflow:document.documentElement.scrollWidth>innerWidth,readable:items.every(el=>{const b=el.getBoundingClientRect();return b.width>0&&b.left>=0&&b.right<=innerWidth&&getComputedStyle(el).visibility==='visible';}),tools:['OpenCV','PaddleOCR','Supabase','Judge0'].every(tool=>section.textContent.includes(tool))};
   });
   const pass=detail.count===6&&!detail.overflow&&detail.readable&&detail.tools;
   results.push({mode,width,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${mode} ${width} ${JSON.stringify(detail)}`);
   if(!pass)process.exitCode=1;
   await page.screenshot({path:`${out}/${mode}-${width}.jpg`});
  }
 }
}finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
