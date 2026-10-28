import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { renderHomePage } from '../scripts/render-home.mjs';
import { renderStartupPreview } from '../scripts/render-startup-preview.mjs';

// Native dialog and storage are browser boundaries; exercise the real controller
// with a deterministic clock so timing and early exits cannot regress.
function setup({ seen = false, reduced = false, hash = '', history = false, blocked = false, handoff = false, badGeometry = false, animationFails = false, source = readFileSync(new URL('../js/startup.js', import.meta.url), 'utf8') } = {}) {
  const timers = new Map(), listeners = new Map(), reveals = [], animations = [];
  let time = 0, id = 0, saved = seen ? '1' : null;
  const on = (target, type, fn) => listeners.set(`${target}:${type}`, fn);
  const off = (target, type) => listeners.delete(`${target}:${type}`);
  const stages = ['build', 'test', 'lint', 'deploy'].map(job => ({ dataset: { job, state: 'pending' } }));
  const heroName = { getBoundingClientRect: () => ({ left: 40, top: 120, width: badGeometry ? 0 : 140, height: 60 }) };
  const finalName = {
    getBoundingClientRect: () => ({ left: 200, top: 300, width: 280, height: 120 }),
    animate(frames, options) {
      if (animationFails) throw Error('Animation unavailable');
      const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; } };
      animations.push(animation); return animation;
    },
  };
  const dialog = {
    hidden: true, open: false, dataset: {}, removed: false,
    showModal() { this.open = true; }, close() { this.open = false; },
    remove() { this.removed = true; },
    querySelector: selector => selector === '[data-startup-name]' ? (handoff ? finalName : null) : skip,
    addEventListener: (t, f) => on('dialog', t, f),
    removeEventListener: t => off('dialog', t),
    dispatchEvent(event) { reveals.push({ type: event.type, phase: this.dataset.phase, open: this.open }); listeners.get(`dialog:${event.type}`)?.(event); },
  };
  const status = { textContent: '' };
  const skip = { addEventListener: (t, f) => on('skip', t, f), removeEventListener: t => off('skip', t) };
  const motion = { matches: reduced, addEventListener: (t, f) => on('motion', t, f), removeEventListener: t => off('motion', t) };
  const document = {
    hidden: false,
    querySelector: s => ({ '[data-startup]': dialog, '[data-startup-status]': status, '[data-startup-skip]': skip, '[data-hero-name]': handoff ? heroName : null }[s]),
    querySelectorAll: () => stages,
    addEventListener: (t, f) => on('document', t, f), removeEventListener: t => off('document', t),
  };
  const window = {
    Event,
    matchMedia: () => motion, location: { hash },
    performance: { getEntriesByType: () => [{ type: history ? 'back_forward' : 'navigate' }] },
    sessionStorage: { getItem() { if (blocked) throw Error('blocked'); return saved; }, setItem(k, v) { if (blocked) throw Error('blocked'); saved = v; } },
    setTimeout(fn, delay) { timers.set(++id, { fn, at: time + delay }); return id; },
    clearTimeout: id => timers.delete(id),
    addEventListener: (t, f) => on('window', t, f), removeEventListener: t => off('window', t),
  };
  runInNewContext(source, { window, document });
  return {
    dialog, status, timers, listeners, document, reveals, stages, animations,
    fire: (target, type, event = {}) => listeners.get(`${target}:${type}`)?.(event),
    advance(to) {
      while (true) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > to) break;
        time = next[1].at; timers.delete(next[0]); next[1].fn();
      }
      time = to;
    },
  };
}

test('homepage supplies a progressive-enhancement dialog before the page content', () => {
  const html = renderHomePage();
  assert.match(html, /<dialog[^>]*data-startup[^>]*hidden/);
  assert.match(html, /css\/startup.css/);
  assert.doesNotMatch(html, /src="js\/startup.js"/);
  assert.ok(html.indexOf('<script data-startup-controller>') < html.indexOf('<header class="portfolio-header"'));
  assert.ok(html.includes(readFileSync(new URL('../js/startup.js', import.meta.url), 'utf8')));
  const intro = html.match(/<dialog[\s\S]*?<\/dialog>/)[0];
  assert.deepEqual([...intro.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match => match[1]), ['Source', 'Build', 'Test', 'Deploy']);
  for (const message of ['Connecting ideas', 'Building experiences', 'Checking the details', 'Portfolio ready']) assert.ok(intro.includes(message));
  for (const label of ['portfolio.yml', 'Queued', 'In progress', 'Success', 'Workflow preview']) assert.ok(intro.includes(label));
  const edges = [...intro.matchAll(/data-from="([^"]+)" data-to="([^"]+)"/g)].map(match => `${match[1]}:${match[2]}`);
  assert.deepEqual(edges, ['build:test', 'build:lint', 'test:deploy', 'lint:deploy', 'build:test', 'build:lint', 'test:deploy', 'lint:deploy']);
  assert.doesNotMatch(intro, /workflow-repo|workflow-tabs|workflow-sidebar/);
  assert.doesNotMatch(intro, /startup-scanner|IDENTITY VERIFIED/);
  assert.match(intro, /class="startup-finale"/);
  assert.match(intro, /I build web and mobile experiences\./);
});

