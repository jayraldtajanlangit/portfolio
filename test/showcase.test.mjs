import test from 'node:test';
import assert from 'node:assert/strict';

const module = await import('../js/showcase.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

function element(extra = {}) {
  const listeners = new Map(), props = new Map(), classes = new Set();
  return {
    dataset: {}, listeners, props, classes,
    style: { setProperty: (name, value) => props.set(name, value), removeProperty: name => props.delete(name) },
    classList: { add: name => classes.add(name), remove: name => classes.delete(name), toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)), contains: name => classes.has(name) },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name, fn) => { if (listeners.get(name) === fn) listeners.delete(name); },
    setAttribute(name, value) { this[`attr:${name}`] = value; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 100 }),
    closest: () => null,
    ...extra,
  };
}

function page({ fine = true, reduced = false, swarm = false, observer = true } = {}) {
  const html = element({ dataset: swarm ? { swarmBuild: 'pending' } : {} });
  const heading = element({ className: 'section-heading' });
  const articles = ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige'].map(slug => element({ dataset: { projectTone: slug } }));
  const section = element({ querySelector: query => (query === '.section-heading' ? heading : null), querySelectorAll: query => (query === '[data-project-tone]' ? articles : []) });
  const tilts = [element(), element()];
  const appended = [], created = [], observers = [], docListeners = new Map();
  const view = {
    matchMedia: query => ({ matches: query.includes('reduce') ? reduced : query.includes('pointer: fine') ? fine : false }),
    requestAnimationFrame: fn => { fn(); return 1; },
    cancelAnimationFrame() {},
  };
  const mutations = [];
  view.MutationObserver = class {
    constructor(callback) { this.callback = callback; this.disconnected = false; mutations.push(this); }
    observe(target, options) { this.target = target; this.options = options; }
    disconnect() { this.disconnected = true; }
  };
  if (observer) view.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; this.observed = []; this.disconnected = false; observers.push(this); }
    observe(target) { this.observed.push(target); }
    disconnect() { this.disconnected = true; }
  };
  const root = {
    documentElement: html, defaultView: view,
    body: { append: node => appended.push(node) },
    createElement: tag => { const parts = new Map(); const node = element({ tag, removed: false, remove() { this.removed = true; }, querySelector: query => (parts.has(query) ? parts : parts.set(query, element())).get(query) }); created.push(node); return node; },
    querySelector: query => (query === '[data-project-colors]' ? section : null),
    querySelectorAll: query => (query === '[data-tilt]' ? tilts : []),
    addEventListener: (name, fn) => docListeners.set(name, fn),
    removeEventListener: (name, fn) => { if (docListeners.get(name) === fn) docListeners.delete(name); },
  };
  return { root, html, section, heading, articles, tilts, appended, created, observers, mutations, docListeners, fire: name => docListeners.get(name)?.() };
}

test('tilt leans at most seven degrees toward the pointer', () => {
  assert.deepEqual(module.tiltFor(.5, .5), { rx: 0, ry: 0 });
  assert.deepEqual(module.tiltFor(1, 0), { rx: 7, ry: 7 });
  assert.deepEqual(module.tiltFor(0, 1), { rx: -7, ry: -7 });
  assert.deepEqual(module.tiltFor(4, -3), { rx: 7, ry: 7 }, 'values outside the media are clamped');
});

const inside = map => ({ closest: query => map[query] ?? null });

test('the cursor becomes the project badge over projects and names other actions', () => {
  const project = { dataset: { cursor: 'View' }, closest: query => (query === '[data-project-tone]' ? { dataset: { projectTone: 'maistra' } } : null) };
  const resume = { dataset: { cursor: 'PDF' }, closest: () => null };
  assert.deepEqual(module.cursorState(inside({ '[data-cursor]': project, video: { paused: false } })), { state: 'badge', tone: 'maistra' }, 'a playing preview says View, not Pause');
  assert.deepEqual(module.cursorState(inside({ '[data-cursor]': resume })), { state: 'label', label: 'PDF' });
  assert.deepEqual(module.cursorState(inside({ 'a, button, [role="button"]': {} })), { state: 'link' });
  assert.deepEqual(module.cursorState(inside({})), { state: '' });
  assert.deepEqual(module.cursorState(null), { state: '' });
});

