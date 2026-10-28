import test from 'node:test';
import assert from 'node:assert/strict';

const module = await import('../js/motion.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

function environment(reduced = false) {
  const jobs = new Map(), listeners = new Map(), mediaListeners = new Set(), buttonListeners = new Map(), classes = new Set(), delays = [];
  let nextId = 0;
  const button = { hidden: true, attributes: {}, addEventListener: (name, fn) => buttonListeners.set(name, fn), removeEventListener: name => buttonListeners.delete(name), setAttribute(name, value) { this.attributes[name] = value; } };
  const target = { dataset: { typingWords: JSON.stringify(['web development', 'mobile development', 'artificial intelligence']) }, textContent: 'web development' };
  const media = { matches: reduced, addEventListener: (_, fn) => mediaListeners.add(fn), removeEventListener: (_, fn) => mediaListeners.delete(fn) };
  const root = {
    hidden: false,
    documentElement: { classList: { add: name => classes.add(name), remove: name => classes.delete(name) } },
    querySelectorAll: () => [target],
    querySelector: () => button,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
    defaultView: { matchMedia: () => media, setTimeout(fn, delay) { const id = ++nextId; jobs.set(id, fn); delays.push(delay); return id; }, clearTimeout: id => jobs.delete(id) },
  };
  const step = () => { const job = jobs.entries().next().value; assert.ok(job, 'a typing step should be scheduled'); jobs.delete(job[0]); job[1](); };
  const until = phrase => { for (let i = 0; i < 300 && target.textContent !== phrase; i++) step(); assert.equal(target.textContent, phrase); };
  return { root, target, button, jobs, classes, delays, step, until, pause: () => buttonListeners.get('click')?.(), reduced(value) { media.matches = value; mediaListeners.forEach(fn => fn({ matches: value })); }, visibility(hidden) { root.hidden = hidden; listeners.get('visibilitychange')?.(); } };
}

test('typing cycles through the interests and holds every full phrase for two seconds', () => {
  assert.equal(typeof module.initTypingLoop, 'function', 'a looping typing controller is required');
  const env = environment();
  const stop = module.initTypingLoop(env.root);
  assert.equal(env.delays.at(-1), 2000);
  for (const phrase of ['mobile development', 'artificial intelligence', 'web development']) {
    env.until(phrase);
    assert.equal(env.delays.at(-1), 2000);
  }
  stop();
  assert.equal(env.jobs.size, 0);
});

test('typing can be paused, resumed, and cleaned up', () => {
  assert.equal(typeof module.initTypingLoop, 'function');
  const env = environment();
  const stop = module.initTypingLoop(env.root);
  env.step();
  const pausedText = env.target.textContent;
  env.pause();
  assert.equal(env.jobs.size, 0);
  assert.equal(env.button.attributes['aria-pressed'], 'true');
  assert.equal(env.target.textContent, pausedText);
  env.pause();
  env.until('mobile development');
  stop();
  assert.equal(env.jobs.size, 0);
  assert.equal(env.target.textContent, 'web development');
});

test('reduced motion keeps static content and changing the setting stops active typing', () => {
  assert.equal(typeof module.initTypingLoop, 'function');
  const env = environment(true);
  const stop = module.initTypingLoop(env.root);
  assert.equal(env.jobs.size, 0);
  assert.ok(!env.classes.has('typing-enhanced'));
  env.reduced(false);
  assert.ok(env.jobs.size > 0);
  env.until('mobile development');
  env.reduced(true);
  assert.equal(env.jobs.size, 0);
  assert.ok(!env.classes.has('typing-enhanced'));
  stop();
});

test('typing pauses in a hidden tab and resumes without losing the chosen pause state', () => {
  assert.equal(typeof module.initTypingLoop, 'function');
  const env = environment();
  const stop = module.initTypingLoop(env.root);
  env.visibility(true);
  assert.equal(env.jobs.size, 0);
  env.visibility(false);
  env.until('artificial intelligence');
  env.pause();
  env.visibility(true);
  env.visibility(false);
  assert.equal(env.jobs.size, 0);
  stop();
});

test('project previews reveal before complete copy blocks, stagger across columns, and respect reduced motion', () => {
  const queries = [], animations = [], listeners = new Map(), classes = new Set();
  const group = { children: [] };
  const makeElement = (selector, card) => ({
    tagName: 'DIV', selector,
    matches: value => value.split(',').some(part => part.trim() === selector),
    closest: value => value === '.selected-projects-mobile' ? group : value === '.selected-project' ? card : null,
    animate(frames, options) {
      const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; }, finished: new Promise(() => {}) };
      animations.push(animation); return animation;
    },
  });
  const cards = Array.from({ length: 3 }, () => ({})); group.children = cards;
  const previews = cards.map(card => makeElement('.selected-project-media', card));
  const copies = cards.map(card => makeElement('.selected-project-copy', card));
  const paragraphs = cards.map(card => makeElement('.selected-project-copy > *', card));
  const media = { matches: false, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  let observer;
  const root = {
    documentElement: { classList: { add: name => classes.add(name), remove: name => classes.delete(name) } },
    querySelectorAll(selector) { return [...previews, ...copies, ...paragraphs].filter(el => el.matches(selector)); },
    defaultView: {
      matchMedia: () => media,
      IntersectionObserver: class {
        observed = []; disconnected = false;
        constructor(callback) { this.callback = callback; observer = this; }
        observe(el) { this.observed.push(el); }
        unobserve(el) { this.observed = this.observed.filter(value => value !== el); }
        disconnect() { this.disconnected = true; }
      },
    },
  };
  const stop = module.initPortfolioMotion(root);
  assert.deepEqual(observer.observed, [...previews, ...copies], 'observe previews and complete copy blocks, without animating their rows separately');
  const entries = [...previews, ...copies].map(target => ({ target, isIntersecting: true }));
  observer.callback(entries);
  assert.deepEqual(animations.map(animation => animation.options.delay), [0, 90, 180, 140, 230, 320]);
  assert.ok(animations.every(animation => animation.options.fill === 'backwards'), 'apply the starting state during the stagger so delayed columns do not flash');
  assert.ok(animations.every(animation => animation.options.duration <= 700));
  assert.ok(animations.slice(0, 3).every(animation => animation.frames[0].transform === 'translateY(18px)'));
  assert.ok(animations.slice(3).every(animation => animation.frames[0].transform === 'translateY(12px)'));
  observer.callback(entries);
  assert.equal(animations.length, 6, 'each project reveals only once');
  media.matches = true; listeners.get('change')();
  assert.ok(animations.every(animation => animation.cancelled));
  assert.ok(!classes.has('portfolio-motion'));
  stop(); assert.equal(listeners.size, 0);
});

