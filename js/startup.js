// Runs beside the hidden dialog, before the homepage paints. No media or imports.
(() => {
  const dialog = document.querySelector('[data-startup]');
  if (!dialog) return;
  const key = 'portfolio-startup-canvas-seen';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let seen = false;
  try { seen = window.sessionStorage.getItem(key) === '1'; } catch { /* Private/blocked storage. */ }
  const returning = window.performance?.getEntriesByType('navigation')[0]?.type === 'back_forward';
  if (seen || motion.matches || window.location.hash || returning || document.hidden || !dialog.showModal) {
    dialog.remove();
    return;
  }

  const status = document.querySelector('[data-startup-status]');
  const skip = document.querySelector('[data-startup-skip]');
  const stages = [...document.querySelectorAll('[data-pipeline-stage]')];
  const updateJobs = (states, message, step) => {
    stages.forEach((stage, index) => { stage.dataset.state = states[index]; });
    dialog.dataset.workflow = states.every(state => state === 'complete') ? 'complete' : 'running';
    dialog.dataset.step = step;
    status.textContent = message;
  };
  const timers = [];
  let finished = false, revealed = false, nameAnimation;
  const later = (fn, delay) => timers.push(window.setTimeout(fn, delay));
  const moveNameToHero = () => {
    // Measure before the homepage entrance applies its initial transforms.
    // A missing target, unsupported API or geometry failure uses the plain fade.
    try {
      const name = dialog.querySelector('[data-startup-name]');
      const target = document.querySelector('[data-hero-name]');
      if (!name?.animate || !target?.getBoundingClientRect) return;
      const from = name.getBoundingClientRect(), to = target.getBoundingClientRect();
      if (![from.left, from.top, from.width, from.height, to.left, to.top, to.width, to.height].every(Number.isFinite)
        || from.width <= 0 || from.height <= 0 || to.width <= 0 || to.height <= 0) return;
      nameAnimation = name.animate([
        { transformOrigin: 'top left', transform: 'translate(0, 0) scale(1)' },
        { transformOrigin: 'top left', transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})` },
      ], { duration: 400, fill: 'both', easing: 'cubic-bezier(.16,1,.3,1)' });
    } catch { /* The hard deadline still reveals the homepage. */ }
  };
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    dialog.dispatchEvent(new window.Event('startup:reveal'));
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach(timer => window.clearTimeout(timer));
    nameAnimation?.cancel();
    skip.removeEventListener('click', finish);
    dialog.removeEventListener('cancel', cancel);
    motion.removeEventListener('change', finish);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', finish);
    if (dialog.open) {
      reveal();
      dialog.close();
    }
    dialog.remove();
  };
  const cancel = event => { event.preventDefault(); finish(); };
  const onVisibility = () => { if (document.hidden) finish(); };

  // Schedule the hard deadline before opening: never depend on animationend,
  // fonts, videos, window.load, or a successful storage write to unlock the page.
  later(finish, 5000);
  skip.addEventListener('click', finish);
  dialog.addEventListener('cancel', cancel);
  motion.addEventListener('change', finish);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', finish);
  updateJobs(['active', 'pending', 'pending', 'pending'], 'Connecting ideas', 'build');
  dialog.hidden = false;
  try { dialog.showModal(); } catch { finish(); return; }
  try { window.sessionStorage.setItem(key, '1'); } catch { /* Intro still completes. */ }
  later(() => updateJobs(['complete', 'active', 'active', 'pending'], 'Building experiences', 'checks'), 1200);
  later(() => updateJobs(['complete', 'complete', 'active', 'pending'], 'Checking the details', 'lint'), 2000);
  later(() => updateJobs(['complete', 'complete', 'complete', 'active'], 'Portfolio ready', 'deploy'), 2600);
  later(() => {
    updateJobs(['complete', 'complete', 'complete', 'complete'], 'Portfolio ready', 'ready');
    dialog.dataset.phase = 'welcome';
  }, 3200);
  later(() => { moveNameToHero(); reveal(); dialog.dataset.phase = 'exit'; }, 4600);
})();
