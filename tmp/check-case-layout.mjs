import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
const stage=process.argv[2]||'after',root=resolve('.'),out=join(tmpdir(),'portfolio-case-layout',stage);await mkdir(out,{recursive:true});
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.ttf':'font/ttf','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm'};
const server=createServer(async(req,res)=>{try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+pathname);
  if(!file.startsWith(root+sep))return res.writeHead(403).end();
  res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}`,browser=await Browser.launch(),results=[];
try{
  const page=await browser.newPage();
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  for(const slug of ['skyfire','maistra','bulk-buying-companion','pulso','sige']){
    await page.goto(`${base}/projects/${slug}.html`,{settleMs:100});await page.eval(()=>document.fonts.ready);
    for(const theme of stage==='before'?['dark']:['dark','light']){
      await page.eval(value=>document.documentElement.dataset.theme=value,theme);
      for(const width of stage==='before'?[390,1440]:[320,390,768,1024,1440,1820]){
        await page.setViewport({width,height:1000});
        // MatchMedia navigation handlers run on the next rendering frame.
        await page.eval(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
        const detail=await page.eval(()=>{
          const box=el=>el.getBoundingClientRect(),hero=document.querySelector('.case-hero'),rail=box(hero),title=box(document.querySelector('.case-title-block')),dossier=box(document.querySelector('.case-dossier')),media=box(document.querySelector('.case-lead-media'));
          const headings=[...document.querySelectorAll('.case-section-heading')].map(el=>({title:el.textContent.trim(),delta:Math.abs(box(el).left-rail.left)}));
          const sections=[...document.querySelectorAll('.case-section')];
          const gaps=[box(sections[0].querySelector('.case-section-heading')).top-media.bottom,...sections.slice(0,-1).map((section,i)=>box(sections[i+1].querySelector('.case-section-heading')).top-Math.max(...[...section.children].map(el=>box(el).bottom)))];
          const entries=[...document.querySelectorAll('.workflow-entry')].map(box),galleryDelta=Math.max(...entries.map(b=>b.top))-Math.min(...entries.map(b=>b.top));
          const portrait=!!document.querySelector('.case-lead-media--portrait');
          const frames=[...document.querySelectorAll('.phone-frame')].map(frame=>{
            const f=box(frame),s=box(frame.querySelector('.phone-frame-screen')),capture=box(frame.querySelector('video,img'));
            return f.left>=0&&f.right<=innerWidth&&Math.abs(s.width-capture.width)<1&&Math.abs(s.height-capture.height)<1;
          });
          const table=document.querySelector('.decision-ledger'),tableBox=box(table);
          const header=document.querySelector('.site-header-inner'),headerControls=[...header.querySelectorAll('.nav-toggle,.theme-trigger')].filter(el=>el.getClientRects().length).map(box);
          return {overflow:document.documentElement.scrollWidth>innerWidth,headingDelta:Math.max(...headings.map(h=>h.delta)),headings,maxGap:Math.max(...gaps),gaps,portrait,introBesidePreview:media.left>=title.right+15,titleDossierGap:dossier.top-title.bottom,galleryDelta,frames,tableFits:tableBox.left>=0&&tableBox.right<=innerWidth,controls:document.querySelector('video').controls,headerHeight:box(header).height,headerControlsFit:headerControls.every(b=>b.left>=0&&b.right<=innerWidth&&b.width>=44&&b.height>=44)};
        });
        const pass=!detail.overflow&&detail.headingDelta<=2&&detail.maxGap<=60&&detail.gaps.every(g=>g>=0)&&detail.frames.every(Boolean)&&detail.tableFits&&detail.controls&&detail.headerControlsFit&&(width>=768||detail.headerHeight<=100)&&(width<1024||!detail.portrait||detail.introBesidePreview&&detail.titleDossierGap<=32)&&(width<1100||!detail.portrait||detail.galleryDelta<=1);
        results.push({slug,theme,width,pass,...detail});
        console.log(pass?'PASS':'FAIL',slug,theme,width,JSON.stringify({headingDelta:detail.headingDelta,maxGap:detail.maxGap,beside:detail.introBesidePreview,galleryDelta:detail.portrait?detail.galleryDelta:undefined,overflow:detail.overflow}));
        if(!pass)process.exitCode=1;
        if(theme==='dark'&&[390,1440].includes(width)&&['skyfire','pulso'].includes(slug)){
          await page.eval(()=>scrollTo({top:0,behavior:'instant'}));
          await page.screenshot({path:join(out,`${slug}-${width}-intro.png`)});
          if(width===1440){
            await page.eval(()=>document.querySelector('.case-section--problem').scrollIntoView({block:'start',behavior:'instant'}));
            await page.screenshot({path:join(out,`${slug}-reading.png`)});
            if(slug==='pulso'){
              await page.setViewport({width,height:1400});
              await page.eval(()=>document.querySelector('.case-section--workflow').scrollIntoView({block:'start',behavior:'instant'}));
              await page.screenshot({path:join(out,'pulso-gallery.png')});
            }
          }
        }
      }
    }
  }
  await page.setViewport({width:390,height:1000});
  await page.eval(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
  for(const action of ['open','close','theme']){
    const detail=await page.eval(action=>{
      const menu=document.querySelector('#primary-navigation'),toggle=document.querySelector('[data-nav-toggle]'),theme=document.querySelector('[data-theme-trigger]');
      const before=document.documentElement.dataset.theme;
      (action==='theme'?theme:toggle).click();
      const nav=menu.getBoundingClientRect(),button=toggle.getBoundingClientRect();
      return {pass:action==='open'?!menu.hidden&&toggle.getAttribute('aria-expanded')==='true'&&nav.top>=button.bottom:action==='close'?menu.hidden&&toggle.getAttribute('aria-expanded')==='false':document.documentElement.dataset.theme!==before,action};
    },action);
    results.push({name:`compact header ${action}`,pass:detail.pass,...detail});
    console.log(detail.pass?'PASS':'FAIL',`compact header ${action}`);
    if(!detail.pass)process.exitCode=1;
  }
}finally{
  await writeFile(join(out,'results.json'),JSON.stringify(results,null,2));
  await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));
  console.log(`Verified ${results.filter(r=>r.pass).length}/${results.length}. Screenshots: ${out}`);
}
