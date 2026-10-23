from pathlib import Path

helper = Path('scripts/render-utils.mjs')
text = helper.read_text(encoding='utf-8')
start = text.index('export function renderThemeControl()')
end = text.index('export function renderTypingLine()', start)
new_control = '''export function renderThemeControl() {
  const icons = {
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    dark: '<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>',
  };
  return `<div class="theme-control" hidden><button class="theme-trigger" data-theme-trigger type="button" role="switch" aria-label="Dark mode" aria-checked="false" title="Switch to dark mode"><span class="theme-track" aria-hidden="true"><span class="theme-thumb"></span>${Object.keys(icons).map(mode => `<svg data-theme-icon="${mode}" viewBox="0 0 24 24">${icons[mode]}</svg>`).join('')}</span></button></div>`;
}

'''
helper.write_text(text[:start] + new_control + text[end:], encoding='utf-8')

Path('js/theme.js').write_text('''// Apply remembered appearance in the head, before the page paints.
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
''', encoding='utf-8')

Path('css/theme.css').write_text('''.theme-control { display: inline-flex; align-items: center; min-height: 44px; flex-shrink: 0; color: inherit; }
.theme-control[hidden] { display: none; }
.theme-trigger { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 44px; padding: 0; border: 0; border-radius: 22px; color: inherit; background: transparent; cursor: pointer; }
.theme-trigger:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
.theme-track { position: relative; display: block; width: 64px; height: 36px; border-radius: 18px; background: var(--color-paper-deep); color: var(--color-muted); }
.theme-thumb { position: absolute; top: 4px; left: 4px; width: 28px; height: 28px; border-radius: 50%; background: var(--accent); transition: transform 240ms var(--ease-editorial); }
.theme-track svg { position: absolute; top: 9px; width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
.theme-track [data-theme-icon="light"] { left: 9px; color: var(--accent-ink); }
.theme-track [data-theme-icon="dark"] { right: 9px; }
.theme-trigger[aria-checked="true"] .theme-thumb { transform: translateX(28px); }
.theme-trigger[aria-checked="true"] [data-theme-icon="light"] { color: var(--color-muted); }
.theme-trigger[aria-checked="true"] [data-theme-icon="dark"] { color: var(--accent-ink); }
.theme-trigger:hover .theme-track { background: var(--color-preview-hover); }
@media (prefers-reduced-motion: reduce) { .theme-thumb { transition: none; } }
@media (min-width: 48rem) { .header-layout { gap: 1.5rem; } }
@media (max-width: 47.99rem) {
  .portfolio-header .theme-control { margin-left: auto; }
  .case-page .site-header-inner > .theme-control { grid-column: 1 / -1; justify-self: end; }
}
''', encoding='utf-8')

preview = Path('.taste-skill/editorial-concept/index.html')
old = Path('.taste-skill/previous-theme-control.html').read_text(encoding='utf-8')
# The preview has a separately authored header. Synchronize its old control once.
preview_text = preview.read_text(encoding='utf-8')
if old not in preview_text:
    raise RuntimeError('Previous theme control not found in preview')
# Render the new control through Node after updating the helper.
import subprocess
new = subprocess.check_output(['node', '--input-type=module', '-e', "import {renderThemeControl} from './scripts/render-utils.mjs'; process.stdout.write(renderThemeControl());"], encoding='utf-8')
preview.write_text(preview_text.replace(old, new), encoding='utf-8')
