import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMediaAction, initProjectMedia } from '../js/media.js';

test('an autoplay policy rejection preserves the visible player for manual playback', async () => {
  const frame = { classList: { add() {} }, querySelector: () => null };
  const video = { controls: true, dataset: {}, muted: true, closest: () => frame, pause() {}, play: async () => { const error = Error('Autoplay blocked'); error.name = 'NotAllowedError'; throw error; } };
  assert.equal(await applyMediaAction(video, 'play'), 'pause');
  assert.equal(video.controls, true);
  assert.notEqual(video.dataset.mediaFailed, 'true');
});

test('inline walkthrough controls remain available on initialization and Escape', () => {
  const events = new Map();
  const classes = new Set();
  const video = { controls: true, muted: false, dataset: {}, readyState: 2, addEventListener() {}, removeEventListener() {}, pause() {} };
  const frame = { querySelector: selector => selector === '[data-project-video]' ? video : null, classList: { add: name => classes.add(name), remove: name => classes.delete(name) } };
  const root = { visibilityState: 'visible', querySelectorAll: () => [frame], addEventListener: (name, handler) => events.set(name, handler), removeEventListener() {}, defaultView: { matchMedia: () => ({ matches: true }), IntersectionObserver: class { observe() {} disconnect() {} } } };
  const stop = initProjectMedia(root);
  assert.equal(video.controls, true);
  events.get('keydown')({ key: 'Escape' });
  assert.equal(video.controls, true);
  stop();
});
