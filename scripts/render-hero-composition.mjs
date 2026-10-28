import { projects } from '../js/projects.js';
import { escapeHtml as e, renderPhoneFrame } from './render-utils.mjs';

export function renderHeroComposition() {
  const web = projects.find(project => project.slug === 'skyfire');
  const mobile = projects.find(project => project.slug === 'bulk-buying-companion');
  const image = project => `<img src="${e(project.media.poster)}" width="${project.media.width}" height="${project.media.height}" alt="${e(project.title)} application interface" decoding="async">`;
  return `<figure class="hero-composition" aria-label="A selection of my web and mobile work">
    <div class="hero-stage">
      <a class="hero-preview hero-preview--web" href="projects/${web.slug}.html" aria-label="Explore the SkyFire case study">
        <div class="hero-browser-bar" aria-hidden="true"><span class="hero-browser-dots"><i></i><i></i><i></i></span><span>SkyFire / Web</span><span>↗</span></div>
        ${image(web)}
      </a>
      <a class="hero-preview hero-preview--mobile" href="projects/${mobile.slug}.html" aria-label="Explore the Bulk Buying Companion case study">
        ${renderPhoneFrame(image(mobile), mobile.media.aspect)}
        <span class="hero-mobile-label" aria-hidden="true">Mobile ↗</span>
      </a>
    </div>
    <ol class="hero-build-trail" aria-hidden="true">${['Source', 'Build', 'Test', 'Deploy'].map(stage => `<li>${stage}</li>`).join('')}</ol>
    <figcaption class="hero-composition-caption"><span>Selected builds</span><span>Web + Mobile</span></figcaption>
  </figure>`;
}
