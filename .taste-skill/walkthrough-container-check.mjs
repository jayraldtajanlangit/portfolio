import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const out='.taste-skill/walkthrough-container',results=[];
await mkdir(out,{recursive:true});
const browser=await Browser.launch();
try {
 const page=await browser.newPage();
 for (const slug of ['skyfire','maistra','bulk-buying-companion','pulso','sige']) {
  await page.goto(pathToFileURL(resolve(`projects/${slug}.html`)).href,{settleMs:100});
  for (const mode of ['light','dark']) {
   await page.eval(mode=>document.documentElement.dataset.theme=mode,mode);
   for (const width of [320,390,768,1522,1857]) {
    await page.setViewport({width,height:1000});
    const detail=await page.eval(()=>{
     const card=document.querySelector('.case-lead-media'),stage=card.querySelector('.project-media-stage'),video=card.querySelector('video');
     const c=card.getBoundingClientRect(),s=stage.getBoundingClientRect(),v=video.getBoundingClientRect();
     const portrait=!!card.querySelector('.project-media--portrait');
     return {portrait,card:{x:c.x,width:c.width},stage:{x:s.x,width:s.width,height:s.height},video:{x:v.x,width:v.width,height:v.height},ratio:video.videoWidth/video.videoHeight,controls:video.controls,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    const near=(a,b)=>Math.abs(a-b)<2;
    const pass=!detail.overflow&&detail.controls&&detail.video.height<=721&&near(detail.card.width,detail.stage.width)&&near(detail.card.x,detail.stage.x)&&(detail.portrait?near(detail.video.x+detail.video.width/2,detail.stage.x+detail.stage.width/2):near(detail.video.width,detail.card.width)&&near(detail.video.width/detail.video.height,detail.ratio));
    results.push({slug,mode,width,pass,detail});
    console.log(`${pass?'PASS':'FAIL'} ${slug} ${mode} ${width}${pass?'':' '+JSON.stringify(detail)}`);
    if(!pass)process.exitCode=1;
    if(['skyfire','pulso'].includes(slug)&&[390,1522].includes(width)) {
     await page.eval(()=>{document.querySelector('video').pause();document.querySelector('.case-lead-media').scrollIntoView({block:'start',behavior:'instant'});});
     await page.screenshot({path:`${out}/${slug}-${mode}-${width}.jpg`});
    }
   }
  }
 }
} finally {await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
