import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('.'), out = resolve('.taste-skill/portfolio-final');
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
 const page = await browser.newPage();
 await page.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for (const width of [1440,768,390]) {
  await page.setViewport({width,height:900});
  await page.goto(base+'/index.html',{settleMs:300});
  for (const mode of ['light','dark']) {
   await page.eval(mode => {localStorage.setItem('portfolio-theme',mode);window.dispatchEvent(new StorageEvent('storage',{key:'portfolio-theme',newValue:mode}));document.querySelector('#certifications').scrollIntoView({behavior:'instant'});},mode);
   await page.eval(async () => { await new Promise(requestAnimationFrame); await document.querySelector('.credential-icon[src]').decode(); });
   const layout = await page.eval(() => ({
    overflow:document.documentElement.scrollWidth>innerWidth,
    links:[...document.querySelectorAll('.credential-link')].map(link=>{const r=link.getBoundingClientRect();return {fits:r.left>=0&&r.right<=innerWidth,accessible:!!link.getAttribute('aria-label'),icon:!!link.querySelector('svg path, img')};}),
    ibm:{loaded:document.querySelector('.credential-icon[src]').complete&&document.querySelector('.credential-icon[src]').naturalWidth>0,filter:getComputedStyle(document.querySelector('.credential-icon[src]')).filter},
   }));
   check(`${mode} ${width}px credentials fit and all issuer icons render`,!layout.overflow&&layout.links.length===8&&layout.links.every(link=>link.fits&&link.accessible&&link.icon)&&layout.ibm.loaded&&(mode!=='dark'||layout.ibm.filter.includes('invert(1)')),layout);
   if(width!==768)await page.screenshot({path:`${out}/${mode}-${width}-certifications.jpg`});
  }
 }
} finally {await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
await writeFile(`${out}/certifications-results.json`,JSON.stringify(results,null,2));
