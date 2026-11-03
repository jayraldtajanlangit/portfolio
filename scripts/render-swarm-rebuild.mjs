export function renderSwarmBootstrap() {
 return `<script data-swarm-bootstrap>(()=>{const r=document.documentElement;try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!location.hash&&performance.getEntriesByType('navigation')[0]?.type!=='back_forward'){r.dataset.swarmBuild='pending';setTimeout(()=>{if(r.dataset.swarmBuild==='pending')delete r.dataset.swarmBuild;},4000);}}catch{delete r.dataset.swarmBuild;}})();</script>`;
}
