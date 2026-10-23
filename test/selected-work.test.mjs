import test from 'node:test';
import assert from 'node:assert/strict';

const module = await import('../scripts/render-selected-work.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

test('selected work links resolve from both the homepage and nested portrait preview', () => {
  assert.equal(typeof module.renderSelectedWork, 'function');
  for (const prefix of ['', '../../']) {
    const html = module.renderSelectedWork(prefix);
    for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
      assert.ok(html.includes(`href="${prefix}projects/${slug}.html"`));
      assert.ok(html.includes(`poster="${prefix}assets/images/projects/${slug}/`));
      const portrait = ['bulk-buying-companion', 'pulso', 'sige'].includes(slug);
      assert.ok(html.includes(`src="${prefix}assets/videos/${slug}${portrait ? '-polished' : ''}.webm"`));
      assert.ok(html.includes(`src="${prefix}assets/videos/${slug}-polished.mp4"`));
      assert.ok(html.includes(`id="project-${slug}"`));
    }
    assert.ok(html.includes(`src="${prefix}assets/videos/maistra.webm"`));
    assert.doesNotMatch(html, /(?:href|src)="(?:null|undefined)/);
  }
});

test('all five projects have full previews and Sige identifies the demonstrated prototype', () => {
  const html = module.renderSelectedWork();
  assert.equal([...html.matchAll(/data-walkthrough-preview/g)].length, 5);
  const sige = html.slice(html.indexOf('id="project-sige"'));
  assert.match(sige, /Tasks UI prototype/);
  assert.match(sige, /Tasks and Insights are UI prototypes/);
  assert.match(sige, /My contribution/);
});

test('all five homepage previews loop automatically without playback bars', () => {
  const players = [...module.renderSelectedWork().matchAll(/<video\b[^>]*>/g)].map(match => match[0]);
  assert.equal(players.length, 5);
  for (const player of players) {
    assert.match(player, /\bautoplay\b/);
    assert.match(player, /\bmuted\b/);
    assert.match(player, /\bloop\b/);
    assert.match(player, /\bplaysinline\b/);
    assert.doesNotMatch(player, /\bcontrols\b/);
  }
});

test('selected work keeps contributions and case studies without repository actions', () => {
  assert.equal(typeof module.renderSelectedWork, 'function');
  const html = module.renderSelectedWork();
  const skyfire = html.slice(html.indexOf('id="project-skyfire"'), html.indexOf('id="project-maistra"'));
  assert.match(skyfire, /Individual project/);
  assert.match(skyfire, /backend seat validation/);
  assert.doesNotMatch(html, /href="https:\/\/github\.com\//);
  assert.doesNotMatch(html, />Source code<|>Private source<|>Team source not public</);
  assert.equal([...html.matchAll(/>View case study /g)].length, 5);
});
