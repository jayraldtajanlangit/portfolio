import assert from 'node:assert/strict';
import test from 'node:test';

import { projects } from '../js/projects.js';
import { renderCaseStudy } from '../scripts/render-site.mjs';

test('renders the case-study evidence and ownership record', () => {
  const [project, nextProject] = projects;
  const html = renderCaseStudy(project, nextProject);

  assert.doesNotMatch(html, /<dt>Folio<\/dt>/);
  assert.doesNotMatch(html, /class="case-kicker"/);
  assert.match(html, new RegExp(project.ownership.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, new RegExp(project.media.disclosure.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, new RegExp(`poster="\.\./${project.media.poster}"`));

  for (const still of project.media.stills) {
    assert.match(html, new RegExp(`src="\.\./${still.src}"`));
  }
});

test('renders a concise next-project title without losing its accessible name', () => {
  const [project, nextProject] = projects;
  const html = renderCaseStudy(project, nextProject);

  assert.match(
    html,
    /<a class="shell" href="skyfire\.html" aria-label="Next case study: SkyFire — Airline Booking System">/,
  );
  assert.match(html, /<strong>SkyFire<\/strong>/);
});

test('rejects an incomplete case-study render request', () => {
  assert.throws(() => renderCaseStudy(projects[0]), /requires a project and nextProject/);
});

test('every case study presents a demonstrated outcome, evidence and limitations', () => {
  for (const project of projects) {
    const html = renderCaseStudy(project, projects[0]);
    assert.match(html, /<h2 id="outcome-title">Outcome<\/h2>/);
    assert.ok(project.outcome?.result, `${project.slug}: missing result`);
    assert.ok(project.outcome?.evidence, `${project.slug}: missing evidence`);
    assert.ok(project.outcome?.limitation, `${project.slug}: missing limitation`);
    for (const value of Object.values(project.outcome)) assert.ok(html.includes(value));
  }
  const skyfire = projects.find(project => project.slug === 'skyfire');
  assert.match(skyfire.outcome.limitation, /SQLite/);
  const sige = projects.find(project => project.slug === 'sige');
  assert.match(sige.outcome.limitation, /Tasks and Insights.*UI prototypes/);
});

test('case studies omit project repository links even when a source URL is provided', () => {
  const project = { ...projects[0], sourceUrl: 'https://github.com/example/project' };
  const html = renderCaseStudy(project, projects[1]);
  assert.doesNotMatch(html, /https:\/\/github\.com\/[^"/]+\//);
  assert.doesNotMatch(html, /View source code/);
  assert.match(html, /href="https:\/\/github\.com\/jayraldtajanlangit"/);
});

test('every case study has a directly playable walkthrough without JavaScript', () => {
  for (const project of projects) {
    const html = renderCaseStudy(project, projects[0]);
    assert.match(html, /<h2 id="walkthrough-title">Project walkthrough<\/h2>/);
    assert.match(html, /<video[^>]*\bcontrols\b/);
    assert.ok(html.includes(`src="../assets/videos/${project.slug}-polished.mp4" type="video/mp4"`));
    assert.ok(html.includes(`src="../${project.media.video}" type="video/webm"`));
    assert.ok(html.includes(`href="../assets/videos/${project.slug}-polished.mp4"`));
    assert.doesNotMatch(html, /data-media-toggle/);
  }
});
