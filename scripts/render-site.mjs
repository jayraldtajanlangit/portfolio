import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { contacts, projects, site } from '../js/projects.js';
import { escapeHtml, renderAttrs, renderThemeControl, renderPageMetadata, renderTypingLine, renderPhoneFrame } from './render-utils.mjs';
import { renderHomePage } from './render-home.mjs';
import { renderSelectedWork } from './render-selected-work.mjs';
export { renderHomePage } from './render-home.mjs';

function renderProjectMedia(project, pathPrefix = '') {
  const mediaId = `media-${project.slug}`;
  const captionId = `${mediaId}-caption`;
  const [fallbackStill] = project.media.stills;
  const walkthrough = `${pathPrefix}assets/videos/${project.slug}-polished.mp4`;

  const player = `<video data-project-video controls muted loop playsinline preload="metadata"${renderAttrs({
                  poster: `${pathPrefix}${project.media.poster}`,
                  width: project.media.width,
                  height: project.media.height,
                  'aria-describedby': captionId,
                  'aria-label': `${project.title.split(' — ')[0]} project walkthrough`,
                })}>
                  <source${renderAttrs({ src: walkthrough, type: 'video/mp4' })}>
                  <source${renderAttrs({ src: `${pathPrefix}${project.media.video}`, type: 'video/webm' })}>
                  Your browser cannot play this walkthrough. <a href="${escapeHtml(walkthrough)}">Open the video</a>.
                </video>
                <img class="project-media-fallback" data-media-fallback${renderAttrs({
                  src: `${pathPrefix}${fallbackStill.src}`,
                  alt: fallbackStill.alt,
                  width: project.media.width,
                  height: project.media.height,
                  loading: 'lazy',
                  hidden: true,
                })}>`;
  return `<figure class="project-media project-media--${escapeHtml(project.media.orientation)}" data-project-media>
              <div class="project-media-stage"${renderAttrs({
                id: mediaId,
                style: `--media-aspect: ${project.media.aspect}`,
              })}>${project.media.orientation === 'portrait' ? renderPhoneFrame(player, project.media.aspect) : player}</div>
              <figcaption${renderAttrs({ id: captionId })}>${escapeHtml(project.media.caption.replaceAll(' — ', ': '))} <a class="walkthrough-video-link" href="${escapeHtml(walkthrough)}">Open walkthrough video</a></figcaption>
            </figure>`;
}

function renderSystemFlow(project) {
  return project.systemFlow
    .map(
      ([label, detail]) => `<li>
                <div>
                  <h3>${escapeHtml(label)}</h3>
                  <p>${escapeHtml(detail)}</p>
                </div>
              </li>`,
    )
    .join('\n');
}

function renderDecisionLedger(project) {
  return project.decisionLedger.filter(({ decision }) => !/repository/i.test(decision))
    .map(
      ({ decision, why, tradeoff }) => `<tr>
                  <th scope="row">${escapeHtml(decision)}</th>
                  <td data-label="Why">${escapeHtml(why)}</td>
                  <td data-label="Tradeoff">${escapeHtml(tradeoff)}</td>
                </tr>`,
    )
    .join('\n');
}

function renderWorkflow(project) {
  const workflowTitles = {
    maistra: ['Extract handwritten code', 'Review OCR output', 'Run and grade'],
    skyfire: ['Search flights', 'Choose a seat', 'Confirm booking'],
    'bulk-buying-companion': ['Browse Split Board', 'Inspect a deal', 'Reserve a share'],
    pulso: ['Sign in', 'Publish to the feed', 'Update your profile'],
    sige: ['Tasks prototype', 'Task detail', 'Completion state'],
  };
  return project.media.stills
    .map(
      (still, index) => {
        const step = project.workflow[index] ?? still.caption;
        const image = `<img${renderAttrs({
          src: `../${still.src}`,
          alt: still.alt,
          width: project.media.width,
          height: project.media.height,
          loading: 'lazy',
        })}>`;
        return `<li class="workflow-entry workflow-entry--${escapeHtml(project.media.orientation)}">
                <div class="workflow-copy">
                  <h3>${escapeHtml(workflowTitles[project.slug]?.[index] ?? step)}</h3>
                </div>
                <figure class="workflow-media" data-capture-state="available">
                  <div class="workflow-media-stage">
                    ${project.media.orientation === 'portrait' ? renderPhoneFrame(image, project.media.aspect) : image}
                  </div>
                  <figcaption>${escapeHtml(still.caption.replaceAll(' — ', ': '))}</figcaption>
                </figure>
              </li>`;
      },
    )
    .join('\n');
}

