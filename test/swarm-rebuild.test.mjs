import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderHomePage } from '../scripts/render-home.mjs';
import { initSwarmRebuild } from '../js/swarm-rebuild.js';
import vm from 'node:vm';

async function scanningEnvironment(agents) {
 const source=await readFile(new URL('../js/vendor/swarm-rebuild.js',import.meta.url),'utf8');
 let time=0,id=0;const queue=new Map(),scrolls=[];
 const schedule=(fn,ms)=>{queue.set(++id,{fn,at:time+ms});return id;};
 const window={__swarmRebuildOptions:{autoStart:false,homepage:true,intro:false,agents}},location={hash:''},media={matches:false};
 vm.runInNewContext(source,{window,location,scrollY:0,matchMedia:()=>media,performance:{now:()=>time,getEntriesByType:()=>[]},setTimeout:schedule,clearTimeout:id=>queue.delete(id),requestAnimationFrame:fn=>schedule(fn,16),cancelAnimationFrame:id=>queue.delete(id),console,document:{documentElement:{dataset:{}}}});
 const app=new window.__swarmRebuild.debug.App();
 app.env={geom:()=>({vh:500,sy:0,sx:0}),scrollHeight:()=>2000,scrollTo:(...args)=>scrolls.push(args)};
 app.view={vp:{sy:0,sx:0},host:{remove(){},style:{setProperty(){}}}};
 return {app,api:window.__swarmRebuild,location,media,scrolls,async advance(ms){const end=time+ms;for(let n=0;n<2000;n++){
  const next=[...queue].filter(([,task])=>task.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
  if(!next)break;queue.delete(next[0]);time=next[1].at;next[1].fn();
  for(let k=0;k<6;k++)await Promise.resolve();
 }time=end;}};
}

for(const limits of [{min:4,max:10,intro:6,flock:10},{min:2,max:6,intro:3,flock:6}]) {
 test(`cursor budget ${limits.max} covers startup, queued work, departures and the finale`,async()=>{
  const e=await scanningEnvironment(limits);
  const engine=new e.api.debug.Engine({vp:{ox:0,oy:0,sx:0,sy:0,vw:1200,vh:800}});
  assert.equal(engine.cursors.length,limits.intro);
  engine.ready=true;engine.start();engine.waitCount=100;
  engine.available=()=>Array.from({length:100},()=>({}));engine.pick=()=>null;
  engine.idle=function*(){while(true)yield;};
  for(let i=0;i<120;i++){engine.step(.016);assert.ok(engine.cursors.length<=limits.max);}
  assert.equal(engine.cursors.length,limits.max);
  engine.cursors[0].leaving=true;
  for(let i=0;i<4;i++){engine.step(.016);assert.ok(engine.cursors.length<=limits.max,'departing cursors still count toward the visible cap');}
  engine.follow=()=>{};
  for(let i=0;i<120;i++){engine.flock(.016);assert.ok(engine.cursors.length<=limits.max,'the finale must not add a larger swarm');}
 });
}

test('Pause during the initial page scan freezes scrolling until Resume',async()=>{
 const e=await scanningEnvironment();e.app.paused=true;
 const task=e.app.scan();await e.advance(300);
 assert.equal(e.scrolls.length,0);
 e.app.paused=false;await e.advance(1600);await task;
 assert.ok(e.scrolls.length>0);assert.deepEqual(e.scrolls.at(-1),[0,0]);
});

test('stopping during the initial scan cannot pull the visitor back later',async()=>{
 const e=await scanningEnvironment();const task=e.app.scan();
 await e.advance(20);e.app.destroy(false);
 const count=e.scrolls.length;await e.advance(1800);await task;
 assert.equal(e.scrolls.length,count);
});

test('the vendor entry point checks navigation again when the module finally arrives',async()=>{
 const e=await scanningEnvironment();e.location.hash='#contact';e.api.start();
 assert.equal(e.api.app,null);
 e.location.hash='';e.media.matches=true;e.api.start();
 assert.equal(e.api.app,null);
});

function environment(changes={}) {
 const warnings=[],stops=[];
 const view={innerWidth:changes.width??1280,matchMedia:()=>({matches:changes.reduced??false}),location:{hash:changes.hash??''},scrollY:changes.scroll??0,performance:{getEntriesByType:()=>[{type:changes.navigation??'navigate'}]},setTimeout:()=>0,console:{warn:(...args)=>warnings.push(args)}};
 const root={hidden:changes.hidden??false,defaultView:view,fonts:{ready:changes.fonts??Promise.resolve()},documentElement:{dataset:{swarmBuild:'pending'}}};
 view.__swarmRebuild={stop:reveal=>stops.push(reveal)};
 return {view,root,warnings,stops};
}

for(const changes of [{reduced:true},{hidden:true},{hash:'#work'},{scroll:400},{navigation:'back_forward'}]) {
 test(`Swarm preserves direct navigation and motion preferences: ${JSON.stringify(changes)}`,async()=>{
  const e=environment(changes);let loads=0;
  await initSwarmRebuild(e.root,async()=>loads++);
  assert.equal(loads,0);assert.equal(e.root.documentElement.dataset.swarmBuild,undefined);
 });
}

for(const [width,max] of [[1280,10],[390,6]])test(`the ${width}px engine keeps automatic tour/exit with a ${max}-cursor cap`,async()=>{
 const e=environment({width});let options;
 const cleanup=await initSwarmRebuild(e.root,async()=>{options=e.view.__swarmRebuildOptions;});
 assert.equal(options.intro,false);assert.equal(options.autoScroll,true);assert.equal(options.autoExit,true);
 assert.equal(options.agents.max,max);assert.ok(options.agents.intro<max);assert.ok(options.agents.flock<=max);
 cleanup();assert.deepEqual(e.stops,[false]);assert.equal(e.root.documentElement.dataset.swarmBuild,undefined);
});

test('loading failure reveals the usable original page and stops any partial overlay',async()=>{
 const e=environment();
 await initSwarmRebuild(e.root,async()=>{throw Error('offline');});
 assert.equal(e.root.documentElement.dataset.swarmBuild,undefined);assert.deepEqual(e.stops,[false]);assert.equal(e.warnings.length,1);
});

test('following a link while fonts load prevents a late animation takeover',async()=>{
 let ready;const e=environment({fonts:new Promise(resolve=>ready=resolve)});let loads=0;
 const task=initSwarmRebuild(e.root,async()=>loads++);
 e.view.location.hash='#contact';ready();await task;
 assert.equal(loads,0);assert.equal(e.root.documentElement.dataset.swarmBuild,undefined);
});

test('homepage loads the actual Swarm Rebuild integration without the custom cursor tour',()=>{
 const html=renderHomePage();
 assert.match(html,/src="js\/swarm-rebuild.js(?:\?[^\"]*)?"/);
 assert.doesNotMatch(html,/src="js\/home-agents.js"|data-homepage-agents|css\/home-agents.css/);
 assert.doesNotMatch(html,/<dialog/);
});

test('vendored engine retains the upstream blueprint, generators and credit',async()=>{
 const source=await readFile(new URL('../js/vendor/swarm-rebuild.js',import.meta.url),'utf8');
 assert.match(source,/function captureModel/);
 assert.match(source,/class Engine/);
 assert.match(source,/class Sound/);
 const notice=await readFile(new URL('../js/vendor/NOTICE.md',import.meta.url),'utf8');
 assert.match(notice,/DhvanilPatel\/swarm-cursors/);
 assert.match(notice,/Joel Califa/);
});
