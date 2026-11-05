// Homepage adapter for the real Swarm Rebuild engine. See vendor/NOTICE.md.
export function shouldBuildHomepage(view, root) {
 return !view.matchMedia('(prefers-reduced-motion: reduce)').matches && !root.hidden
  && !view.location.hash && view.scrollY <= 24
  && view.performance.getEntriesByType('navigation')[0]?.type !== 'back_forward';
}

export async function initSwarmRebuild(root = document, load = () => import('./vendor/swarm-rebuild.js?v=20261103-calm')) {
 const view=root.defaultView;
 const release=()=>delete root.documentElement.dataset.swarmBuild;
 if(!shouldBuildHomepage(view,root)){release();return ()=>{};}
 const agents={min:4,max:10,intro:6,flock:10};
 view.__swarmRebuildOptions={intro:false,autoScroll:true,autoExit:true,sound:false,homepage:true,agents};
 try {
  await Promise.race([root.fonts.ready,new Promise(resolve=>view.setTimeout(resolve,1200))]);
  // Loading must never restart the tour after a visitor follows a deep link.
  if(!shouldBuildHomepage(view,root)){release();return ()=>{};}
  await load();
 } catch(error){release();view.__swarmRebuild?.stop(false);view.console.warn('Swarm Rebuild could not start:',error);}
 return ()=>{view.__swarmRebuild?.stop(false);release();};
}

if(typeof document!=='undefined')initSwarmRebuild(document);
