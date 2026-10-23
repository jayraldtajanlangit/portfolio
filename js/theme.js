// Apply remembered appearance in the head, before the page paints.
(() => {
  const root = document.documentElement;
  const storageKey = 'portfolio-theme';
  const normalize = value => ['light', 'dark', 'system'].includes(value) ? value : 'system';
  const system = window.matchMedia?.('(prefers-color-scheme: dark)') ?? { matches: false };
  let preference = 'system';
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

  apply();
  const onSystemChange = () => { if (preference === 'system') apply(); };
  if (system.addEventListener) system.addEventListener('change', onSystemChange);
  else system.addListener?.(onSystemChange);

  const bind = () => {
    document.querySelectorAll('.theme-control').forEach(control => {
      const trigger = control.querySelector('[data-theme-trigger]');
      if (!trigger) return;
      trigger.addEventListener('click', () => {
        preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
        apply();
        try { window.localStorage.setItem(storageKey, preference); } catch { /* The switch still works for this visit. */ }
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
