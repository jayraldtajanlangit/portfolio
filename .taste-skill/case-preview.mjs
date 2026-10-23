import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const browser=await Browser.launch();
try {
 const page=await browser.newPage();
 for (const [slug,width] of [['maistra',1440],['sige',390]]) {
  await page.setViewport({width,height:900});
  await page.goto(`http://127.0.0.1:8765/projects/${slug}.html`, {timeoutMs:6000,settleMs:400});
  await page.eval(async () => { for (const img of document.images) img.loading="eager"; await Promise.all([...document.images].map(i => i.decode().catch(()=>{}))); });
  await page.screenshot({path:`.taste-skill/uiux-final/${slug}-${width}.jpg`,fullPage:true});
 }
 console.log('Case study screenshots captured');
} finally {await browser.close();}