function entranceEnvironment({ splash = true, reduced = false } = {}) {
  const closeListeners = new Map(), animations = [], observers = [];
  const selectors = ['.portfolio-header', '.intro-copy h1', '.intro-role', '.intro-copy > .intro-description', '.hero-composition'];
  const elements = selectors.map(selector => ({
    tagName: 'DIV', matches: query => query.split(',').some(value => value.trim() === selector),
    animate(frames, options) {
      const animation = { frames, options, cancelled: false, finished: new Promise(() => {}), cancel() { this.cancelled = true; } };
      animations.push(animation); return animation;
    },
  }));
  const dialog = { open: splash, addEventListener: (name, fn) => closeListeners.set(name, fn), removeEventListener: name => closeListeners.delete(name) };
  const root = {
    documentElement: { classList: { add() {}, remove() {} } },
    querySelector: query => query === '[data-startup]' ? dialog : null,
    querySelectorAll: query => elements.filter(element => element.matches(query)),
    defaultView: {
      matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }),
      IntersectionObserver: class {
        observed = [];
        constructor(callback) { this.callback = callback; observers.push(this); }
        observe(element) { this.observed.push(element); }
        unobserve() {} disconnect() {}
      },
    },
  };
  return { root, animations, elements, observers, closeListeners,
    reveal() { closeListeners.get('startup:reveal')?.(); },
    close() { dialog.open = false; closeListeners.get('close')?.(); },
  };
}

test('homepage entrance is primed synchronously before the splash exposes the page', () => {
  const env = entranceEnvironment();
  assert.equal(typeof module.initPageMotion, 'function');
  const stop = module.initPageMotion(env.root);
  assert.equal(env.observers.length, 0, 'do not spend the entrance underneath the splash');
  env.reveal();
  assert.equal(env.closeListeners.size, 0);
  assert.equal(env.animations.length, 5, 'prime the copy and composition before the splash fades');
  assert.deepEqual(env.animations.map(a => a.options.delay), [0, 100, 200, 300, 400]);
  const observer = env.observers[0];
  assert.deepEqual(observer.observed, [], 'scroll observer must not replay the already-started hero');
  env.close();
  assert.equal(env.animations.length, 5, 'closing the splash must not restart the entrance');
  assert.ok(env.animations.every(a => a.options.fill === 'backwards' && a.frames.at(-1).opacity === 1));
  stop();
  assert.ok(env.animations.every(a => a.cancelled));
});

test('closing without an exit event still starts the entrance for Skip and Escape', () => {
  const env = entranceEnvironment();
  const stop = module.initPageMotion(env.root);
  env.close();
  assert.equal(env.animations.length, 5);
  assert.equal(env.closeListeners.size, 0);
  stop();
});

test('entrance bypasses splash waiting on repeat visits and respects reduced motion', () => {
  const repeat = entranceEnvironment({ splash: false });
  const stopRepeat = module.initPageMotion(repeat.root);
  assert.equal(repeat.observers.length, 1);
  assert.equal(repeat.closeListeners.size, 0);
  stopRepeat();
  const reduced = entranceEnvironment({ reduced: true });
  const stopReduced = module.initPageMotion(reduced.root);
  reduced.close();
  assert.equal(reduced.observers.length, 0);
  assert.equal(reduced.animations.length, 0);
  stopReduced();
});

test('disposing before the splash closes removes the pending entrance listener', () => {
  const env = entranceEnvironment();
  const stop = module.initPageMotion(env.root);
  stop(); env.close();
  assert.equal(env.closeListeners.size, 0);
  assert.equal(env.observers.length, 0);
});
