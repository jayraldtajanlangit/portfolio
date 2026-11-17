import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('.'), out = resolve('.taste-skill/swarm-restored');
await mkdir(out, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const server = createServer((req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!path.startsWith(root + sep)) return res.writeHead(403).end();
    res.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream', 'content-length': statSync(path).size });
    createReadStream(path).pipe(res);
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await Browser.launch(), results = [];
const check = (label, pass, detail) => { results.push({ label, pass, detail }); console.log(pass ? 'PASS' : 'FAIL', label, JSON.stringify(detail || '')); if (!pass) process.exitCode = 1; };
try {
 const page=await browser.newPage();
 for(const width of [1440,390]) {
  await page.setViewport({width,height:900});
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.goto(base+'/index.html',{settleMs:300});
  const state=await page.eval(async()=>{
   const start=performance.now();
   while(!window.__swarmRebuild?.app?.engine?.started&&performance.now()-start<20000)await new Promise(done=>setTimeout(done,100));
   const app=window.__swarmRebuild?.app;
   if(!app?.engine?.started)return {started:false};
   const max=window.__swarmRebuildOptions.agents.max;
   const counts=[];
   for(let i=0;i<24;i++){counts.push(app.engine.cursors.length);await new Promise(done=>setTimeout(done,150));}
   const pause=app.view.root.querySelector('[data-a="pause"]');pause.click();
   const paused=app.paused;
   const scroll=scrollY;await new Promise(done=>setTimeout(done,200));
   const stable=scrollY===scroll;
   pause.click();
   return {started:true,max,counts,paused,stable,resumed:!app.paused,items:app.model.items.length,host:!!document.querySelector('swarm-rebuild')};
  });
  check(`${width}px real rebuild starts with at most 10 agents and working Pause`,state.started&&state.max===10&&state.counts.every(n=>n<=10)&&state.paused&&state.stable&&state.resumed&&state.items>0&&state.host,state);
  await page.screenshot({path:`${out}/swarm-${width}.jpg`});
  await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  const closed=await page.eval(async()=>{await new Promise(done=>setTimeout(done,350));return !document.querySelector('swarm-rebuild')&&!window.__swarmRebuild.app&&getComputedStyle(document.body).visibility==='visible'&&!document.documentElement.dataset.swarmBuild;});
  check(`${width}px Escape dismisses the rebuild and reveals the portfolio`,closed);
 }
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await page.goto(base+'/index.html?reduced=1',{settleMs:500});
 check('reduced motion displays the portfolio without a rebuild',await page.eval(()=>!document.querySelector('swarm-rebuild')&&!document.documentElement.dataset.swarmBuild&&getComputedStyle(document.body).visibility==='visible'&&document.querySelectorAll('.credential-link').length===8));
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await page.goto(base+'/index.html#certifications',{settleMs:500});
 check('direct links keep their section without starting a rebuild',await page.eval(()=>!document.querySelector('swarm-rebuild')&&location.hash==='#certifications'&&!document.documentElement.dataset.swarmBuild));
 check('no browser exceptions',page.consoleErrors.length===0,page.consoleErrors);
} finally {await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));