export function renderCaseStudy(project, nextProject) {
  if (!project || !nextProject) {
    throw new TypeError('renderCaseStudy requires a project and nextProject');
  }

  const title = `${project.title} | Case study | ${site.name}`;
  const nextProjectLabel = nextProject.title.replace(/ — .+$/, '');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="../js/theme.js"></script>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(project.summary)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(project.summary)}">
  <meta property="og:type" content="article">
  ${renderPageMetadata({ pathPrefix: '../' })}
  <meta name="theme-color" content="#f6f4ec">
  <link rel="preload" href="../assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="../assets/fonts/bodoni-moda-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="../css/fonts.css">
  <link rel="stylesheet" href="../css/tokens.css">
  <link rel="stylesheet" href="../css/global.css">
  <link rel="stylesheet" href="../css/case-study.css">
  <link rel="stylesheet" href="../css/theme.css">
  <link rel="stylesheet" href="../css/motion.css">
</head>
<body class="case-page case-page--${escapeHtml(project.slug)}">
  <a class="skip-link" href="#main">Skip to main content</a>

  <header class="site-header" id="top">
    <div class="shell site-header-inner">
      <a class="site-name" href="../index.html" aria-label="${escapeHtml(site.name)}, home">
        <span>${escapeHtml(site.name)}</span>
      </a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-navigation" hidden>Menu</button>
      <nav aria-label="Primary" id="primary-navigation" class="primary-nav">
        <a href="../index.html#work">Projects</a>
        <a href="../index.html#about">About</a>
        <a href="../index.html#contact">Contact</a>
        <a href="${escapeHtml(contacts.github)}">GitHub</a>
        <a href="${escapeHtml(contacts.linkedin)}">LinkedIn</a>
      </nav>
      ${renderThemeControl()}
    </div>
  </header>

  <main id="main">
    <article class="case-study">
      <header class="case-hero case-hero--${escapeHtml(project.media.orientation)} shell">
        <div class="case-title-block" data-intro-reveal="headline">
          <p class="section-kicker">Project / Case study</p>
          <h1>${escapeHtml(project.title.split(" — ")[0])}</h1>
          <p class="case-deck">${escapeHtml(project.summary)}</p>
          <p class="case-description">${escapeHtml(project.description)}</p>
        </div>
        <dl class="case-dossier" aria-label="Project dossier" data-intro-reveal="intro">
          <div><dt>Role</dt><dd>${escapeHtml(project.role)}</dd></div>
          <div><dt>Built with</dt><dd>${project.technologies.map(escapeHtml).join(' · ')}</dd></div>
        </dl>
        <div class="case-lead-media case-lead-media--${escapeHtml(project.media.orientation)}" style="--media-aspect: ${escapeHtml(project.media.aspect)}" data-intro-reveal="portrait">
          <h2 id="walkthrough-title">Project walkthrough</h2>
          ${renderProjectMedia(project, '../')}
        </div>
      </header>

      <section class="case-section case-section--problem case-section--reading shell" aria-labelledby="problem-title" data-reveal-group>
        <header class="case-section-heading">
          <h2 id="problem-title">Problem</h2>
        </header>
        <div class="case-prose">
          <p class="case-lede">${escapeHtml(project.challenge)}</p>
          <p>${escapeHtml(project.architecture)}</p>
        </div>
      </section>

      <section class="case-section case-section--reading shell" aria-labelledby="contribution-title" data-reveal-group>
        <header class="case-section-heading">
          <h2 id="contribution-title">My contribution</h2>
        </header>
        <div class="case-prose">
          <p class="case-lede">${escapeHtml(project.contribution)}</p>
          <p><strong>Ownership boundary.</strong> ${escapeHtml(project.ownership)}</p>
          <p>${escapeHtml(project.repositoryDisclosure)}</p>
        </div>
      </section>

      <section class="case-section case-section--system" aria-labelledby="system-title" data-reveal-group>
        <div class="shell">
          <header class="case-section-heading">
            <h2 id="system-title">How it works</h2>
          </header>
          <ol class="system-flow">
