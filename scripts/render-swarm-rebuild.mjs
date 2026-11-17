export function renderSwarmBootstrap() {
 return `<script data-swarm-bootstrap>(()=>{const r=document.documentElement;try{const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced&&!location.hash&&performance.getEntriesByType('navigation')[0]?.type!=='back_forward'){r.dataset.swarmBuild='pending';setTimeout(()=>{if(r.dataset.swarmBuild==='pending')delete r.dataset.swarmBuild;},4000);}else if(!reduced)r.dataset.nameRise='play';}catch{delete r.dataset.swarmBuild;}})();</script>`;
}
