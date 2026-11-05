import { readFileSync } from 'node:fs';
import { contacts } from '../js/projects.js';
import { escapeHtml as e } from './render-utils.mjs';

// Titles and issuers checked against the public credentials supplied by Jayrald.
const credentials = [
  { title: 'AI Engineer for Developers Associate', issuer: 'DataCamp', icon: 'datacamp', type: 'Certification', href: 'https://www.datacamp.com/certificate/AIEDA0013075999766' },
  { title: 'Flutter and Dart: Developing iOS, Android, and Mobile Apps', issuer: 'IBM', icon: 'ibm', type: 'Course certificate · Coursera', href: 'https://www.coursera.org/account/accomplishments/verify/CCLGM0NVP0SH' },
  { title: 'AWS Cloud Practitioner (CLF-C02)', issuer: 'DataCamp', icon: 'datacamp', type: 'Track completion', href: 'https://www.datacamp.com/completed/statement-of-accomplishment/track/405cc4a312c44e1d0fa3a58104f691469a28789f' },
  { title: 'Learn C', issuer: 'Codecademy', icon: 'codecademy', type: 'Course certificate', href: 'https://www.codecademy.com/profiles/jayraldTajanlangit1327992833/certificates/8c3029c4a6e5894e74da756e3a7c0ae3' },
  { title: 'Stay Ahead of the AI Curve', issuer: 'Google', icon: 'google', type: 'Course certificate · Coursera', href: 'https://www.coursera.org/account/accomplishments/verify/NBB2KP6UJXND' },
  { title: 'Maximize Productivity With AI Tools', issuer: 'Google', icon: 'google', type: 'Course certificate · Coursera', href: 'https://www.coursera.org/account/accomplishments/verify/RCSKCAZUV16E' },
  { title: 'Discover the Art of Prompting', issuer: 'Google', icon: 'google', type: 'Course certificate · Coursera', href: 'https://www.coursera.org/account/accomplishments/verify/URASZIXWWRPL' },
  { title: 'Use AI Responsibly', issuer: 'Google', icon: 'google', type: 'Course certificate · Coursera', href: 'https://www.coursera.org/account/accomplishments/verify/IRXT51SDPX1R' },
];

function issuerIcon(name) {
  if (name === 'ibm') return '<img class="credential-icon" src="assets/icons/issuers/ibm.png" alt="" width="32" height="32" loading="lazy">';
  return readFileSync(new URL(`../assets/icons/issuers/${name}.svg`, import.meta.url), 'utf8')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/<svg\b[^>]*viewBox="([^"]+)"[^>]*>/, '<svg class="credential-icon" viewBox="$1" fill="currentColor" aria-hidden="true" focusable="false">');
}

export function renderCertifications() {
  return `<section class="certifications-section shell" id="certifications" aria-labelledby="certifications-title">
    <header class="section-heading"><h2 id="certifications-title">Certifications</h2><p>Learning beyond the projects.</p></header>
    <ul class="credential-list">${credentials.map(credential => `<li><a class="credential-link" href="${e(credential.href)}" target="_blank" rel="noopener noreferrer" aria-label="Verify ${e(credential.title)} from ${e(credential.issuer)} (opens in a new tab)">
      ${issuerIcon(credential.icon)}<div class="credential-details"><h3>${e(credential.title)}</h3><p class="credential-issuer">${e(credential.issuer)}</p><p class="credential-type">${e(credential.type)}</p></div><span class="credential-arrow" aria-hidden="true">↗</span>
    </a></li>`).join('')}</ul>
    <a class="certifications-linkedin" href="${contacts.linkedin}" target="_blank" rel="noopener noreferrer">More on LinkedIn <span aria-hidden="true">↗</span></a>
  </section>`;
}
