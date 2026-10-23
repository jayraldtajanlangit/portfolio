import { projects } from '../js/projects.js';
import { escapeHtml as e, renderPhoneFrame } from './render-utils.mjs';

const notes = {
  skyfire: {
    summary: 'Find flights, choose seats, and manage reservations.',
    contribution: 'Built the Angular frontend, Django API, and reservation flow with backend seat validation.',
  },
  maistra: {
    summary: 'A web and mobile teaching system that extracts handwritten code with OCR for teacher review and grading.',
    contribution: 'Built the web submission review and grading interface, Judge0 integration, and Supabase persistence.',
  },
  'bulk-buying-companion': {
    summary: 'Find nearby group buys, split quantities, and coordinate pickup.',
    contribution: 'Built authentication, nearby discovery, Split Board search, realtime updates, and pickup tools with the team.',
  },
  pulso: {
    summary: 'Sign in, share image posts, and personalize your profile.',
    contribution: 'Built the Flutter and Riverpod foundation, authentication, feed, profiles, saved posts, and realtime features.',
  },
  sige: {
    summary: 'An AI accountability coach for turning conversation into action.',
    contribution: 'Designed and built the Flutter coaching interface and chat service integration. Tasks and Insights are UI prototypes.',
  },
};

function projectArticle(slug, prefix, layout = '') {
  const project = projects.find(project => project.slug === slug);
  const title = project.title.split(' — ')[0];
  const href = `${prefix}projects/${slug}.html`;
  const mobile = project.media.orientation === 'portrait';
  const player = `<video autoplay muted loop playsinline preload="metadata" poster="${e(prefix + project.media.poster)}" width="${project.media.width}" height="${project.media.height}" aria-label="${e(title)}${slug === 'sige' ? ' Tasks UI prototype' : ''} guided project walkthrough"><source src="${e(prefix + `assets/videos/${slug}-polished.mp4`)}" type="video/mp4"><source src="${e(prefix + project.media.video)}" type="video/webm">Your browser cannot play this walkthrough. <a href="${e(prefix + `assets/videos/${slug}-polished.mp4`)}">Open the video</a> or <a href="${e(href)}">view the case study</a>.</video>`;
  return `<article class="selected-project selected-project--${slug}${layout ? ` selected-project--${layout}` : ''}" id="project-${slug}" aria-labelledby="selected-${slug}-title" data-walkthrough-preview>
    <figure class="selected-project-media${mobile ? ' selected-project-media--mobile' : ''}">${mobile ? renderPhoneFrame(player, project.media.aspect) : player}</figure>
    <div class="selected-project-copy">
      <h3 class="selected-project-title" id="selected-${slug}-title"><a href="${e(href)}">${e(title)}</a></h3>
      <div class="selected-project-overview"><p class="selected-project-summary">${e(notes[slug].summary)}</p>
        ${slug === 'sige' ? '<p class="selected-project-disclosure">Walkthrough: Tasks UI prototype</p>' : ''}</div>
      <p class="selected-project-contribution"><strong>My contribution</strong>${e(notes[slug].contribution)}</p>
      <div class="selected-project-meta"><p class="selected-project-role">${e(project.role)}</p><p class="selected-project-stack">${project.technologies.map(e).join(' · ')}</p></div>
      <div class="selected-project-links"><a href="${e(href)}">View case study <span aria-hidden="true">↗</span></a></div>
    </div>
  </article>`;
}

export function renderSelectedWork(pathPrefix = '') {
  return `<div class="selected-work">${projectArticle('skyfire', pathPrefix, 'featured')}${projectArticle('maistra', pathPrefix, 'wide')}<div class="selected-projects-mobile">${['bulk-buying-companion', 'pulso', 'sige'].map(slug => projectArticle(slug, pathPrefix)).join('')}</div></div>`;
}
