import test from 'node:test';
import assert from 'node:assert/strict';
import { projects, contacts } from '../js/projects.js';
import { renderHomePage } from '../scripts/render-site.mjs';
import { escapeHtml } from '../scripts/render-utils.mjs';

test('homepage provides navigation and usable contact paths without JavaScript', () => {
  const html = renderHomePage();
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
  assert.match(html, /<h2 id="work-title">Projects<\/h2>/);
  assert.doesNotMatch(html, /with a closer look at what I built/);
  for (const id of ['work', 'about', 'contact']) {
    assert.ok(html.includes(`href="#${id}"`));
    assert.ok(html.includes(`id="${id}"`));
  }
  assert.ok(html.includes('id="primary-navigation"'));
  assert.ok(html.includes(`mailto:${contacts.email}`));
  assert.ok(html.includes(contacts.github));
  assert.ok(html.includes(contacts.linkedin));
  assert.match(html, /<video[^>]*autoplay[^>]*muted[^>]*loop/);
  assert.doesNotMatch(html, /<video[^>]*\bcontrols\b/);
  assert.doesNotMatch(html, /href="#"/);
});

test('homepage keeps all projects inspectable with ownership and honest prototype status', () => {
  const html = renderHomePage();
  for (const project of projects) {
    assert.ok(html.includes(`href="projects/${project.slug}.html"`));
    assert.ok(html.includes(escapeHtml(project.role)));
    assert.ok(html.includes(project.media.poster));
  }
  assert.match(html, /Tasks and Insights are UI prototypes/);
  assert.doesNotMatch(html, /href="https:\/\/github\.com\/[^"/]+\//);
});

test('homepage avoids decorative numbered labels and gives every project a direct action', () => {
  const html = renderHomePage();
  assert.doesNotMatch(html, /section-kicker|View case study/);
  assert.equal([...html.matchAll(/>View project /g)].length, 5);
});

test('About follows the hero before Projects and Tech stack', () => {
  const html = renderHomePage();
  const about = html.indexOf('id="about"');
  assert.ok(about > html.indexOf('id="hero-title"'));
  assert.ok(about < html.indexOf('id="work"'));
  assert.ok(html.indexOf('id="work"') < html.indexOf('id="tech-stack"'));
});

test('header contains section navigation and appearance controls without duplicate name or email links', () => {
  const header = renderHomePage().match(/<header class="portfolio-header"[\s\S]*?<\/header>/)[0];
  assert.doesNotMatch(header, /wordmark|header-email|Email me/);
  assert.match(header, /id="primary-navigation"/);
  assert.match(header, /data-theme-trigger/);
});
