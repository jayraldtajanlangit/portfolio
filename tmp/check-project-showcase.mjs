import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
const root=resolve('.'),out=join(tmpdir(),'portfolio-project-showcase');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.ttf':'font/ttf','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+sep))return res.writeHead(403).end();
    res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));
  }catch{res.writeHead(404).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}`,browser=await Browser.launch(),results=[];
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(pass?'PASS':'FAIL',name,JSON.stringify(pass?{minContrast:detail?.minContrast,mobileDelta:detail?.mobileDelta}:detail));if(!pass)process.exitCode=1;};
try{
  const page=await browser.newPage();
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await page.goto(base+'/#work',{settleMs:100});await page.eval(()=>document.fonts.ready);
  for(const theme of ['dark','light']){
    await page.eval(value=>document.documentElement.dataset.theme=value,theme);
    for(const width of [320,390,768,1024,1440,1820]){
      await page.setViewport({width,height:1100});
      const detail=await page.eval(()=>{
        const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');
        const rgba=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
        const lum=color=>rgba(color).slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
        const contrast=el=>{let bg;for(let node=el;node;node=node.parentElement){const value=getComputedStyle(node).backgroundColor;if(rgba(value)[3]===255){bg=value;break;}}const a=lum(getComputedStyle(el).color),b=lum(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
        const cards=[...document.querySelectorAll('.selected-work .selected-project')].map((card,index)=>{
          const box=card.getBoundingClientRect(),video=card.querySelector('video'),media=card.querySelector('figure').getBoundingClientRect(),preview=card.querySelector('.selected-project-preview').getBoundingClientRect(),caption=card.querySelector('figcaption').getBoundingClientRect(),button=card.querySelector('.selected-project-case-study').getBoundingClientRect();
          const text=[...card.querySelectorAll('.selected-project-eyebrow,.selected-project-role,h3,.selected-project-summary,.selected-project-contribution,.selected-project-chip,.project-step-label')];
          const textFits=text.every(el=>{const b=el.getBoundingClientRect();return b.left>=box.left-1&&b.right<=box.right+1&&el.scrollWidth<=el.clientWidth+1;});
          const colors=[...card.querySelectorAll('.selected-project-number,.selected-project-platform,.selected-project-role,.selected-project-flow-label,.project-step-number,.project-step-label')].map(el=>({text:el.textContent,ratio:+contrast(el).toFixed(2)}));
          const b=video.getBoundingClientRect();
          return {id:card.id,number:card.querySelector('.selected-project-number').textContent,steps:card.querySelectorAll('.selected-project-steps li').length,fits:box.left>=0&&box.right<=innerWidth&&textFits&&b.left>=media.left&&b.right<=media.right&&button.bottom<=box.bottom&&caption.top>=preview.bottom-1,buttonY:button.top,titleY:card.querySelector('h3').getBoundingClientRect().top,buttonHeight:button.height,video:video.muted&&video.loop&&!video.controls&&getComputedStyle(video).objectFit==='contain',colors};
        });
        const mobile=cards.slice(2);return {overflow:document.documentElement.scrollWidth>innerWidth,cards,minContrast:Math.min(...cards.flatMap(c=>c.colors.map(x=>x.ratio))),mobileDelta:Math.max(...mobile.map(c=>c.buttonY))-Math.min(...mobile.map(c=>c.buttonY)),mobileTitleDelta:Math.max(...mobile.map(c=>c.titleY))-Math.min(...mobile.map(c=>c.titleY)),prototype:document.querySelector('#project-sige figcaption').textContent.includes('Tasks UI prototype')};
      });
      check(`${theme} ${width}px: all five showcase cards`,!detail.overflow&&detail.cards.length===5&&detail.cards.every((c,i)=>c.fits&&c.steps===3&&c.number===String(i+1).padStart(2,'0')&&c.video&&c.buttonHeight>=44)&&detail.minContrast>=4.5&&detail.prototype&&(width<=1100||detail.mobileDelta<=1&&detail.mobileTitleDelta<=1),detail);
      if([390,1440].includes(width)){
        await page.eval(()=>document.querySelector('#work').scrollIntoView({block:'start',behavior:'instant'}));
        await page.screenshot({path:join(out,`${theme}-${width}-skyfire.png`)});
        if(width===1440){
          await page.eval(()=>document.querySelector('#project-maistra').scrollIntoView({block:'start',behavior:'instant'}));
          await page.screenshot({path:join(out,`${theme}-maistra.png`)});
          await page.setViewport({width,height:1800});
          await page.eval(()=>document.querySelector('.selected-projects-mobile').scrollIntoView({block:'start',behavior:'instant'}));
          await page.screenshot({path:join(out,`${theme}-mobile-projects.png`)});
        }
      }
    }
  }
  await page.setViewport({width:1440,height:1200});
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  for(const selector of ['#project-skyfire','#project-maistra','.selected-projects-mobile']){
    await page.eval(sel=>document.querySelector(sel).scrollIntoView({block:'start',behavior:'instant'}),selector);
    await page.eval(()=>new Promise(done=>setTimeout(done,900)));
    const videos=await page.eval(sel=>[...document.querySelectorAll(`${sel} video`)].map(v=>({playing:!v.paused,time:v.currentTime})),selector);
    check(`${selector} recordings play with the new captions`,videos.every(v=>v.playing&&v.time>0),videos);
  }
  await page.eval(()=>document.querySelector('#project-sige video').focus());
  await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});
  await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
  check('keyboard can still pause a recording',await page.eval(()=>document.querySelector('#project-sige video').paused));

  const motion=await browser.newPage();await motion.setViewport({width:1440,height:1200});
  await motion.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await motion.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__projectReveals=[];const nativeAnimate=Element.prototype.animate;Element.prototype.animate=function(frames,options){if(this.matches('.selected-project-media,.selected-project-copy'))window.__projectReveals.push({id:this.closest('.selected-project').id,preview:this.matches('.selected-project-media'),delay:options.delay});return nativeAnimate.call(this,frames,options);};`});
  await motion.goto(base+'/#work',{settleMs:100});await motion.eval(()=>document.fonts.ready);
  for(const selector of ['#project-skyfire','#project-maistra','.selected-projects-mobile']){
    await motion.eval(sel=>document.querySelector(sel).scrollIntoView({block:'start',behavior:'instant'}),selector);
    await motion.eval(()=>new Promise(done=>setTimeout(done,200)));
  }
  const reveals=await motion.eval(()=>window.__projectReveals);
  const pairs=['skyfire','maistra','bulk-buying-companion','pulso','sige'].map(slug=>reveals.filter(r=>r.id===`project-${slug}`));
  check('all five previews reveal before their details, once each',pairs.every(pair=>pair.length===2&&pair.find(r=>!r.preview).delay-pair.find(r=>r.preview).delay===140),reveals);
  await motion.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await motion.eval(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
  const reduced=await motion.eval(()=>({matches:matchMedia('(prefers-reduced-motion: reduce)').matches,motionClass:document.documentElement.classList.contains('portfolio-motion'),active:document.getAnimations().filter(a=>a.effect?.target?.matches?.('.selected-project-media,.selected-project-copy')).length}));
  check('reduced motion cancels project reveals',reduced.matches&&!reduced.motionClass&&reduced.active===0,reduced);
}finally{
  await writeFile(join(out,'results.json'),JSON.stringify(results,null,2));
  await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));
  console.log(`Verified ${results.filter(r=>r.pass).length}/${results.length}. Screenshots: ${out}`);
}
