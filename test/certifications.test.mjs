import assert from 'node:assert/strict';
import test from 'node:test';
import { renderHomePage } from '../scripts/render-home.mjs';
import { contacts } from '../js/projects.js';

test('certifications have their own section and a real LinkedIn destination', () => {
  const html = renderHomePage();
  const section = html.match(/<section[^>]*id="certifications"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.match(html, /href="#certifications"/);
  assert.match(section, /<h2[^>]*>Certifications<\/h2>/);
  assert.ok(section.includes(`href="${contacts.linkedin}"`));
  assert.match(section, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(section, /Coming soon|Placeholder|Credential ID|Certified Professional/);
  assert.ok(html.indexOf('id="certifications"') > html.indexOf('id="tech-stack"'));
  assert.ok(html.indexOf('id="certifications"') < html.indexOf('id="contact"'));
});

test('all supplied credentials have accurate titles, issuer icons and direct verification links', () => {
  const section = renderHomePage().match(/<section[^>]*id="certifications"[\s\S]*?<\/section>/)?.[0];
  const credentials = [
    ['AI Engineer for Developers Associate', 'AIEDA0013075999766'],
    ['Flutter and Dart: Developing iOS, Android, and Mobile Apps', 'CCLGM0NVP0SH'],
    ['AWS Cloud Practitioner (CLF-C02)', '405cc4a312c44e1d0fa3a58104f691469a28789f'],
    ['Learn C', '8c3029c4a6e5894e74da756e3a7c0ae3'],
    ['Stay Ahead of the AI Curve', 'NBB2KP6UJXND'],
    ['Maximize Productivity With AI Tools', 'RCSKCAZUV16E'],
    ['Discover the Art of Prompting', 'URASZIXWWRPL'],
    ['Use AI Responsibly', 'IRXT51SDPX1R'],
  ];
  for (const [title, id] of credentials) {
    assert.ok(section.includes(title), title);
    assert.ok(section.includes(id), id);
  }
  assert.equal((section.match(/class="credential-link"/g) || []).length, 8);
  assert.equal((section.match(/class="credential-icon"/g) || []).length, 8);
  assert.match(section, /DataCamp[\s\S]*Track completion/);
  assert.doesNotMatch(section, /AWS Certified/);
});