test('the projects band takes the color of the project in the middle of the screen', () => {
  const env = page();
  const stop = module.initProjectColors(env.root);
  assert.ok(env.html.classes.has('project-colors'));
  const [observer] = env.observers;
  assert.equal(observer.options.rootMargin, '-45% 0px -45% 0px');
  assert.deepEqual(observer.observed, [env.heading, ...env.articles]);
  assert.equal(env.section.dataset.activeProject, 'intro');
  observer.callback([{ target: env.articles[1], isIntersecting: true }]);
  assert.equal(env.section.dataset.activeProject, 'maistra');
  observer.callback([{ target: env.articles[1], isIntersecting: false }, { target: env.heading, isIntersecting: true }]);
  assert.equal(env.section.dataset.activeProject, 'intro');
  stop();
  assert.ok(observer.disconnected);
  assert.ok(!env.html.classes.has('project-colors'));
  assert.equal(env.section.dataset.activeProject, undefined);
});

test('reduced motion and Swarm keep the static color bands until it is safe to switch', () => {
  const reduced = page({ reduced: true });
  module.initProjectColors(reduced.root);
  assert.equal(reduced.observers.length, 0);
  assert.ok(!reduced.html.classes.has('project-colors'));
  const swarm = page({ swarm: true });
  module.initProjectColors(swarm.root);
  assert.equal(swarm.observers.length, 0, 'Swarm snapshots the colorful static bands');
  swarm.fire('swarm-rebuild:end');
  assert.equal(swarm.observers.length, 1);
});

test('tilt follows a fine pointer and resets when it leaves', () => {
  const env = page();
  const stop = module.initProjectTilt(env.root);
  const [media] = env.tilts;
  media.listeners.get('pointermove')({ clientX: 200, clientY: 0 });
  assert.equal(media.props.get('--rx'), '7deg');
  assert.equal(media.props.get('--ry'), '7deg');
  assert.equal(media.props.get('--gx'), '100%');
  assert.ok(media.classes.has('is-tilting'));
  media.listeners.get('pointerleave')();
  assert.equal(media.props.get('--rx'), undefined);
  assert.ok(!media.classes.has('is-tilting'));
  stop();
  assert.equal(media.listeners.size, 0);
});

test('touch screens and reduced motion get no tilt and no custom cursor', () => {
  for (const options of [{ fine: false }, { reduced: true }]) {
    const env = page(options);
    module.initProjectTilt(env.root);
    module.initViewCursor(env.root);
    assert.ok(env.tilts.every(media => media.listeners.size === 0));
    assert.equal(env.created.length, 0);
    assert.ok(!env.html.classes.has('custom-cursor'), 'the native cursor stays visible');
  }
});

test('the custom cursor starts after Swarm and is removed on cleanup', () => {
  const env = page({ swarm: true });
  const stop = module.initViewCursor(env.root);
  assert.equal(env.created.length, 0);
  env.fire('swarm-rebuild:end');
  assert.equal(env.appended.length, 1);
  const [cursor] = env.appended;
  assert.equal(cursor['attr:aria-hidden'], 'true');
  assert.ok(cursor.classes.has('site-cursor'));
  assert.match(cursor.innerHTML, /class="site-cursor-badge"/);
  assert.match(cursor.innerHTML, /VIEW PROJECT/);
  assert.match(cursor.innerHTML, /class="site-cursor-pill"/);
  assert.ok(env.html.classes.has('custom-cursor'));
  stop();
  assert.ok(cursor.removed);
  assert.ok(!env.html.classes.has('custom-cursor'));
});

