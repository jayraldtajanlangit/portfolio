import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { renderThemeControl } from '../scripts/render-utils.mjs';

const source = readFileSync(new URL('../js/theme.js', import.meta.url), 'utf8');
function setup({ saved = null, dark = false, blocked = false } = {}) {
  const attributes = {}, handlers = {}, events = {}, storage = { value: saved };
  const button = { setAttribute: (key, value) => { attributes[key] = value; }, addEventListener: (name, handler) => { handlers[name] = handler; } };
  const control = { querySelector: selector => selector === '[data-theme-trigger]' ? button : null, querySelectorAll: () => [], removeAttribute() {} };
  const root = { dataset: {}, style: {} };
  const system = { matches: dark, addEventListener: (_, handler) => { system.change = handler; } };
  const document = { documentElement: root, readyState: 'complete', body: {}, querySelector: () => null, querySelectorAll: selector => selector === '.theme-control' ? [control] : selector === '[data-theme-trigger]' ? [button] : [] };
  const window = { matchMedia: () => system, getComputedStyle: () => ({ backgroundColor: '#171e1a' }), addEventListener: (name, handler) => { events[name] = handler; }, localStorage: { getItem: () => { if (blocked) throw Error('blocked'); return storage.value; }, setItem: (_, value) => { if (blocked) throw Error('blocked'); storage.value = value; } } };
  runInNewContext(source, { document, window });
  return { root, system, storage, attributes, events, click: () => { assert.equal(typeof handlers.click, 'function'); handlers.click(); } };
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
