import test from 'node:test';
import assert from 'node:assert/strict';
import { walkthroughMotion, sampleTrack, smoothStep } from '../scripts/walkthrough-motion.mjs';

test('guided camera and cursor tracks stay within source coordinates and return to a wide shot', () => {
  for (const profile of Object.values(walkthroughMotion)) {
    for (let time = 0; time <= profile.duration; time += 1 / 60) {
      const [x, y, scale] = sampleTrack(profile.camera, time);
      const [px, py] = profile.cursor ? sampleTrack(profile.cursor, time) : [.5, .5];
      assert.ok([x, y, px, py].every(value => value >= 0 && value <= 1));
      assert.ok(scale >= 1 && scale <= 1.6);
    }
    assert.equal(sampleTrack(profile.camera, 0)[2], 1);
    assert.equal(sampleTrack(profile.camera, profile.duration)[2], 1);
  }
});

test('mobile walkthroughs keep the entire screen steady and use brief taps instead of a cursor', () => {
  for (const slug of ['bulk-buying-companion', 'pulso', 'sige']) {
    const profile = walkthroughMotion[slug];
    assert.equal(profile.interaction, 'touch');
    assert.equal(profile.cursor, undefined);
    for (let time = 0; time <= profile.duration; time += .05) {
      assert.deepEqual(sampleTrack(profile.camera, time), [.5, .5, 1]);
    }
    assert.ok(profile.taps.length >= 2);
    for (const tap of profile.taps) {
      assert.ok(tap.time > 0 && tap.time + .48 < profile.duration);
      assert.ok(tap.x > 0 && tap.x < 1 && tap.y > 0 && tap.y < 1);
      assert.ok(tap.label);
    }
  }
  for (const slug of ['skyfire', 'maistra']) assert.ok(walkthroughMotion[slug].cursor.length);
});

test('camera easing settles at both ends without an abrupt speed change', () => {
  assert.equal(smoothStep(0), 0);
  assert.equal(smoothStep(1), 1);
  assert.ok(smoothStep(.001) < .00001);
  assert.ok(1 - smoothStep(.999) < .00001);
  assert.deepEqual(sampleTrack([[0, 0], [1, 1]], .5), [.5]);
});
