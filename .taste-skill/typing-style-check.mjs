import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Browser} from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const root=resolve('.'), out='.taste-skill/typing-style-final', results=[];
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await Browser.launch();
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail)}`);if(!pass)process.exitCode=1;};
try{
 const page=await browser.newPage();
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{settleMs:700});
 await page.eval(()=>document.fonts.ready);
 for(const mode of ['light','dark']){
  await page.eval(mode=>{if(document.documentElement.dataset.theme!==mode)document.querySelector('[data-theme-trigger]').click();},mode);
  for(const width of [320,360,375,390,428,768,1440]){
   await page.setViewport({width,height:700});
   const layout=await page.eval(()=>{
    const text=document.querySelector('[data-typing-words]'), line=text.closest('.typing-line'), words=JSON.parse(text.dataset.typingWords), style=getComputedStyle(line);
    const states=words.flatMap(word=>[word,'']).map(word=>{text.textContent=word;const box=text.getBoundingClientRect();return {word,top:document.querySelector('.intro-description').getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth,fits:box.right<=innerWidth};});
    text.textContent=words[2];
    return {states,font:style.fontFamily,weight:style.fontWeight,size:parseFloat(style.fontSize),words,noButton:!document.querySelector('[data-typing-toggle]')};
   });
   check(`${mode} ${width}px: medium Manrope and stable full phrases`,layout.weight==='500'&&layout.font.includes('Manrope')&&layout.noButton&&JSON.stringify(layout.words)===JSON.stringify(['web development','mobile development','artificial intelligence'])&&layout.states.every(s=>!s.overflow&&s.fits)&&Math.max(...layout.states.map(s=>s.top))-Math.min(...layout.states.map(s=>s.top))<1,layout);
   if([390,1440].includes(width))await page.screenshot({path:`${out}/${mode}-${width}.jpg`});
  }
 }
 await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await page.setViewport({width:320,height:700});
 check('reduced motion keeps all three interests readable',await page.eval(()=>{const text=document.querySelector('.typing-static');return getComputedStyle(text).position==='static'&&text.textContent==='I’m interested in web development, mobile development, and artificial intelligence.'&&document.documentElement.scrollWidth<=innerWidth;}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
