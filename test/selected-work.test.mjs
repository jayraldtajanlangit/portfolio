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

test('every project introduces its role before the title and keeps every technology in a named chip list', () => {
  const html = module.renderSelectedWork();
  for (const project of projects) {
    const article = html.match(new RegExp(`<article[^>]*id="project-${project.slug}"[\\s\\S]*?<\\/article>`))?.[0];
    assert.ok(article, `${project.slug} card exists`);
    const role = article.indexOf('class="selected-project-role"');
    assert.ok(role >= 0 && role < article.indexOf('<h3'), `${project.slug} role comes before its title`);
    assert.match(article, /<ul class="selected-project-stack" aria-label="[^"]+ technologies">/);
    assert.deepEqual([...article.matchAll(/<li class="selected-project-chip">([^<]+)<\/li>/g)].map(match => match[1]), project.technologies);
  }
});

test('all five cards are numbered in display order and explain their captured three-step flow', () => {
  const html = module.renderSelectedWork();
  const flows = [
    ['skyfire', ['Search flights', 'Choose seats', 'Confirm booking']],
    ['maistra', ['Extract code', 'Review code', 'Run &amp; grade']],
    ['bulk-buying-companion', ['Browse deals', 'Inspect a deal', 'Reserve a share']],
    ['pulso', ['Sign in', 'Share a post', 'Edit profile']],
    ['sige', ['Review tasks', 'Open task', 'Mark complete']],
  ];
  for (const [index, [slug, steps]] of flows.entries()) {
    const project = projects.find(project => project.slug === slug);
    const article = html.match(new RegExp(`<article[^>]*id="project-${slug}"[\\s\\S]*?<\\/article>`))?.[0];
    assert.ok(article.includes(`<span class="selected-project-number">${String(index + 1).padStart(2, '0')}</span>`));
    assert.ok(article.includes(`<span class="selected-project-platform">${project.platform}</span>`));
    const caption = article.match(/<figcaption class="selected-project-flow">[\s\S]*?<\/figcaption>/)?.[0];
    assert.ok(caption, `${slug} has a walkthrough caption`);
    assert.match(caption, /<ol class="selected-project-steps" aria-label="[^"]+ walkthrough steps">/);
    assert.deepEqual([...caption.matchAll(/class="project-step-label">([^<]+)<\/span>/g)].map(match => match[1]), steps);
    if (slug === 'sige') assert.match(caption, /Tasks UI prototype/);
  }
});
