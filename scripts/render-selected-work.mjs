import { projects } from '../js/projects.js';
import { escapeHtml as e, renderPhoneFrame } from './render-utils.mjs';

const showcaseOrder = ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige'];

const notes = {
  skyfire: {
    steps: ['Search flights', 'Choose seats', 'Confirm booking'],
    summary: 'Find flights, choose seats, and manage reservations.',
    contribution: 'Built the Angular frontend, Django API, and reservation flow with backend seat validation.',
  },
  maistra: {
    steps: ['Extract code', 'Review code', 'Run & grade'],
    summary: 'A web and mobile teaching system that extracts handwritten code with OCR for teacher review and grading.',
    contribution: 'Built the web submission review and grading interface, Judge0 integration, and Supabase persistence.',
  },
  'bulk-buying-companion': {
    steps: ['Browse deals', 'Inspect a deal', 'Reserve a share'],
    summary: 'Find nearby group buys, split quantities, and coordinate pickup.',
    contribution: 'Built authentication, nearby discovery, Split Board search, realtime updates, and pickup tools with the team.',
  },
  pulso: {
    steps: ['Sign in', 'Share a post', 'Edit profile'],
    summary: 'Sign in, share image posts, and personalize your profile.',
    contribution: 'Built the Flutter and Riverpod foundation, authentication, feed, profiles, saved posts, and realtime features.',
  },
  sige: {
    steps: ['Review tasks', 'Open task', 'Mark complete'],
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
    <figure class="selected-project-media${mobile ? ' selected-project-media--mobile' : ''}"><div class="selected-project-preview">${mobile ? renderPhoneFrame(player, project.media.aspect) : player}</div><figcaption class="selected-project-caption"><span>${slug === 'sige' ? 'Mobile UI prototype' : e(project.platform)}</span><button class="preview-toggle" data-preview-toggle type="button" hidden>Play preview</button></figcaption></figure>
    <div class="selected-project-copy">
      <header class="selected-project-heading"><h3 class="selected-project-title" id="selected-${slug}-title"><a href="${e(href)}">${e(title)}</a></h3><a class="selected-project-case-study" href="${e(href)}" aria-label="View ${e(title)} project">View project <span aria-hidden="true">↗</span></a></header>
      <p class="selected-project-role">${e(project.role)}</p>
      <p class="selected-project-summary">${e(notes[slug].summary)}</p>
      <p class="selected-project-contribution"><strong>My work:</strong> ${e(notes[slug].contribution)}</p>
      <ul class="selected-project-stack" aria-label="${e(title)} technologies">${project.technologies.map(technology => `<li class="selected-project-chip">${e(technology)}</li>`).join('')}</ul>
${slug === 'sige' ? '<p class="selected-project-disclosure">Tasks and Insights are UI prototypes.</p>' : ''}
    </div>
  </article>`;
}

export function renderSelectedWork(pathPrefix = '') {
  const [featured, wide, ...mobile] = showcaseOrder;
  return `<div class="selected-work">${projectArticle(featured, pathPrefix, 'featured')}${projectArticle(wide, pathPrefix, 'wide')}<div class="selected-projects-mobile">${mobile.map(slug => projectArticle(slug, pathPrefix)).join('')}</div></div>`;
}