${renderSystemFlow(project)}
          </ol>
        </div>
      </section>

      <section class="case-section shell" aria-labelledby="decisions-title" data-reveal-group>
        <header class="case-section-heading">
          <h2 id="decisions-title">Engineering choices</h2>
        </header>
        <div class="decision-table-wrap">
          <table class="decision-ledger">
            <thead><tr><th>Decision</th><th>Why</th><th>Tradeoff</th></tr></thead>
            <tbody>
${renderDecisionLedger(project)}
            </tbody>
          </table>
        </div>
      </section>

      <section class="case-section case-section--workflow shell" aria-labelledby="workflow-title" data-reveal-group>
        <header class="case-section-heading">
          <h2 id="workflow-title">In use</h2>
        </header>
        <p class="capture-disclosure">${escapeHtml(project.media.disclosure)}</p>
        <ol class="workflow-list workflow-list--${escapeHtml(project.media.orientation)}">
${renderWorkflow(project)}
        </ol>
      </section>

      <section class="case-section case-section--outcome case-section--reading shell" aria-labelledby="outcome-title" data-reveal-group>
        <header class="case-section-heading">
          <h2 id="outcome-title">Outcome</h2>
        </header>
        <div class="case-prose">
          <p class="case-lede">${escapeHtml(project.outcome.result)}</p>
          <p><strong>Evidence.</strong> ${escapeHtml(project.outcome.evidence)}</p>
          <p><strong>Current limits.</strong> ${escapeHtml(project.outcome.limitation)}</p>
        </div>
      </section>

      <nav class="next-project" aria-label="Next case study">
        <a class="shell" href="${escapeHtml(nextProject.slug)}.html" aria-label="Next case study: ${escapeHtml(nextProject.title)}">
          <span>Next project</span>
          <strong>${escapeHtml(nextProjectLabel)}</strong>
          <span aria-hidden="true">→</span>
        </a>
      </nav>
    </article>
  </main>

  <footer class="site-footer">
    <div class="shell site-footer-inner">
      <p>© 2026 ${escapeHtml(site.name)}</p>
      <p>${escapeHtml(site.positioning)} · ${escapeHtml(site.location)}</p>
      <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
    </div>
  </footer>
  <script type="module" src="../js/site.js"></script>
  <script type="module" src="../js/motion.js"></script>
</body>
</html>
`;
}

const modulePath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';

if (modulePath === invokedPath) {
  await mkdir(new URL('../projects/', import.meta.url), { recursive: true });
  await writeFile(new URL('../index.html', import.meta.url), renderHomePage(), 'utf8');
  const previewPath = new URL('../.taste-skill/editorial-concept/index.html', import.meta.url);
  const preview = await readFile(previewPath, 'utf8').catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (preview) await writeFile(previewPath, preview
    .replace(/<!-- selected-work:start -->[\s\S]*?<!-- selected-work:end -->/, `<!-- selected-work:start -->\n${renderSelectedWork('../../')}\n<!-- selected-work:end -->`)
    .replace(/<p class="intro-role typing-line">[\s\S]*?<\/p>/, renderTypingLine()), 'utf8');
  await Promise.all(
    projects.map((project, index) => {
      const nextProject = projects[(index + 1) % projects.length];
      return writeFile(
        new URL(`../projects/${project.slug}.html`, import.meta.url),
        renderCaseStudy(project, nextProject),
        'utf8',
      );
    }),
  );
}