test('over a project the badge takes its color, and over a named button the word tag shows', () => {
  const env = page();
  module.initViewCursor(env.root);
  const [cursor] = env.appended;
  const move = target => env.docListeners.get('pointermove')({ clientX: 40, clientY: 40, target });
  move(inside({ '[data-cursor]': { dataset: { cursor: 'View' }, closest: query => (query === '[data-project-tone]' ? { dataset: { projectTone: 'pulso' } } : null) } }));
  assert.equal(cursor.dataset.state, 'badge');
  assert.equal(cursor.dataset.tone, 'pulso');
  move(inside({ '[data-cursor]': { dataset: { cursor: 'Copy' }, closest: () => null }, '[data-surface="dark"]': {} }));
  assert.equal(cursor.dataset.state, 'label');
  assert.equal(cursor.querySelector('.site-cursor-pill').textContent, 'Copy');
  assert.equal(cursor.dataset.onDark, '');
  assert.ok(cursor.classes.has('is-visible'));
});

test('the cursor re-reads its word when a button changes it, such as Copy becoming Copied', () => {
  const env = page();
  const stop = module.initViewCursor(env.root);
  const [watcher] = env.mutations;
  assert.equal(watcher.target, env.root.body);
  assert.deepEqual(watcher.options, { subtree: true, attributes: true, attributeFilter: ['data-cursor'] });
  stop();
  assert.ok(watcher.disconnected);
});

test('every project color has a matching badge ink', async () => {
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(new URL('../css/motion.css', import.meta.url), 'utf8');
  for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
    assert.match(css, new RegExp(`\\.site-cursor\\[data-tone="${slug}"\\]\\s*\\{\\s*--badge-ink:\\s*var\\(--tone-${slug}\\)`), `${slug} badge ink`);
  }
  assert.match(css, /@keyframes site-cursor-spin/);
});

test('the project badge stays small while its words stay readable', async () => {
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(new URL('../css/motion.css', import.meta.url), 'utf8');
  const width = Number(css.match(/\.site-cursor-badge\s*\{[^}]*?\bwidth:\s*(\d+)px/)[1]);
  const font = Number(css.match(/\.site-cursor-badge text\s*\{[^}]*?font:\s*\d+\s+([\d.]+)px/)[1]);
  assert.ok(width <= 90, `badge is ${width}px across`);
  assert.ok(font * width / 100 >= 10, `badge text renders at ${(font * width / 100).toFixed(1)}px`);
});

test('the résumé links and the copy button name their action for the cursor', async () => {
  const { renderHomePage } = await import('../scripts/render-home.mjs');
  const html = renderHomePage();
  const resume = [...html.matchAll(/<a [^>]*jayrald-tajanlangit-resume\.pdf[^>]*>/g)].map(match => match[0]);
  assert.equal(resume.length, 2);
  assert.match(resume.find(link => !link.includes(' download')), /data-cursor="Open"/, 'the hero link opens the PDF');
  assert.match(resume.find(link => link.includes(' download')), /data-cursor="Download"/, 'the About link downloads it');
  assert.match(html.match(/<button class="contact-copy"[^>]*>/)[0], /data-cursor="Copy"/);
});

test('the homepage loads the showcase module after the motion module it builds on', async () => {
  const { renderHomePage } = await import('../scripts/render-home.mjs');
  const html = renderHomePage();
  const motion = html.indexOf('<script type="module" src="js/motion.js"></script>');
  const showcase = html.indexOf('<script type="module" src="js/showcase.js"></script>');
  assert.ok(motion > 0 && showcase > motion);
});

// Scroll stops for a 900px-tall screen: projects centered at scroll positions 1100, 1700 and 2300.
const step = (y, direction) => module.stepDistance([1100, 1700, 2300].map(stop => stop - y), direction, 900);

test('in the projects every scroll step goes one project, up or down', () => {
  assert.equal(step(1100, 1), 600);
  assert.equal(step(1700, -1), -600);
  assert.equal(step(1400, 1), 300, 'from between two projects it goes on to the next');
  assert.equal(step(1400, -1), -300, 'or back to the one before');
});

