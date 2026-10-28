import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../js/projects.js';
import { renderCaseStudy } from '../scripts/render-site.mjs';
import { renderHomePage } from '../scripts/render-home.mjs';

test('hero previews link real web and mobile project captures without adding video players', () => {
  const html = renderHomePage();
  const composition = html.match(/<figure class="hero-composition"[\s\S]*?<\/figure>/)?.[0];
  assert.ok(composition, 'hero has a web and mobile composition');
  for (const slug of ['skyfire', 'bulk-buying-companion']) {
    const project = projects.find(project => project.slug === slug);
    assert.ok(composition.includes(`href="projects/${slug}.html"`));
    assert.ok(composition.includes(`src="${project.media.poster}"`));
    assert.ok(composition.includes(`width="${project.media.width}" height="${project.media.height}"`));
  }
  assert.equal([...composition.matchAll(/<img\b[^>]+alt="[^"]+"/g)].length, 2);
  assert.doesNotMatch(composition, /<video\b|startup-watermark/);
});

test('every project retains all three workflow screenshots and disclosures in its case study', () => {
  for (const project of projects) {
    const html = renderCaseStudy(project, projects[0]);
    for (const still of project.media.stills) assert.ok(html.includes(still.src));
    assert.ok(html.includes('Ownership boundary.'));
    assert.ok(html.includes('Engineering choices'));
  }
});
