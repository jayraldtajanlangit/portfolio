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
  const page=await browser.newPage({width:1440,height:900});
  const url=`http://127.0.0.1:${server.address().port}/index.html`;
  await page.goto(url,{timeoutMs:10000,settleMs:150});
  await page.send('Page.bringToFront');
  for(const mode of ['light','dark','system']) {
    await page.eval(mode=>{document.querySelector('[data-theme-trigger]').click();document.querySelector(`[data-theme-option="${mode}"]`).click();},mode);
    for(const width of [320,390,768,1440]) {
      await page.setViewport({width,height:900});
      const detail=await page.eval(()=>{
        const section=document.querySelector('#contact'); section.scrollIntoView({block:'start',behavior:'instant'});
        const address=section.querySelector('.contact-email'), button=section.querySelector('[data-email-copy]');
        return {overflow:document.documentElement.scrollWidth>innerWidth,mailLinks:[...document.querySelectorAll('a[href^="mailto:"]')].every(a=>a.getAttribute('href')==='mailto:jayraldtajanlangit123@gmail.com'),copyVisible:!button.hidden,emailFont:parseFloat(getComputedStyle(address).fontSize),fitting:[...section.querySelectorAll('a,button')].every(el=>el.getBoundingClientRect().right<=innerWidth && el.getBoundingClientRect().left>=0),socials:section.querySelectorAll('.contact-socials a').length,keyboard:button.tabIndex===0};
      });
      check(`${mode} ${width}px: contact actions and address fit`,!detail.overflow && detail.mailLinks && detail.copyVisible && detail.emailFont>=20 && detail.fitting && detail.socials===2 && detail.keyboard,detail);
      if(mode!=='system' && [390,1440].includes(width)) {
        await page.eval(()=>new Promise(resolve=>setTimeout(resolve,800)));
        await page.screenshot({path:`.taste-skill/contact-${mode}-${width}.jpg`});
      }
    }
  }
  // Exercise the page event handler without replacing the user's system clipboard.
  const copied=await page.eval(async()=>{
    const clipboard=navigator.clipboard;
    Object.defineProperty(clipboard,'writeText',{configurable:true,value:async text=>{window.contactTestCopied=text;}});
    document.querySelector('[data-email-copy]').click();
    await new Promise(resolve=>setTimeout(resolve,50));
    return {text:window.contactTestCopied,label:document.querySelector('[data-copy-label]').textContent,status:document.querySelector('[data-copy-status]').textContent};
  });
  check('copy action writes the email and announces success',copied.text==='jayraldtajanlangit123@gmail.com' && copied.label==='Copied' && copied.status==='Email copied to clipboard.',copied);
  const denied=await page.eval(async()=>{
    Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw new Error('Permission denied');}});
    document.querySelector('[data-email-copy]').click();
    await new Promise(resolve=>setTimeout(resolve,50));
    return {label:document.querySelector('[data-copy-label]').textContent,status:document.querySelector('[data-copy-status]').textContent,disabled:document.querySelector('[data-email-copy]').disabled};
  });
  check('denied clipboard offers manual copying and retry',denied.label==='Copy email' && denied.status.includes('Select the email address') && !denied.disabled,denied);
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const reduced=await page.eval(()=>getComputedStyle(document.querySelector('.contact-compose svg')).transitionDuration==='0s' && [...document.querySelectorAll('.contact-details > *')].every(el=>getComputedStyle(el).opacity==='1'));
  check('reduced motion keeps contact visible without moving controls',reduced);
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs',{urls:['*js/contact.js','*js/site.js','*js/motion.js']});
  await page.goto(url,{timeoutMs:10000,settleMs:100});
  const fallback=await page.eval(()=>document.querySelector('[data-email-copy]').hidden && document.querySelector('.contact-compose').getAttribute('href')==='mailto:jayraldtajanlangit123@gmail.com' && document.querySelector('.contact-email').textContent==='jayraldtajanlangit123@gmail.com');
  check('without enhancement the email remains usable and copy is hidden',fallback);
} finally {
  await browser.close(); await new Promise(resolve=>server.close(resolve));
  await writeFile('.taste-skill/contact-results.json',JSON.stringify(results,null,2));
}
