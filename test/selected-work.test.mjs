import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../js/projects.js';

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
  assert.match(sige, /My work:/);
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
  assert.equal([...html.matchAll(/>View project /g)].length, 5);
});

test('every project leads with its title and keeps ownership and all technologies available', () => {
  const html = module.renderSelectedWork();
  for (const project of projects) {
    const article = html.match(new RegExp(`<article[^>]*id="project-${project.slug}"[\\s\\S]*?<\\/article>`))?.[0];
    assert.ok(article, `${project.slug} card exists`);
    const role = article.indexOf('class="selected-project-role"');
    assert.ok(role >= 0 && role > article.indexOf('<h3'), `${project.slug} ownership follows its title`);
    assert.match(article, /<ul class="selected-project-stack" aria-label="[^"]+ technologies">/);
    assert.deepEqual([...article.matchAll(/<li class="selected-project-chip">([^<]+)<\/li>/g)].map(match => match[1]), project.technologies);
  }
});

test('homepage previews use one media surface and a clear project link', () => {
  const html = module.renderSelectedWork();
  assert.doesNotMatch(html, /project-browser|project-preview-bar|selected-project-number|selected-project-steps/);
  assert.equal([...html.matchAll(/class="phone-frame"/g)].length, 3, 'mobile projects retain phone mockups');
  assert.equal([...html.matchAll(/data-preview-toggle/g)].length, 5);
  for (const project of projects) {
    assert.ok(html.includes(`aria-label="View ${project.title.split(' \u2014 ')[0]} project"`));
    assert.ok(html.includes(`href="projects/${project.slug}.html"`));
  }
});
