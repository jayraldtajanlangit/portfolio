import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { writeFileSync } from 'node:fs';
const browser = await Browser.launch();
const results = [];
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8765');
  console.log('FONT DEBUG', JSON.stringify(await page.eval(async () => ({faces:[...document.fonts].map(f=>({family:f.family,status:f.status,weight:f.weight})),css:await (await fetch(document.querySelector('link[href*="v2/css"]').href)).text()}))));
  for (const path of ['index.html', 'projects/maistra.html', 'projects/skyfire.html', 'projects/bulk-buying-companion.html', 'projects/pulso.html', 'projects/sige.html']) {
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewport({width,height:900});
      await page.goto('http://127.0.0.1:8765/'+path,{settleMs:150});
      const result = await page.eval(() => ({overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),h1:document.querySelector('h1')?.innerText,links:[...document.querySelectorAll('a[href]')].filter(a=>new URL(a.href).origin===location.origin).map(a=>a.getAttribute('href'))}));
      results.push({path,width,...result,errors:page.consoleErrors});
    }
  }
  await page.setViewport({width:390,height:844});
  await page.goto('http://127.0.0.1:8765',{settleMs:100});
  const nav = await page.eval(async () => {
    const button=document.querySelector('[data-nav-toggle]'), menu=document.querySelector('#primary-navigation');
    const initial=menu.hidden;
    button.click(); const opened=!menu.hidden && button.getAttribute('aria-expanded')==='true';
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    const escaped=menu.hidden && document.activeElement===button;
    button.click(); menu.querySelector('a').click();
    return {initial,opened,escaped,closedAfterLink:menu.hidden};
  });
  results.push({navigation:nav});
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await page.goto('http://127.0.0.1:8765',{settleMs:100});
  results.push({reducedMotion:await page.eval(()=>({animations:document.getAnimations().length,paused:document.querySelector('video').paused,headlineVisible:getComputedStyle(document.querySelector('h1')).opacity==='1'}))});
  await page.send('Emulation.setScriptExecutionDisabled',{value:true});
  await page.goto('http://127.0.0.1:8765',{settleMs:100});
  results.push({noJS:await page.eval(()=>({navVisible:!document.querySelector('#primary-navigation').hidden,projects:document.querySelectorAll('.work-entry').length,videoControls:document.querySelector('video').controls}))});
  writeFileSync('.taste-skill/uiux-functional.json',JSON.stringify(results,null,2));
  console.log('QA',JSON.stringify(results));
} finally { await browser.close(); }

