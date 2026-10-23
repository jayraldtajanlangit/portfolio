// Capture Pulso's real Flutter screens from the isolated build described in assets/videos/README.md.
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {access,readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const out=resolve('.taste-skill/pulso-image-recording'),dist=resolve(out,'app/build/web');
try{await access(`${dist}/index.html`);}catch{throw new Error('Missing isolated Pulso web build. Run scripts/prepare-pulso-demo.py, then the Flutter web build commands in assets/videos/README.md.');}
const {chromium,expect}=createRequire(resolve('../mAIstra/maistra_web/package.json'))('@playwright/test');
await mkdir(`${out}/frames`,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm','.json':'application/json','.png':'image/png','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const name=new URL(req.url,'http://local').pathname;const path=resolve(dist,'.'+(name==='/'?'/index.html':name));if(!path.startsWith(dist+sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
const pending=[],frames=[],markers=[],blocked=[];let recording=false,started=0,activePage;
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
 const page=await context.newPage();activePage=page;page.setDefaultTimeout(12000);
 page.on('pageerror',error=>console.error('PAGE',error.message));
 await page.route('**/*',route=>{if(new URL(route.request().url()).origin===base)return route.continue();blocked.push(route.request().url());return route.abort();});
 await page.goto(base);await page.waitForFunction(()=>window.pulsoDemoState);await page.waitForTimeout(1800);
 await page.locator('flt-semantics-placeholder').evaluate(el=>el.click());await page.waitForTimeout(600);
 await page.screenshot({path:`${out}/inspect.png`});
 if(process.argv.includes('--inspect')){console.log((await page.locator('body').innerHTML()).slice(-16000));}
 else{
  const cdp=await context.newCDPSession(page);
  cdp.on('Page.screencastFrame',event=>{cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});if(!recording)return;const path=`${out}/frames/${String(frames.length).padStart(5,'0')}.jpg`;frames.push({path,time:event.metadata.timestamp});pending.push(writeFile(path,Buffer.from(event.data,'base64')));});
  const hold=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const mark=name=>{const time=(Date.now()-started)/1000;markers.push({name,time});console.log(`${time.toFixed(2)}s ${name}`);};
  const state=()=>page.evaluate(()=>JSON.parse(window.pulsoDemoState));
  const replace=async(field,text)=>{await field.click();await hold(120);await page.keyboard.press('Control+A');await page.keyboard.insertText(text);};
  started=Date.now();recording=true;await cdp.send('Page.startScreencast',{format:'jpeg',quality:95,maxWidth:390,maxHeight:844,everyNthFrame:1});
  await expect(page.getByText('Welcome to Pulso',{exact:true})).toBeVisible();mark('sign-in-screen');await hold(1600);
  await page.screenshot({path:`${out}/stage-00-sign-in.png`});
  await page.getByRole('button',{name:'Create account',exact:true}).click();await expect(page.getByText('Create your account',{exact:true})).toBeVisible();mark('registration-preview');await hold(1700);
  await page.screenshot({path:`${out}/stage-00-create-account.png`});
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await replace(page.getByRole('textbox').first(),'demo@example.com');
  await replace(page.locator('input[type="password"]'),'demo-pass-2026');await hold(1000);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForFunction(()=>JSON.parse(window.pulsoDemoState).signedIn);await expect(page.getByRole('button',{name:'Feed',exact:true})).toBeVisible();mark('signed-in');
  mark('feed');await hold(1400);await page.getByText('Post',{exact:true}).click();await hold(1000);mark('new-post');
  const [choose]=await Promise.all([page.waitForEvent('filechooser'),page.getByRole('button',{name:'Add Photos'}).click()]);await choose.setFiles(resolve('assets/images/social-preview.png'));
  await hold(1000);mark('photo-preview');await page.screenshot({path:`${out}/stage-01-image-preview.png`});
  await page.getByRole('textbox').fill('Sharing my latest web and mobile projects with the community.');await hold(1300);
  await page.getByRole('button',{name:'Post',exact:true}).click();await page.waitForFunction(()=>JSON.parse(window.pulsoDemoState).events.includes('post-created'));mark('published');await hold(1800);
  // The zero-like state has no text label; use the heart position verified in capture-error.png.
  await page.mouse.click(28,498);await page.waitForFunction(()=>JSON.parse(window.pulsoDemoState).events.includes('post-liked'));
  await page.getByRole('button',{name:'Save',exact:true}).first().click();await hold(1100);mark('liked-and-saved');
  await page.screenshot({path:`${out}/stage-02-published.png`});
  await page.getByText('Profile',{exact:true}).click();await hold(1400);mark('profile');
  await page.getByRole('button',{name:'Edit Profile',exact:true}).click();await hold(1000);mark('edit-profile');
  const fields=page.getByRole('textbox');
  await replace(fields.nth(0),'Jay Demo');await replace(fields.nth(2),'Web, mobile, and community projects.');await hold(800);
  await page.screenshot({path:`${out}/edit-profile-ready.png`});
  const [avatarChoice]=await Promise.all([page.waitForEvent('filechooser'),page.getByRole('button',{name:'J',exact:true}).click()]);await avatarChoice.setFiles(`${out}/avatar.png`);
  await page.waitForFunction(()=>JSON.parse(window.pulsoDemoState).events.includes('avatar-selected'));await hold(1000);mark('avatar');
  await hold(1300);
  await page.screenshot({path:`${out}/stage-03-edit-profile.png`});
  await page.getByRole('button',{name:'Save',exact:true}).click();await page.waitForFunction(()=>JSON.parse(window.pulsoDemoState).profile.displayName==='Jay Demo');mark('profile-saved');await hold(2300);
  await page.screenshot({path:`${out}/stage-04-profile.png`});
  // The logout icon has no text label; locate the top-right profile button by its observed bounds.
  const logout=page.getByRole('button').filter({hasText:/^$/});
  const logoutTarget=await logout.evaluateAll(nodes=>nodes.map((el,index)=>({index,rect:el.getBoundingClientRect()})).find(({rect})=>rect.x>330&&rect.y<60)?.index);
  assert.notEqual(logoutTarget,undefined,'Profile logout control must be present');await logout.nth(logoutTarget).click();
  await expect(page.getByText('Welcome to Pulso',{exact:true})).toBeVisible();mark('signed-out');await hold(1500);await page.screenshot({path:`${out}/stage-05-signed-out.png`});mark('end');
  await cdp.send('Page.stopScreencast');recording=false;await Promise.all(pending);
  const final=await state();assert.ok(final.posts.some(p=>p.hasImage&&p.caption.includes('Sharing my latest')));assert.equal(final.profile.displayName,'Jay Demo');assert.ok(final.profile.hasAvatar);assert.equal(final.profile.bio,'Web, mobile, and community projects.');assert.ok(final.saved.includes('demo-photo'));assert.ok(final.events.includes('post-liked'));assert.ok(final.events.includes('signed-in'));assert.ok(final.events.includes('signed-out'));assert.equal(final.signedIn,false);
  await writeFile(`${out}/capture.json`,JSON.stringify({markers,frameCount:frames.length,state:final,blocked,services:'Real Flutter UI and browser image selection; isolated in-memory authentication, post and profile storage'},null,2));
  const quote=path=>path.replaceAll('\\','/').replaceAll("'","'\\''");let concat='';for(let i=0;i<frames.length;i++)concat+=`file '${quote(frames[i].path)}'\nduration ${i+1<frames.length?Math.max(.016,frames[i+1].time-frames[i].time):.15}\n`;concat+=`file '${quote(frames.at(-1).path)}'\n`;await writeFile(`${out}/frames.txt`,concat);
  await new Promise((resolve,reject)=>{const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',`${out}/frames.txt`,'-vf','fps=30','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','5','-crf','25','-b:v','0','-an',`${out}/pulso-images.webm`],{stdio:['ignore','ignore','pipe'],windowsHide:true});let error='';child.stderr.on('data',d=>error+=d);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(error)));});
  console.log('Captured account screens, demo sign-in, image posting, profile editing and sign-out; final state verified.');
 }
}catch(error){await activePage?.screenshot({path:`${out}/capture-error.png`});console.error(error);console.error((await activePage?.locator('body').innerHTML())?.slice(-12000));process.exitCode=1;}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
