import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../js/projects.js';
import { renderCaseStudy } from '../scripts/render-site.mjs';
import { renderHomePage } from '../scripts/render-home.mjs';

test('hero introduces the developer with one accessible name and portrait', () => {
  const html = renderHomePage();
  const hero=html.match(/<section class="intro-section[^]*?<\/section>/)?.[0];
  assert.ok(hero);
  assert.equal([...hero.matchAll(/<h1\b/g)].length,1);
  assert.match(hero,/<h1[^>]+id="hero-title"[^]*?Jayrald[^]*?Tajanlangit[^]*?<\/h1>/);
  assert.match(hero,/<img[^>]+class="hero-portrait"[^>]+src="assets\/pp\/jayrald-hero-cutout.png"[^>]+alt="[^"]+"/);
  assert.ok(hero.indexOf('</h1>')<hero.indexOf('class="hero-portrait"'));
  assert.doesNotMatch(hero,/View projects|class="button-link"/);
  assert.match(hero,/resume\.pdf/);
  assert.doesNotMatch(hero,/hero-preview|<video\b/);
  const roles = hero.match(/data-typing-words='([^']+)'/);
  assert.ok(roles, 'the hero has a typing role');
  assert.deepEqual(JSON.parse(roles[1]), ['AI Engineer', 'Mobile Developer', 'Web Developer']);
});

test('every project retains all three workflow screenshots and disclosures in its case study', () => {
  for (const project of projects) {
    const html = renderCaseStudy(project, projects[0]);
    for (const still of project.media.stills) assert.ok(html.includes(still.src));
    assert.ok(html.includes('Ownership boundary.'));
    assert.ok(html.includes('Engineering choices'));
  }
});
