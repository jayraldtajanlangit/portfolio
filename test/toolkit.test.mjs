import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToolkit } from '../scripts/render-toolkit.mjs';

test('tech stack has a heading and four ordered categories without introductory copy', () => {
  const html = renderToolkit();
  assert.match(html, /<h2[^>]*>Tech stack<\/h2>/);
  assert.doesNotMatch(html, /The languages and frameworks I build with/);
  const categories = [...html.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match => match[1]);
  assert.deepEqual(categories, ['Languages', 'Frameworks', 'Tools', 'AI tools']);
  assert.equal([...html.matchAll(/class="tech-logo-link"/g)].length, 16);
  for (const name of ['TypeScript', 'Dart', 'Python', 'Angular', 'Django REST Framework', 'Flutter', 'FastAPI']) {
    assert.ok(html.includes(`aria-label="${name}: view my work on `));
  }
});

test('confirmed tools have named links to official sites and retain safe new-tab behavior', () => {
  const html = renderToolkit();
  for (const name of ['VS Code', 'Android Studio', 'Git', 'GitHub', 'GitKraken', 'Postman', 'Codex', 'ChatGPT', 'Claude']) {
    assert.ok(html.includes(`aria-label="${name}: official website (opens in a new tab)"`));
  }
  assert.equal([...html.matchAll(/target="_blank" rel="noopener noreferrer"/g)].length, 9);
  assert.doesNotMatch(html, /(?:href|src)="(?:undefined|null)/);
});

test('every technology has a self-contained icon without external mask requests', () => {
  const html = renderToolkit();
  const icons = [...html.matchAll(/<svg\b[^>]*class="tech-logo tech-logo--[^"]+"[^>]*>[\s\S]*?<\/svg>/g)].map(match => match[0]);
  assert.equal(icons.length, 16, 'all technology links must contain visible SVG geometry');
  for (const icon of icons) {
    assert.match(icon, /viewBox="[^"]+"/);
    assert.match(icon, /<path\b/);
    assert.match(icon, /aria-hidden="true"/);
    assert.match(icon, /currentColor/);
    assert.doesNotMatch(icon, /<(?:image|use)\b|(?:href|src)=|url\(/);
    assert.doesNotMatch(icon, /(?:fill|stroke)="#/);
  }
});