test('the served index.html contains the current graph and inline controller', () => {
  const shipped = readFileSync(new URL('../index.html', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  const expected = renderHomePage().replaceAll('\r\n', '\n');
  for (const pattern of [/<dialog[\s\S]*?<\/dialog>/, /<script data-startup-controller>[\s\S]*?<\/script>/]) {
    assert.equal(shipped.match(pattern)?.[0], expected.match(pattern)?.[0], 'rebuild index.html after changing the startup renderer or controller');
  }
});

test('startup holds the personal finale before completing at five seconds', () => {
  const state = setup();
  assert.equal(state.dialog.open, true);
  assert.equal(state.status.textContent, 'Connecting ideas');
  assert.equal(state.dialog.dataset.workflow, 'running');
  assert.deepEqual(state.stages.map(stage => stage.dataset.state), ['active', 'pending', 'pending', 'pending']);
  state.advance(900); assert.equal(state.status.textContent, 'Connecting ideas');
  state.advance(1500); assert.equal(state.status.textContent, 'Building experiences');
  assert.deepEqual(state.stages.map(stage => stage.dataset.state), ['complete', 'active', 'active', 'pending'], 'Test and Lint must run in parallel');
  state.advance(2000); assert.equal(state.dialog.open, true);
  assert.equal(state.status.textContent, 'Checking the details');
  assert.deepEqual(state.stages.map(stage => stage.dataset.state), ['complete', 'complete', 'active', 'pending']);
  state.advance(2500); assert.equal(state.stages[3].dataset.state, 'pending', 'Deploy waits for both branches');
  state.advance(2800); assert.equal(state.status.textContent, 'Portfolio ready');
  assert.deepEqual(state.stages.map(stage => stage.dataset.state), ['complete', 'complete', 'complete', 'active']);
  state.advance(3300); assert.equal(state.dialog.dataset.phase, 'welcome');
  assert.equal(state.dialog.dataset.workflow, 'complete');
  assert.equal(state.status.textContent, 'Portfolio ready');
  assert.deepEqual(state.stages.map(stage => stage.dataset.state), ['complete', 'complete', 'complete', 'complete']);
  state.advance(4000); assert.equal(state.dialog.dataset.phase, 'welcome');
  state.advance(4500); assert.equal(state.dialog.dataset.phase, 'welcome', 'give the personal reveal time to land');
  state.advance(4700); assert.equal(state.dialog.dataset.phase, 'exit');
  assert.equal(state.reveals.length, 1);
  assert.equal(state.reveals[0].type, 'startup:reveal');
  assert.equal(state.reveals[0].phase, 'welcome', 'prime the homepage before the overlay moves');
  assert.equal(state.reveals[0].open, true);
  state.advance(5000);
  assert.equal(state.reveals.length, 1, 'do not restart the entrance after closing');
  assert.equal(state.dialog.open, false);
  assert.equal(state.dialog.removed, true);
  assert.equal(state.timers.size, 0);
  assert.equal(state.listeners.size, 0);
});

for (const options of [{ seen: true }, { reduced: true }, { hash: '#work' }, { history: true }]) {
  test(`intro bypasses ${JSON.stringify(options)}`, () => {
    const state = setup(options);
    assert.equal(state.dialog.open, false);
    assert.equal(state.dialog.removed, true);
    assert.equal(state.timers.size, 0);
  });
}

for (const [target, event] of [['skip', 'click'], ['dialog', 'cancel'], ['motion', 'change'], ['window', 'pagehide'], ['document', 'visibilitychange']]) {
  test(`${target} ${event} dismisses immediately and leaves no active work`, () => {
    const state = setup();
    state.advance(3500);
    state.document.hidden = true;
    state.fire(target, event, { preventDefault() {} });
    assert.equal(state.dialog.open, false);
    assert.equal(state.timers.size, 0);
    assert.equal(state.listeners.size, 0);
  });
}

test('blocked storage cannot prevent the homepage being revealed', () => {
  const state = setup({ blocked: true });
  state.advance(5000);
  assert.equal(state.dialog.open, false);
});

test('intro name moves to the hero during exit and its animation is cleaned up', () => {
  const state = setup({ handoff: true });
  state.advance(4500);
  assert.equal(state.animations.length, 0, 'hold the greeting before moving it');
  state.advance(4600);
  assert.equal(state.animations.length, 1);
  assert.equal(state.animations[0].options.duration, 400);
  assert.equal(state.animations[0].frames.at(-1).transform, 'translate(-160px, -180px) scale(0.5)');
  state.advance(5000);
  assert.equal(state.dialog.removed, true);
  assert.equal(state.animations[0].cancelled, true);
  assert.equal(state.timers.size, 0);
  assert.equal(state.listeners.size, 0);
});

for (const options of [{ badGeometry: true }, { animationFails: true }]) {
  test(`name handoff failure cannot delay the homepage: ${JSON.stringify(options)}`, () => {
    const state = setup({ handoff: true, ...options });
    state.advance(5000);
    assert.equal(state.dialog.removed, true);
    assert.equal(state.animations.length, 0);
    assert.equal(state.timers.size, 0);
    assert.equal(state.reveals.length, 1);
  });
}

test('the local preview runs a timed startup instead of freezing the welcome screen', () => {
  const html = renderStartupPreview();
  const source = html.match(/<script(?: data-startup-controller)?>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(source, 'preview has an inline controller');
  const state = setup({ source });
  assert.equal(state.dialog.open, true);
  state.advance(1500);
  assert.equal(state.status.textContent, 'Building experiences');
  state.advance(5000);
  assert.equal(state.dialog.open, false);
  assert.equal(state.timers.size, 0);
});
