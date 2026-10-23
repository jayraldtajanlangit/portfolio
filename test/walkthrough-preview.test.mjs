import test from 'node:test';
import assert from 'node:assert/strict';
const module = await import('../js/walkthrough.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const base = { hoverable: true, hovered: false, focused: false, intersecting: true, documentVisible: true, reducedMotion: false, userPaused: false, manual: false };
test('desktop walkthroughs autoplay without hover or keyboard engagement', () => {
  assert.equal(typeof module.shouldPreviewPlay, 'function');
  assert.equal(module.shouldPreviewPlay(base), true);
  assert.equal(module.shouldPreviewPlay({ ...base, hovered: true }), true);
  assert.equal(module.shouldPreviewPlay({ ...base, focused: true }), true);
  assert.equal(module.shouldPreviewPlay({ ...base, hovered: true, intersecting: false }), false);
});
test('touch previews autoplay visibly and respect motion, user pause, and tab visibility', () => {
  assert.equal(typeof module.shouldPreviewPlay, 'function');
  const touch = { ...base, hoverable: false };
  assert.equal(module.shouldPreviewPlay(touch), true);
  assert.equal(module.shouldPreviewPlay({ ...touch, reducedMotion: true }), false);
  assert.equal(module.shouldPreviewPlay({ ...touch, reducedMotion: true, manual: true }), true);
  assert.equal(module.shouldPreviewPlay({ ...touch, documentVisible: false }), false);
  assert.equal(module.shouldPreviewPlay({ ...touch, userPaused: true }), false);
});

test('an old play promise cannot pause a newly visible preview', async () => {
  const handlers = new Map(), pending = [];
  const events = key => ({ addEventListener(name, fn) { handlers.set(`${key}:${name}`, fn); }, removeEventListener() {} });
  const frame = { dataset: {} };
  const video = {
    ...events('video'), paused: true,
    play() { this.paused = false; handlers.get('video:play')?.(); return new Promise(resolve => pending.push(resolve)); },
    pause() { if (!this.paused) { this.paused = true; handlers.get('video:pause')?.(); } },
  };
  const card = { ...events('card'), querySelector: selector => selector === 'video' ? video : frame, contains: () => false };
  let intersect;
  const doc = { ...events('doc'), hidden: false, querySelectorAll: () => [card], defaultView: {
    matchMedia: query => ({ ...events(query), matches: query.includes('hover: hover') }),
    IntersectionObserver: class { constructor(callback) { intersect = callback; } observe() {} disconnect() {} },
  } };
  const stop = module.initWalkthroughPreviews(doc);
  intersect([{ target: frame, isIntersecting: true, intersectionRatio: 1 }]);
  intersect([{ target: frame, isIntersecting: false, intersectionRatio: 0 }]);
  intersect([{ target: frame, isIntersecting: true, intersectionRatio: 1 }]);
  assert.equal(pending.length, 2);
  pending[0](); await Promise.resolve(); await Promise.resolve();
  assert.equal(video.paused, false, 'the older request must not stop the current preview');
  pending[1](); await Promise.resolve();
  stop();
});

test('all visible previews play together, support individual pause, and stop in a hidden tab', () => {
  const handlers = new Map();
  const events = key => ({ addEventListener(name, fn) { handlers.set(`${key}:${name}`, fn); }, removeEventListener(name) { handlers.delete(`${key}:${name}`); } });
  const fire = (key, name, event = {}) => handlers.get(`${key}:${name}`)?.(event);
  const items = Array.from({ length: 3 }, (_, index) => {
    const attrs = new Map([['aria-label', `Project ${index} walkthrough`]]), frame = {};
    const video = { ...events(`video${index}`), paused: true, controls: true,
      getAttribute: name => attrs.get(name), setAttribute: (name, value) => attrs.set(name, value),
      play() { this.paused = false; fire(`video${index}`, 'play'); return Promise.resolve(); },
      pause() { if (!this.paused) { this.paused = true; fire(`video${index}`, 'pause'); } },
    };
    return { video, frame, card: { ...events(`card${index}`), querySelector: selector => selector === 'video' ? video : frame, contains: () => false } };
  });
  let intersect;
  const reduced = { ...events('reduced'), matches: false };
  const doc = { ...events('doc'), hidden: false, querySelectorAll: () => items.map(item => item.card), defaultView: {
    matchMedia: query => query.includes('reduced-motion') ? reduced : { ...events('hover'), matches: true },
    IntersectionObserver: class { constructor(callback) { intersect = callback; } observe() {} disconnect() {} },
  } };
  const stop = module.initWalkthroughPreviews(doc);
  const visible = indices => intersect(items.map((item, index) => ({ target: item.frame, isIntersecting: indices.includes(index), intersectionRatio: indices.includes(index) ? 1 : 0 })));
  visible([0, 1, 2]);
  assert.ok(items.every(({ video }) => !video.paused), 'all three visible projects should play together');
  assert.ok(items.every(({ video }) => video.controls === false), 'preview control bars should be hidden');
  fire('video0', 'click');
  assert.deepEqual(items.map(({ video }) => video.paused), [true, false, false]);
  assert.match(items[0].video.getAttribute('aria-label'), /^Play /);
  visible([1, 2]); visible([0, 1, 2]);
  assert.equal(items[0].video.paused, true, 'intentional pause survives scrolling');
  let prevented = false;
  fire('video0', 'keydown', { key: 'Enter', preventDefault() { prevented = true; } });
  assert.ok(prevented); assert.ok(items.every(({ video }) => !video.paused));
  doc.hidden = true; fire('doc', 'visibilitychange');
  assert.ok(items.every(({ video }) => video.paused));
  doc.hidden = false; fire('doc', 'visibilitychange');
  assert.ok(items.every(({ video }) => !video.paused));
  reduced.matches = true; fire('reduced', 'change');
  assert.ok(items.every(({ video }) => video.paused));
  fire('video1', 'click');
  assert.deepEqual(items.map(({ video }) => video.paused), [true, false, true]);
  stop(); assert.ok(items.every(({ video }) => video.paused));
});