test('past the first or last project the page scrolls normally', () => {
  assert.equal(step(1100, -1), null);
  assert.equal(step(2300, 1), null);
  assert.equal(step(300, 1), null, 'far above, the projects do not pull');
  assert.equal(step(3500, -1), null, 'far below, neither');
});

test('arriving from another section, the nearest project catches you once it is close', () => {
  assert.equal(step(700, 1), 400);
  assert.equal(step(2700, -1), -400);
});

function stepPage({ fine = true, reduced = false, height = 900, tall = false } = {}) {
  const docListeners = new Map(), frames = [], timers = [];
  const view = {
    scrollY: 1100, innerHeight: height, jumps: [],
    matchMedia: query => ({ matches: query.includes('reduce') ? reduced : query.includes('pointer: fine') ? fine : false }),
    getComputedStyle: node => node.computed,
    scrollTo(options) { this.jumps.push(options); this.scrollY = options.top; },
    requestAnimationFrame: fn => frames.push(fn),
    cancelAnimationFrame: id => { frames[id - 1] = null; },
    setTimeout: (fn, ms) => timers.push({ fn, ms }),
    clearTimeout: id => { if (timers[id - 1]) timers[id - 1].fn = null; },
  };
  const boxAt = (top, size) => () => ({ top: top - view.scrollY, bottom: top + size - view.scrollY, height: size, left: 0, width: 1200 });
  const padded = { paddingTop: '80px', paddingBottom: '80px' };
  // Three projects whose 440px content is centered at 1100, 1700 and 2300 on a 900px screen,
  // and optionally a fourth whose 1240px content is taller than the screen.
  const sizes = [[1250, 600], [1850, 600], [2450, 600], ...(tall ? [[3050, 1400]] : [])];
  const projects = sizes.map(([top, size]) => ({ getBoundingClientRect: boxAt(top, size), computed: padded }));
  const section = { querySelectorAll: query => (query === '[data-project-tone]' ? projects : []) };
  const root = {
    documentElement: { dataset: {} }, defaultView: view,
    querySelector: query => (query === '[data-project-colors]' ? section : null),
    addEventListener: (name, fn, options) => docListeners.set(name, { fn, options }),
    removeEventListener: (name, fn) => { if (docListeners.get(name)?.fn === fn) docListeners.delete(name); },
  };
  const send = (name, event = {}) => {
    let prevented = false;
    docListeners.get(name)?.fn({ timeStamp: 0, deltaX: 0, target: { closest: () => null }, preventDefault: () => { prevented = true; }, ...event });
    return prevented;
  };
  const pending = () => frames.filter(Boolean).length;
  // Runs the glide to its end: its first frame, then one well past its length.
  const finishGlide = () => {
    for (let time = 0; pending(); time += 5000) { const index = frames.findIndex(Boolean); const fn = frames[index]; frames[index] = null; fn(time); }
  };
  const endHold = () => timers.filter(timer => timer.fn).forEach(timer => { const { fn } = timer; timer.fn = null; fn(); });
  return { root, view, docListeners, timers, send, pending, finishGlide, endHold, wheel: (deltaY, event) => send('wheel', { deltaY, ...event }) };
}

test('a wheel click in the projects glides to the next project and holds it there', () => {
  const env = stepPage();
  module.initProjectSnap(env.root);
  assert.equal(env.docListeners.get('wheel').options.passive, false, 'the page may hold the wheel');
  assert.equal(env.wheel(100, { timeStamp: 1000 }), true, 'the page does not jump on its own');
  env.finishGlide();
  assert.deepEqual(env.view.jumps.at(-1), { top: 1700, behavior: 'instant' });
  assert.ok(env.view.jumps.length > 1 && env.view.jumps[0].top === 1100, 'it glides there frame by frame');
  assert.equal(env.wheel(100, { timeStamp: 1900 }), true, 'scrolling on right away is held');
  assert.equal(env.pending(), 0, 'and starts no second glide');
  assert.equal(env.timers.at(-1).ms, 250);
  env.endHold();
  env.wheel(100, { timeStamp: 3000 });
  env.finishGlide();
  assert.equal(env.view.scrollY, 2300);
  env.endHold();
  assert.equal(env.wheel(100, { timeStamp: 5000 }), false, 'after the last project the page scrolls on normally');
  assert.equal(env.pending(), 0);
});

