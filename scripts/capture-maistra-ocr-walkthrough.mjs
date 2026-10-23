// Capture the real Angular UI with real, precomputed local OCR output.
// Persistence and Judge0 responses stay in the project's isolated demo backend.
import {createServer} from 'node:http';
import {createRequire,stripTypeScriptTypes} from 'node:module';
import {access,readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

const root=resolve('.'),appRoot=resolve('../mAIstra/maistra_web');
const out=resolve('.taste-skill/maistra-ocr-recording');
await mkdir(`${out}/frames`,{recursive:true});
const require=createRequire(`${appRoot}/package.json`);
const {chromium,expect}=require('@playwright/test');
const source=await readFile(`${appRoot}/tests/e2e/support/fake-backend.ts`,'utf8');
await writeFile(`${out}/fake-backend.mjs`,stripTypeScriptTypes(source,{mode:'strip'}));
const {FakeBackend,accepted}=await import(pathToFileURL(`${out}/fake-backend.mjs`));
const ocr=JSON.parse(await readFile(`${out}/ocr-result.json`,'utf8'));
assert.ok(ocr.cleaned_text.length>30,'Actual OCR output is required before recording');
const dist=resolve(appRoot,'dist/maistra_web_temp/browser');
try {await access(`${dist}/index.html`);} catch {
 throw new Error(`Missing Angular build at ${dist}. Run npm run build in the neighboring mAIstra/maistra_web checkout before recording.`);
}
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.ico':'image/x-icon','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{try{
 const pathname=new URL(req.url,'http://local').pathname;
 const path=pathname==='/handwritten.jpg'?`${out}/handwritten.jpg`:resolve(dist,'.'+(pathname==='/'?'/index.html':pathname));
 if(path!==`${out}/handwritten.jpg`&&!path.startsWith(dist+sep)){res.writeHead(403).end();return;}
 res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const frames=[],pending=[],markers=[];
let recording=false,started=0;
try {
 const context=await browser.newContext({viewport:{width:1280,height:720},timezoneId:'UTC',deviceScaleFactor:1});
 const page=await context.newPage();
 // Reject every unhandled off-machine HTTP request before installing local service fixtures.
 await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 const backend=new FakeBackend();await backend.install(page);
 const q=backend.addQuestion({id:'11111111-1111-4111-8111-111111111111',question_name:'Larger of two numbers',question_text:'Read two integers and print the larger number.',model_answer:ocr.verified_text,can_publish:true,test_cases:[{test_code:'',test_input:'9 4',expected_output:'Enter two numbers: Larger: 9\n'},{test_code:'',test_input:'3 7',expected_output:'Enter two numbers: Larger: 7\n'}]});
 const section=backend.addSection('Programming Fundamentals');backend.addSectionItem(section.id,q.id,1);
 const submission=backend.addSubmission({id:'22222222-2222-4222-8222-222222222222',student_name:'Sample submission',topic:'Programming Fundamentals',question_id:q.id,image_url:`${base}/handwritten.jpg`,captured_at:'2026-10-24T09:30:00Z',gate_result:'PASS'});
 backend.judge0=run=>{const values=run.stdin.trim().split(/\s+/).map(Number);return accepted(`Enter two numbers: Larger: ${Math.max(...values)}\n`);};
 let extractionCalls=0;
 await page.route('**/api/ocr/extract-from-url',async route=>{
  if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'}});return;}
  extractionCalls++;
  await new Promise(resolve=>setTimeout(resolve,1600));
  await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({submission_id:submission.id,...ocr})});
 });
 await page.goto(base);await page.getByRole('navigation',{name:'Main'}).getByRole('button',{name:'Submissions'}).click();
 const card=page.locator('.submission-card').first();await expect(card).toContainText('Needs OCR');
 await page.screenshot({path:`${out}/before-recording.png`});
 const cdp=await context.newCDPSession(page);
 cdp.on('Page.screencastFrame',event=>{
  cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});
  if(!recording)return;
  const path=`${out}/frames/${String(frames.length).padStart(5,'0')}.jpg`;
  frames.push({path,time:event.metadata.timestamp});pending.push(writeFile(path,Buffer.from(event.data,'base64')));
 });
 const hold=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const mark=name=>{const time=(Date.now()-started)/1000;markers.push({name,time});console.log(`${time.toFixed(2)}s ${name}`);};
 started=Date.now();recording=true;
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:95,maxWidth:1280,maxHeight:720,everyNthFrame:1});
 mark('submission');await hold(1700);await card.click();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();mark('details');await hold(1500);
 await dialog.getByRole('button',{name:'Save and review code'}).click();
 await expect(dialog.getByText('Not extracted yet')).toBeVisible();mark('before-extraction');await hold(2000);
 await page.screenshot({path:`${out}/stage-01-before-extraction.png`});
 await dialog.getByRole('button',{name:'Extract now',exact:true}).click();mark('extracting');
 await hold(400);await page.screenshot({path:`${out}/stage-extracting.png`});
 await expect(dialog.getByRole('button',{name:'Re-extract code',exact:true})).toBeVisible();
 const editor=dialog.locator('app-code-editor').first();await expect(editor).toContainText('main');mark('ocr-result');
 await hold(2200);await dialog.getByRole('button',{name:'Show OCR text',exact:true}).click();await hold(1700);
 await page.screenshot({path:`${out}/stage-02-ocr-result.png`});
 await dialog.getByRole('button',{name:'Hide',exact:true}).click();
 await editor.locator('.ace_content').click();await page.keyboard.press('Control+A');await page.keyboard.insertText(ocr.verified_text);mark('teacher-verification');
 await hold(2000);await page.screenshot({path:`${out}/stage-03-verified.png`});
 await dialog.getByRole('button',{name:'Continue to grading',exact:true}).click();
 await expect(dialog.getByRole('heading',{name:'Run and grade',exact:true})).toBeVisible();mark('grading');await hold(1500);
 await dialog.getByRole('button',{name:'Submit Code',exact:true}).click();
 await expect(dialog.getByText('2/2 test cases passed — Score: 100%',{exact:true})).toBeVisible();mark('grade-result');
 await dialog.getByText('2/2 test cases passed — Score: 100%',{exact:true}).scrollIntoViewIfNeeded();
 await hold(2500);await page.screenshot({path:`${out}/stage-04-grade.png`});
 await dialog.getByRole('button',{name:'Finish review',exact:true}).click();await hold(1600);mark('end');
 await cdp.send('Page.stopScreencast');recording=false;await Promise.all(pending);
 assert.equal(extractionCalls,1);assert.equal(backend.submissions.get(submission.id).extracted_text,ocr.cleaned_text);
 assert.equal(backend.programsOf(submission.id)[0].score_percent,100);assert.deepEqual(backend.unexpected,[]);
 await writeFile(`${out}/capture.json`,JSON.stringify({markers,frameCount:frames.length,ocrSample:ocr.sample,extractionSeconds:ocr.extraction_seconds,extractionCalls,grade:100,services:'Actual OCR output replay; isolated Supabase and Judge0 fixtures'},null,2));
 const quote=path=>path.replaceAll('\\','/').replaceAll("'","'\\''");
 let concat='';for(let i=0;i<frames.length;i++){concat+=`file '${quote(frames[i].path)}'\nduration ${i+1<frames.length?Math.max(.016,frames[i+1].time-frames[i].time):.15}\n`;}
 concat+=`file '${quote(frames.at(-1).path)}'\n`;await writeFile(`${out}/frames.txt`,concat);
 await new Promise((resolve,reject)=>{const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',`${out}/frames.txt`,'-vf','fps=30','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','5','-crf','25','-b:v','0','-an',`${out}/maistra-ocr.webm`],{stdio:['ignore','ignore','pipe'],windowsHide:true});let error='';child.stderr.on('data',d=>error+=d);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(error)));});
 console.log('Captured and verified the extraction, review and grading sequence.');
}catch(error){console.error(error);process.exitCode=1;}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
