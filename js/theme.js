// Apply remembered appearance in the head, before the page paints.
(() => {
  const root = document.documentElement;
  const storageKey = 'portfolio-theme';
  const normalize = value => ['light', 'dark', 'system'].includes(value) ? value : 'system';
  const system = window.matchMedia?.('(prefers-color-scheme: dark)') ?? { matches: false };
  let preference = 'system';
  let activeTransition = null;
  try { preference = normalize(window.localStorage.getItem(storageKey)); } catch { /* Storage may be disabled. */ }

  const apply = () => {
    const resolved = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    root.dataset.theme = resolved;
    root.dataset.themeMode = preference;
    root.style.colorScheme = resolved;
    document.querySelectorAll('[data-theme-trigger]').forEach(button => {
      button.setAttribute('aria-checked', String(resolved === 'dark'));
      button.setAttribute('title', `Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`);
    });
    if (document.body) {
      const background = window.getComputedStyle(document.body).backgroundColor;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
    }
  };

  const revealTheme = trigger => {
    // Repeated input wins immediately, even before the first snapshot has updated.
    if (activeTransition) {
      activeTransition.skipTransition();
      activeTransition = null;
      delete root.dataset.themeTransition;
      apply();
      return;
    }
    if (!document.startViewTransition || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      apply();
      return;
    }
    try {
      const bounds = trigger.getBoundingClientRect();
      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.style.setProperty('--theme-reveal-x', `${x}px`);
      root.style.setProperty('--theme-reveal-y', `${y}px`);
      root.style.setProperty('--theme-reveal-radius', `${Math.ceil(radius)}px`);
      root.dataset.themeTransition = 'reveal';
      const transition = document.startViewTransition(apply);
      activeTransition = transition;
      const cleanUp = () => {
        if (activeTransition !== transition) return;
        activeTransition = null;
        delete root.dataset.themeTransition;
      };
      transition.ready.catch(() => {}); // Skipped snapshots still apply the theme.
      transition.finished.then(cleanUp, cleanUp);
    } catch {
      activeTransition = null;
      delete root.dataset.themeTransition;
      apply();
    }
  };

  apply();
  const onSystemChange = () => { if (preference === 'system') apply(); };
  if (system.addEventListener) system.addEventListener('change', onSystemChange);
  else system.addListener?.(onSystemChange);

  const bind = () => {
    document.querySelectorAll('.theme-control').forEach(control => {
      const trigger = control.querySelector('[data-theme-trigger]');
      if (!trigger) return;
      trigger.addEventListener('click', () => {
        const current = preference === 'system' ? root.dataset.theme : preference;
        preference = current === 'dark' ? 'light' : 'dark';
        try { window.localStorage.setItem(storageKey, preference); } catch { /* The switch still works for this visit. */ }
        revealTheme(trigger);
      });
      control.removeAttribute('hidden');
    });
    apply();
  };

  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = normalize(event.newValue);
    apply();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})();
