const statusIcon = `<span class="pipeline-badge"><span class="pipeline-queued"></span><span class="pipeline-runner"></span><svg class="pipeline-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4 10-10"/></svg></span>`;
// The SVG and job boxes use the same percentage coordinate system. Each edge
// terminates at a card's port; the mobile graph preserves the same dependencies.
const edges = [
  ['build', 'test', 'M280 170H308Q320 170 320 158V97Q320 85 332 85H360', 'M500 215V288Q500 300 488 300H232Q220 300 220 312V405'],
  ['build', 'lint', 'M280 170H308Q320 170 320 182V243Q320 255 332 255H360', 'M500 215V288Q500 300 512 300H768Q780 300 780 312V405'],
  ['test', 'deploy', 'M640 85H668Q680 85 680 97V158Q680 170 692 170H720', 'M220 595V688Q220 700 232 700H488Q500 700 500 712V785'],
  ['lint', 'deploy', 'M640 255H668Q680 255 680 243V182Q680 170 692 170H720', 'M780 595V688Q780 700 768 700H512Q500 700 500 712V785'],
];

function renderEdges(mobile = false) {
  return `<svg class="workflow-edges workflow-edges--${mobile ? 'mobile' : 'desktop'}" viewBox="0 0 1000 ${mobile ? 1000 : 340}" preserveAspectRatio="none" fill="none" aria-hidden="true">${edges.map(([from, to, desktopPath, mobilePath]) => `<path data-from="${from}" data-to="${to}" d="${mobile ? mobilePath : desktopPath}" vector-effect="non-scaling-stroke"/>`).join('')}${edges.map(([from, to, desktopPath, mobilePath]) => `<path class="workflow-signal" data-route="${from}-${to}" d="${mobile ? mobilePath : desktopPath}" pathLength="1" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;
}

export function renderStartup() {
  const jobs = [
    ['build', 'Source', 'Connecting ideas'],
    ['test', 'Build', 'Building experiences'],
    ['lint', 'Test', 'Checking the details'],
    ['deploy', 'Deploy', 'Portfolio ready'],
  ];
  return `<dialog class="startup" data-startup hidden aria-labelledby="startup-title" aria-describedby="startup-description">
    <div class="startup-ambience" aria-hidden="true"></div>
    <div class="startup-panel">
      <div class="startup-brandbar" aria-hidden="true"><div class="startup-brand"><span class="startup-monogram">JT<span>.</span></span><p class="startup-brand-name">Jayrald Tajanlangit<span>Personal portfolio</span></p></div><p class="startup-brand-kind">WEB / MOBILE / AI</p></div>
      <section class="workflow-graph">
        <header class="workflow-graph-header">
          <div class="workflow-identity"><span class="workflow-file-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7zM14 3v5h4M10 12l-2 2 2 2m5-4 2 2-2 2"/></svg></span><div><div class="workflow-title-line"><h2 id="startup-title">portfolio.yml</h2><span class="workflow-branch" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="4" cy="3" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="4" cy="13" r="1.5"/><path d="M4 4.5v7m8-6v1c0 2-2 2.5-4 2.5H4"/></svg>main</span></div><p>Workflow preview <span class="workflow-stage-count">/ 4 stages</span></p></div></div>
          <div class="workflow-run-state" aria-hidden="true"><span class="workflow-run-indicator"></span><span class="workflow-running-label">In progress</span><span class="workflow-success-label">Success</span></div>
        </header>
        <div class="workflow-canvas" aria-hidden="true">
          ${renderEdges()}
          ${renderEdges(true)}
          <ol class="startup-pipeline">${jobs.map(([key, name, description]) => `<li class="pipeline-stage" data-pipeline-stage data-job="${key}" data-state="pending">
            ${key !== 'build' ? '<span class="workflow-port workflow-port--in"></span>' : ''}
            ${statusIcon}<div class="pipeline-copy"><h3>${name}</h3><p class="pipeline-description">${description}</p></div><p class="pipeline-meta"><span class="job-queued">Queued</span><span class="job-running">Running</span><span class="job-success">Success</span></p>
            ${key !== 'deploy' ? '<span class="workflow-port workflow-port--out"></span>' : ''}
          </li>`).join('')}</ol>
        </div>
        <div class="workflow-bottom-bar"><p class="workflow-current" aria-hidden="true"><span class="workflow-current-dot"></span><span data-startup-status>Connecting ideas</span></p><div class="workflow-legend" aria-hidden="true"><span><i class="legend-queued"></i>Queued</span><span><i class="legend-running"></i>Running</span><span><i class="legend-complete"></i>Ready</span></div></div>
      </section>
      <div class="startup-finale">
        <p class="startup-finale-eyebrow"><span aria-hidden="true">✓</span> READY TO EXPLORE</p>
        <h2 class="startup-welcome"><span>Hi, I'm</span><strong data-startup-name>Jayrald</strong></h2>
        <p class="startup-finale-description">I build web and mobile experiences.</p>
        <p class="startup-caption" id="startup-description">Web · Mobile · AI</p>
      </div>
    </div>
    <p class="startup-footer-note" aria-hidden="true">JAYRALD TAJANLANGIT <span>/ PORTFOLIO</span></p>
    <button class="startup-skip" data-startup-skip type="button" autofocus>Skip intro <span aria-hidden="true">↗</span></button>
  </dialog>`.replace(/[ \t]+$/gm, '');
}
