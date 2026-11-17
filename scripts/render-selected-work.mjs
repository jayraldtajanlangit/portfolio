import { projects } from '../js/projects.js';
import { escapeHtml as e, renderPhoneFrame } from './render-utils.mjs';
import { homeClips } from './render-home-previews.mjs';

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
    // The homepage leads with six: the parts Jayrald built, then the OCR and mobile app. The rest fold into "+3 more".
    featured: ['Angular 21', 'TypeScript', 'Supabase', 'Judge0', 'PaddleOCR', 'Flutter'],
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

// At most six chips; any more fold into one "+N more" chip that still names them for screen readers.
function renderChips(project, featured = project.technologies) {
  const shown = featured.slice(0, 6);
  const rest = project.technologies.filter(technology => !shown.includes(technology));
  const more = rest.length ? `<li class="selected-project-chip selected-project-chip--more" title="${e(rest.join(', '))}"><span aria-hidden="true">+${rest.length} more</span><span class="visually-hidden">${e(rest.join(', '))}</span></li>` : '';
  return shown.map(technology => `<li class="selected-project-chip">${e(technology)}</li>`).join('') + more;
}

// Two more of the app's screens, fanned behind the playing phone. Decorative: the case study has them as captioned stills.
function renderFan(project, prefix) {
  const phones = project.media.stills.slice(1, 3).map(still => `<div class="selected-project-fan-phone">${renderPhoneFrame(`<img src="${e(prefix + still.src)}" alt="" width="${project.media.width}" height="${project.media.height}" loading="lazy" decoding="async">`, project.media.aspect)}</div>`);
  return `<div class="selected-project-fan" aria-hidden="true">${phones.join('')}</div>`;
}

function projectArticle(slug, prefix) {
  const project = projects.find(project => project.slug === slug);
  const title = project.title.split(' — ')[0];
  const href = `${prefix}projects/${slug}.html`;
  const mobile = project.media.orientation === 'portrait';
  // A homepage cut (render-home-previews.mjs) starts the loop past a form; the fallback link still opens the full walkthrough.
  const homeClip = slug in homeClips ? `${slug}-home` : null;
  const poster = homeClip ? `assets/images/projects/${slug}/poster-home.webp` : project.media.poster;
  const sources = homeClip ? [`assets/videos/${homeClip}.mp4`, `assets/videos/${homeClip}.webm`] : [`assets/videos/${slug}-polished.mp4`, project.media.video];
  const player = `<video autoplay muted loop playsinline preload="metadata" poster="${e(prefix + poster)}" width="${project.media.width}" height="${project.media.height}" aria-label="${e(title)}${slug === 'sige' ? ' Tasks UI prototype' : ''} guided project walkthrough"><source src="${e(prefix + sources[0])}" type="video/mp4"><source src="${e(prefix + sources[1])}" type="video/webm">Your browser cannot play this walkthrough. <a href="${e(prefix + `assets/videos/${slug}-polished.mp4`)}">Open the video</a> or <a href="${e(href)}">view the case study</a>.</video>`;
  return `<article class="selected-project selected-project--${slug}" id="project-${slug}" aria-labelledby="selected-${slug}-title" data-project-tone="${slug}" data-walkthrough-preview>
    <span class="selected-project-ghost" aria-hidden="true">${e(title)}</span>
    <figure class="selected-project-media${mobile ? ' selected-project-media--mobile' : ''}"><div class="selected-project-preview" data-tilt data-cursor="View"${mobile ? '' : ` style="--media-aspect: ${e(project.media.aspect)}"`}>${mobile ? renderFan(project, prefix) + renderPhoneFrame(player, project.media.aspect) : player}<a class="selected-project-preview-link" href="${e(href)}" tabindex="-1" aria-hidden="true"></a></div><figcaption class="selected-project-caption"><span>${slug === 'sige' ? 'Mobile UI prototype' : e(project.platform)}</span></figcaption></figure>
    <div class="selected-project-copy">
      <header class="selected-project-heading"><h3 class="selected-project-title" id="selected-${slug}-title"><a href="${e(href)}" data-cursor="View">${e(title)}</a></h3><a class="selected-project-case-study" href="${e(href)}" data-cursor="View" aria-label="View ${e(title)} project">View project <span aria-hidden="true">↗</span></a></header>
      <p class="selected-project-role">${e(project.role)}</p>
      <p class="selected-project-summary">${e(notes[slug].summary)}</p>
      <p class="selected-project-contribution"><strong>My work:</strong> ${e(notes[slug].contribution)}</p>
      <ul class="selected-project-stack" aria-label="${e(title)} technologies">${renderChips(project, notes[slug].featured)}</ul>
    </div>
  </article>`;
}

export function renderSelectedWork(pathPrefix = '') {
  return `<div class="selected-work">${showcaseOrder.map(slug => projectArticle(slug, pathPrefix)).join('')}</div>`;
}
