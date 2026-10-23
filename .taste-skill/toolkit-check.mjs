import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root = resolve('.'), results = [];
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.ttf':'font/ttf', '.webp':'image/webp', '.jpg':'image/jpeg', '.mp4':'video/mp4', '.webm':'video/webm' };
const server = createServer(async (req,res) => {
  try {
    let path = resolve(root, '.' + new URL(req.url,'http://local').pathname);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path,'index.html');
    res.setHeader('Content-Type',types[extname(path)] || 'application/octet-stream'); res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const browser = await Browser.launch();
const check = (name,pass,detail) => { results.push({name,pass,detail}); console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`); if(!pass) process.exitCode=1; };
try {
  const page=await browser.newPage({width:1440,height:1000});
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{timeoutMs:10000,settleMs:100});
  for (const mode of ['light','dark','system']) {
    await page.eval(mode => { document.querySelector('[data-theme-trigger]').click(); document.querySelector(`[data-theme-option="${mode}"]`).click(); },mode);
    for(const width of [320,390,768,1440]) {
      await page.setViewport({width,height:1000});
      const detail=await page.eval(() => {
        const section=document.querySelector('#tech-stack');
        section.scrollIntoView({block:'start',behavior:'instant'});
        const rows=[...section.querySelectorAll('.tech-stack-row')];
        return {overflow:document.documentElement.scrollWidth>innerWidth,rows:rows.length,heading:section.querySelector('h2').textContent,icons:rows.every(row=>row.querySelector('svg[aria-hidden="true"]')),visible:rows.every(row=>row.getBoundingClientRect().width>0 && getComputedStyle(row).visibility==='visible'),fiveProjects:document.querySelectorAll('[data-walkthrough-preview]').length===5,links:[...section.querySelectorAll('a')].map(a=>a.href),fitting:rows.every(row=>row.scrollWidth<=row.clientWidth)};
      });
      check(`${mode} ${width}px: complete toolkit fits and keeps five project previews`, !detail.overflow && detail.rows===4 && detail.heading==='My toolkit' && detail.icons && detail.visible && detail.fiveProjects && detail.fitting,detail);
      if(mode!=='system' && [390,1440].includes(width)) {
        await page.eval(()=>new Promise(resolve=>setTimeout(resolve,1000)));
        await page.screenshot({path:`.taste-skill/toolkit-${mode}-${width}.jpg`});
      }
    }
  }
  const urls=await page.eval(()=>[...new Set([...document.querySelectorAll('#tech-stack a')].map(a=>a.href))]);
  const statuses=await Promise.all(urls.map(async url=>(await fetch(url)).status));
  check('all toolkit project examples resolve',statuses.every(status=>status===200),statuses);
  const focus=await page.eval(()=>{const link=document.querySelector('#tech-stack a');link.focus();return document.activeElement===link;});
  check('project examples accept keyboard focus',focus);
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const reduced=await page.eval(()=>({transition:getComputedStyle(document.querySelector('#tech-stack a span')).transitionDuration,visible:[...document.querySelectorAll('.tech-stack-row')].every(row=>getComputedStyle(row).opacity==='1')}));
  check('reduced motion keeps toolkit visible and removes link transitions',reduced.transition==='0s' && reduced.visible,reduced);
} finally {
  await browser.close(); await new Promise(resolve=>server.close(resolve));
  await writeFile('.taste-skill/toolkit-results.json',JSON.stringify(results,null,2));
}
