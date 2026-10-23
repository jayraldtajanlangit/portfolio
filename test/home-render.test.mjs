import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../js/projects.js';
import { renderCaseStudy } from '../scripts/render-site.mjs';

test('every project retains all three workflow screenshots and disclosures in its case study', () => {
  for (const project of projects) {
    const html = renderCaseStudy(project, projects[0]);
    for (const still of project.media.stills) assert.ok(html.includes(still.src));
    assert.ok(html.includes('Ownership boundary.'));
    assert.ok(html.includes('Engineering choices'));
  }
});