test('a touchpad coasting after a swipe does not skip a project', () => {
  const env = stepPage();
  module.initProjectSnap(env.root);
  env.wheel(30, { timeStamp: 1000 });
  env.finishGlide();
  env.endHold();
  for (const [deltaY, timeStamp] of [[24, 1016], [18, 1032], [12, 1048]]) assert.equal(env.wheel(deltaY, { timeStamp }), true, 'momentum is absorbed');
  assert.equal(env.pending(), 0);
  env.wheel(20, { timeStamp: 1300 });
  assert.equal(env.pending(), 1, 'a fresh swipe moves on');
});

test('zooming and sideways scrolling are left alone', () => {
  const env = stepPage();
  module.initProjectSnap(env.root);
  assert.equal(env.wheel(100, { ctrlKey: true }), false);
  assert.equal(env.wheel(10, { deltaX: 80 }), false);
  assert.equal(env.pending(), 0);
});

test('arrow keys, Page Up/Down and Space step through the projects, but not while a field or button has focus', () => {
  const env = stepPage();
  module.initProjectSnap(env.root);
  const key = (name, event) => env.send('keydown', { key: name, ...event });
  assert.equal(key('ArrowDown'), true);
  env.finishGlide();
  env.endHold();
  assert.equal(env.view.scrollY, 1700);
  assert.equal(key(' ', { shiftKey: true }), true, 'Shift+Space goes back');
  env.finishGlide();
  env.endHold();
  assert.equal(env.view.scrollY, 1100);
  const focused = { closest: query => (query.includes('button') ? {} : null) };
  assert.equal(key(' ', { target: focused }), false, 'Space still presses a focused button or plays a video');
  assert.equal(key('Home'), false);
  assert.equal(key('ArrowDown', { altKey: true }), false);
  assert.equal(env.pending(), 0);
});

test('grabbing the page during a glide stops it there', () => {
  const env = stepPage();
  module.initProjectSnap(env.root);
  env.wheel(100, { timeStamp: 1000 });
  env.send('pointerdown');
  assert.equal(env.pending(), 0);
  env.wheel(100, { timeStamp: 3000 });
  assert.equal(env.pending(), 1, 'the next scroll steps again');
});

test('a project taller than the screen stops at its top, then its bottom', () => {
  const env = stepPage({ tall: true });
  module.initProjectSnap(env.root);
  env.view.scrollY = 2300;
  for (const [stop, timeStamp] of [[3114, 1000], [3486, 3000]]) {
    env.wheel(100, { timeStamp });
    env.finishGlide();
    env.endHold();
    assert.equal(env.view.scrollY, stop, 'with 16px to spare');
  }
  assert.equal(env.wheel(100, { timeStamp: 5000 }), false);
  const snug = stepPage({ height: 420 });
  module.initProjectSnap(snug.root);
  snug.view.scrollY = 1340;
  snug.wheel(100, { timeStamp: 1000 });
  snug.finishGlide();
  assert.equal(snug.view.scrollY, 1940, 'a project just a little taller than the screen still stops in the middle');
});

test('touch screens and reduced motion scroll freely, and stopping removes everything', () => {
  for (const options of [{ fine: false }, { reduced: true }]) {
    const env = stepPage(options);
    module.initProjectSnap(env.root);
    assert.equal(env.docListeners.size, 0);
  }
  const env = stepPage();
  const stop = module.initProjectSnap(env.root);
  env.wheel(100, { timeStamp: 1000 });
  stop();
  assert.equal(env.docListeners.size, 0);
  assert.equal(env.pending(), 0, 'a glide in progress is cancelled');
});

