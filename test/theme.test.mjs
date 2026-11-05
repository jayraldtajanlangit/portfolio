import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { renderThemeControl } from '../scripts/render-utils.mjs';

const source = readFileSync(new URL('../js/theme.js', import.meta.url), 'utf8');
function setup({ saved = null, dark = false, blocked = false, transitions = false, reduced = false, transitionError = false } = {}) {
  const attributes = {}, handlers = {}, events = {}, storage = { value: saved };
  const button = { setAttribute: (key, value) => { attributes[key] = value; }, addEventListener: (name, handler) => { handlers[name] = handler; }, getBoundingClientRect: () => ({ left: 900, top: 24, width: 64, height: 44 }) };
  const control = { querySelector: selector => selector === '[data-theme-trigger]' ? button : null, querySelectorAll: () => [], removeAttribute() {} };
  const root = { dataset: {}, style: { setProperty(key, value) { this[key] = value; } } };
  const system = { matches: dark, addEventListener: (_, handler) => { system.change = handler; } };
  const document = { documentElement: root, readyState: 'complete', body: {}, querySelector: () => null, querySelectorAll: selector => selector === '.theme-control' ? [control] : selector === '[data-theme-trigger]' ? [button] : [] };
  const transitionCalls = [];
  if (transitions) document.startViewTransition = update => {
    if (transitionError) throw Error('Transition unavailable');
    let finish;
    const transition = { ready: Promise.resolve().then(update), finished: new Promise(resolve => { finish = resolve; }), finish: () => finish(), skips: 0, skipTransition() { this.skips++; finish(); } };
    transitionCalls.push(transition);
    return transition;
  };
  const window = { innerWidth: 1024, innerHeight: 768, matchMedia: query => query.includes('reduced-motion') ? { matches: reduced } : system, getComputedStyle: () => ({ backgroundColor: '#171e1a' }), addEventListener: (name, handler) => { events[name] = handler; }, localStorage: { getItem: () => { if (blocked) throw Error('blocked'); return storage.value; }, setItem: (_, value) => { if (blocked) throw Error('blocked'); storage.value = value; } } };
  runInNewContext(source, { document, window });
  return { root, system, storage, attributes, events, transitionCalls, click: () => { assert.equal(typeof handlers.click, 'function'); handlers.click(); } };
}

test('theme control is a dark-mode switch without a dropdown menu', () => {
  const html = renderThemeControl();
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-label="Dark mode"/);
  assert.doesNotMatch(html, /aria-haspopup|data-theme-menu|data-theme-option/);
});

test('toggle flips the resolved system theme and saves an explicit choice', () => {
  const state = setup({ dark: true });
  assert.equal(state.root.dataset.theme, 'dark');
  assert.equal(state.attributes['aria-checked'], 'true');
  state.click();
  assert.equal(state.root.dataset.theme, 'light');
  assert.equal(state.storage.value, 'light');
  state.system.matches = false; state.system.change();
  assert.equal(state.root.dataset.theme, 'light');
  state.click();
  assert.equal(state.root.dataset.theme, 'dark');
  assert.equal(state.attributes['aria-checked'], 'true');
});

test('saved appearance overrides system while blocked storage still permits toggling', () => {
  const saved = setup({ saved: 'light', dark: true });
  assert.equal(saved.root.dataset.theme, 'light');
  const blocked = setup({ blocked: true });
  blocked.click();
  assert.equal(blocked.root.dataset.theme, 'dark');
  assert.equal(blocked.attributes['aria-checked'], 'true');
});

test('system defaults and cross-tab changes update the switch state', () => {
  const state = setup();
  state.system.matches = true; state.system.change();
  assert.equal(state.attributes['aria-checked'], 'true');
  state.events.storage({ key: 'portfolio-theme', newValue: 'light' });
  assert.equal(state.root.dataset.theme, 'light');
  assert.equal(state.attributes['aria-checked'], 'false');
});

test('user toggles reveal from the switch while initial appearance stays immediate', async () => {
  const state = setup({ transitions: true });
  assert.equal(state.root.dataset.theme, 'light');
  assert.equal(state.transitionCalls.length, 0);
  state.click();
  assert.equal(state.transitionCalls.length, 1);
  assert.equal(state.storage.value, 'dark');
  assert.equal(state.root.style['--theme-reveal-x'], '932px');
  assert.equal(state.root.style['--theme-reveal-y'], '46px');
  await state.transitionCalls[0].ready;
  assert.equal(state.root.dataset.theme, 'dark');
  assert.equal(state.attributes['aria-checked'], 'true');
  state.transitionCalls[0].finish();
  await state.transitionCalls[0].finished;
  assert.equal(state.root.dataset.themeTransition, undefined);
});

test('reduced motion and unsupported or failing transitions retain a usable instant switch', () => {
  for (const options of [{ transitions: true, reduced: true }, {}, { transitions: true, transitionError: true }]) {
    const state = setup(options);
    state.click();
    assert.equal(state.root.dataset.theme, 'dark');
    assert.equal(state.storage.value, 'dark');
    assert.equal(state.transitionCalls.length, 0);
  }
});

test('rapid toggles skip the running reveal and preserve the latest saved choice', async () => {
  const state = setup({ transitions: true });
  state.click();
  state.click();
  assert.equal(state.transitionCalls.length, 1);
  assert.equal(state.transitionCalls[0].skips, 1);
  await state.transitionCalls[0].ready;
  await state.transitionCalls[0].finished;
  assert.equal(state.root.dataset.theme, 'light');
  assert.equal(state.storage.value, 'light');
  assert.equal(state.attributes['aria-checked'], 'false');
});
