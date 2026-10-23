import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { writeFileSync } from 'node:fs';
const browser = await Browser.launch();
const results = [];
try {
 const page = await browser.newPage();
 for (const path of ['index.html','projects/maistra.html','projects/skyfire.html','projects/bulk-buying-companion.html','projects/pulso.html','projects/sige.html']) {
  await page.goto(`http://127.0.0.1:8765/${path}`, {timeoutMs:5000,settleMs:100});
  await page.eval(async()=>{for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
  for (const width of path==='index.html' ? [375,768,1024,1440] : [390,1440]) {
   await page.setViewport({width,height:1000});
   const result = await page.eval(()=>({overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>!i.naturalWidth).length,title:document.title}));
   results.push({path,width,...result});
   if(result.overflow||result.brokenImages) process.exitCode=1;
   if(path==='index.html' && [375,1440].includes(width)) {
    await page.screenshot({path:`.taste-skill/student-${width}-fold.jpg`});
    await page.screenshot({path:`.taste-skill/student-${width}-page.jpg`,fullPage:true});
   }
  }
 }
 await page.setViewport({width:390,height:1000});
 await page.goto('http://127.0.0.1:8765/',{timeoutMs:5000,settleMs:100});
 const interactions=await page.eval(()=>{
  const toggle=document.querySelector('[data-nav-toggle]'),menu=document.querySelector('#primary-navigation');
  toggle.click(); const menuOpens=!menu.hidden;
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  const menuCloses=menu.hidden&&document.activeElement===toggle;
  const walkthrough=document.querySelector('.project-walkthrough');walkthrough.querySelector('summary').click();
  const mediaVisible=walkthrough.open&&walkthrough.querySelector('video').controls;
  return {menuOpens,menuCloses,mediaVisible,stackLinks:document.querySelectorAll('#tech-stack dd a').length,studentCopy:document.querySelector('main').innerText.includes('Student developer seeking an internship')};
 });
 results.push(interactions);
 if(!interactions.menuOpens||!interactions.menuCloses||!interactions.mediaVisible||!interactions.studentCopy)process.exitCode=1;
 writeFileSync('.taste-skill/student-results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results));
} finally {await browser.close();}