test('your cursor is the same agent arrow as the Swarm intro, pointing from its tip', async () => {
  const { readFile } = await import('node:fs/promises');
  const swarm = await readFile(new URL('../js/vendor/swarm-rebuild.js', import.meta.url), 'utf8');
  const arrow = swarm.match(/const ARROW_D =\s*"([^"]+)"/)[1];
  const env = page();
  module.initViewCursor(env.root);
  const [cursor] = env.appended;
  assert.match(cursor.innerHTML, /<span class="site-cursor-agent"><svg width="28" height="28" viewBox="0 0 28 28">/);
  assert.ok(cursor.innerHTML.includes(`d="${arrow}"`), 'the arrow is drawn exactly like the intro agents');
  assert.doesNotMatch(cursor.innerHTML, /site-cursor-dot/);
  const css = await readFile(new URL('../css/motion.css', import.meta.url), 'utf8');
  const agent = css.match(/\.site-cursor-agent \{[^}]*\}/)[0];
  assert.match(agent, /margin: -3\.5px 0 0 -5px/, 'the tip sits exactly on the pointer');
  assert.match(agent, /transform-origin: 5px 3\.5px/, 'and it leans around its tip');
  assert.match(agent, /rotate: var\(--lean, 0deg\)/);
});

test('the agent leans at most 16 degrees, more the faster it moves', () => {
  assert.equal(module.leanFor(0), 0);
  assert.equal(module.leanFor(20), 7);
  assert.equal(module.leanFor(-20), -7);
  assert.equal(module.leanFor(500), 16);
  assert.equal(module.leanFor(-500), -16);
});

test('the agent leans the way you move, stands upright at rest and squishes when you click', () => {
  const env = page();
  const frames = [];
  env.root.defaultView.requestAnimationFrame = fn => frames.push(fn);
  const stop = module.initViewCursor(env.root);
  const [cursor] = env.appended;
  const move = clientX => env.docListeners.get('pointermove')({ clientX, clientY: 100, target: inside({}) });
  const settle = () => { while (frames.length) frames.shift()(); };
  move(100);
  settle();
  move(200);
  frames.shift()();
  assert.equal(cursor.props.get('--lean'), '16deg', 'moving right it trails behind its tip');
  settle();
  assert.equal(cursor.props.get('--lean'), '0deg', 'and straightens once it catches up');
  move(180);
  frames.shift()();
  assert.equal(cursor.props.get('--lean'), '-5deg', 'a small move back leans a little the other way');
  env.docListeners.get('pointerdown')();
  assert.equal(cursor.dataset.pressed, '');
  env.docListeners.get('pointerup')();
  assert.equal(cursor.dataset.pressed, undefined);
  stop();
  for (const name of ['pointerdown', 'pointerup', 'pointercancel']) assert.ok(!env.docListeners.has(name), `${name} listener removed`);
});

test('the agent grows a little over links, squishes on click and hides behind the project badge', async () => {
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(new URL('../css/motion.css', import.meta.url), 'utf8');
  const rule = selector => css.indexOf(`.site-cursor${selector} .site-cursor-agent {`);
  assert.match(css, /\.site-cursor\[data-state="link"\] \.site-cursor-agent \{ scale: 1\.15; \}/);
  assert.match(css, /\.site-cursor\[data-pressed\] \.site-cursor-agent \{ scale: \.88; \}/);
  assert.match(css, /\.site-cursor\[data-state="badge"\] \.site-cursor-agent \{ scale: 0; \}/);
  assert.ok(rule('[data-state="badge"]') > rule('[data-pressed]'), 'a click on a project never brings the arrow back over the badge');
  assert.doesNotMatch(css, /site-cursor-dot/);
});
