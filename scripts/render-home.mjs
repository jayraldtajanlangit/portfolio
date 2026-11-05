import { contacts, site } from '../js/projects.js';
import { escapeHtml as e, renderThemeControl, renderPageMetadata } from './render-utils.mjs';
import { renderSelectedWork } from './render-selected-work.mjs';
import { renderToolkit } from './render-toolkit.mjs';
import { renderHeroComposition } from './render-hero-composition.mjs';
import { renderCertifications } from './render-certifications.mjs';

export function renderHomePage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="js/theme.js?v=20261105-reveal"></script>
  <title>${e(site.name)} | Web &amp; mobile developer</title>
  <meta name="description" content="Jayrald Tajanlangit is a Computer Science student in the Philippines building web and mobile applications. Explore his projects, contributions, and tech stack.">
  <meta property="og:title" content="${e(site.name)} | Web &amp; mobile developer">
  <meta property="og:description" content="Web and mobile projects, from flight booking to tools for learning and community.">
  <meta property="og:type" content="website">
  ${renderPageMetadata()}
  <meta name="theme-color" content="#f3f2ef">
  <link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="assets/fonts/bodoni-moda-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="assets/pp/jayrald-hero-cutout.png" as="image" fetchpriority="high">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/tokens.css?v=20261105-redesign">
  <link rel="stylesheet" href="css/global.css">
  <link rel="stylesheet" href="css/home.css?v=20261105-redesign">
  <link rel="stylesheet" href="css/hero.css?v=20261105-redesign">
  <link rel="stylesheet" href="css/selected-work.css?v=20261105-redesign">
  <link rel="stylesheet" href="css/theme.css?v=20261105-reveal">
  <link rel="stylesheet" href="css/motion.css">
</head>
<body class="home-page">
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="portfolio-header" id="top">
    <div class="shell header-layout">
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-navigation" hidden>Menu</button>
      <nav class="primary-nav" id="primary-navigation" aria-label="Primary"><a href="#about">About</a><a href="#work">Projects</a><a href="#tech-stack">Tech stack</a><a href="#certifications">Certifications</a><a href="#contact">Contact</a></nav>
      <div class="header-actions">${renderThemeControl()}</div>
    </div>
  </header>
  <main id="main">
    <section class="intro-section shell" aria-labelledby="hero-title">
      <div class="intro-layout">
        ${renderHeroComposition()}
        <div class="intro-copy">
          <div class="intro-description"><p class="intro-role typing-line"><span class="typing-static">AI Engineer</span><span class="typing-visual" aria-hidden="true"><span class="typing-slot"><span class="typing-measure">Mobile Developer|</span><span class="typing-text" data-typing-words='["AI Engineer","Mobile Developer","Web Developer"]'>AI Engineer</span></span></span><button class="typing-toggle" type="button" data-typing-toggle aria-label="Pause typing animation" aria-pressed="false" hidden><span aria-hidden="true">Ⅱ</span></button></p><p>I build web and mobile applications, from booking flows to tools for learning and community.</p></div>
          <div class="hero-aside">
            <div class="hero-context"><p>Computer Science student</p><p>USJ-R &middot; Philippines</p></div>
            <div class="intro-actions"><a class="resume-link" href="assets/documents/jayrald-tajanlangit-resume.pdf?v=20261103-education-summary" type="application/pdf">R&eacute;sum&eacute; <span class="resume-format">PDF</span></a></div>
          </div>
        </div>
      </div>
    </section>
    <section class="about-section shell" id="about" aria-labelledby="about-title">
      <div class="about-layout">
        <div class="about-profile"><h2 id="about-title">About me</h2><div class="education-detail"><h3>Computer Science</h3><p>${e(site.education.school)}<br>Philippines</p></div></div>
        <div class="about-copy"><p>I’m learning by turning real problems into working software.</p><p>I've worked independently on SkyFire and Sige, and with teammates on mAIstra, Bulk Buying Companion, and Pulso. That work has given me practice connecting interfaces, APIs, and databases.</p><h3>What’s next</h3><p>I'd like to contribute to development tasks, get feedback through code reviews, and learn how a team builds and maintains software.</p><div class="about-links"><a href="${contacts.github}">GitHub <span aria-hidden="true">↗</span></a><a href="${contacts.linkedin}">LinkedIn <span aria-hidden="true">↗</span></a><a href="assets/documents/jayrald-tajanlangit-resume.pdf?v=20261103-education-summary" download>Download résumé <span aria-hidden="true">↓</span></a></div></div>
      </div>
    </section>
    <section class="work-section shell" id="work" aria-labelledby="work-title">
      <header class="section-heading"><h2 id="work-title">Projects</h2><p>A selection of things I’ve built, on my own and with a team.</p></header>
      ${renderSelectedWork()}
    </section>
    ${renderToolkit()}
    ${renderCertifications()}
    <section class="contact-section" id="contact" aria-labelledby="contact-title">
      <div class="shell contact-layout" data-reveal-group>
        <div class="contact-intro"><h2 id="contact-title">Let’s work together.</h2><p>Have a project in mind, or a role I could grow into? I’d like to hear from you.</p></div>
        <div class="contact-details">
          <a class="contact-email" href="mailto:${contacts.email}">${e(contacts.email).replace('@', '<wbr>@')}</a>
          <div class="contact-actions">
            <a class="button-link contact-compose" href="mailto:${contacts.email}">Email me <span aria-hidden="true">↗</span></a>
            <button class="contact-copy" type="button" data-email-copy data-email="${e(contacts.email)}" hidden><svg class="copy-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg><svg class="copied-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg><span data-copy-label>Copy email</span></button>
          </div>
          <p class="contact-copy-status" data-copy-status role="status" aria-live="polite" aria-atomic="true"></p>
          <div class="contact-socials"><a href="${contacts.github}">GitHub <span aria-hidden="true">↗</span></a><a href="${contacts.linkedin}">LinkedIn <span aria-hidden="true">↗</span></a></div>
        </div>
      </div>
    </section>
  </main>
  <footer class="portfolio-footer"><div class="shell"><p>© 2026 ${e(site.name)}</p><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div></footer>
  <script type="module" src="js/site.js"></script>
  <script type="module" src="js/motion.js"></script>
  <script type="module" src="js/walkthrough.js"></script>
  <script type="module" src="js/contact.js"></script>
</body>
</html>`;
}
