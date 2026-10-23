import { contacts, site } from '../js/projects.js';
import { escapeHtml as e, renderThemeControl, renderTypingLine, renderPageMetadata } from './render-utils.mjs';
import { renderSelectedWork } from './render-selected-work.mjs';
import { renderToolkit } from './render-toolkit.mjs';

export function renderHomePage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="js/theme.js"></script>
  <title>${e(site.name)} | Student developer portfolio</title>
  <meta name="description" content="Jayrald Tajanlangit is a Computer Science student in the Philippines interested in artificial intelligence and web and mobile applications. Explore his projects, contributions, and tech stack.">
  <meta property="og:title" content="${e(site.name)} | Student developer portfolio">
  <meta property="og:description" content="A Computer Science student portfolio featuring web and mobile projects, individual contributions, and interests in artificial intelligence.">
  <meta property="og:type" content="website">
  ${renderPageMetadata()}
  <meta name="theme-color" content="#f8f8f4">
  <link rel="preload" href="assets/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="assets/fonts/bodoni-moda-variable.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/global.css">
  <link rel="stylesheet" href="css/home.css">
  <link rel="stylesheet" href="css/selected-work.css">
  <link rel="stylesheet" href="css/theme.css">
  <link rel="stylesheet" href="css/motion.css">
</head>
<body class="home-page">
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="portfolio-header" id="top">
    <div class="shell header-layout">
      <a class="wordmark" href="#top" aria-label="Jayrald Tajanlangit, home">Jayrald T.</a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-navigation" hidden>Menu</button>
      <nav class="primary-nav" id="primary-navigation" aria-label="Primary"><a href="#work">Projects</a><a href="#tech-stack">Tech stack</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
      <div class="header-actions"><a class="header-email" href="mailto:${contacts.email}"><span>Email me</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a>
      ${renderThemeControl()}</div>
    </div>
  </header>
  <main id="main">
    <section class="intro-section shell" aria-labelledby="hero-title">
      <div class="intro-layout">
        <div class="intro-copy"><h1 id="hero-title">Jayrald<br>Tajanlangit</h1>${renderTypingLine()}</div>
        <div class="intro-description"><p>I build web and mobile applications, from booking flows to tools for learning and community.</p><p>${e(site.education.program)} student at the ${e(site.education.school)} in the Philippines.</p><div class="intro-actions"><a class="button-link" href="#work">View projects</a><a href="assets/documents/jayrald-tajanlangit-resume.pdf" type="application/pdf">Résumé <span class="resume-format">PDF</span></a></div></div>
      </div>
    </section>
    <section class="work-section shell" id="work" aria-labelledby="work-title">
      <header class="section-heading"><h2 id="work-title">Projects</h2><p>Web and mobile projects, from flight bookings to handwritten code.</p></header>
      ${renderSelectedWork()}
    </section>
    ${renderToolkit()}
    <section class="about-section" id="about" aria-labelledby="about-title">
      <div class="shell about-layout">
        <div class="about-profile"><h2 id="about-title">A little about me</h2><figure class="intro-portrait"><img src="assets/pp/583917390_25203520672616248_2951040891851883210_n.jpg" alt="Portrait of Jayrald Tajanlangit" width="864" height="852" loading="lazy"><figcaption>Jayrald Tajanlangit · Philippines</figcaption></figure><div class="education-detail"><h3>Education</h3><p>${e(site.education.program)}<br>${e(site.education.school)}</p></div></div>
        <div class="about-copy"><p>I'm a student learning by building applications for the web and mobile.</p><p>I've worked independently on SkyFire and Sige, and with teammates on mAIstra, Bulk Buying Companion, and Pulso. That work has given me practice connecting interfaces, APIs, and databases.</p><h3>What I want to learn</h3><p>I'd like to contribute to development tasks, get feedback through code reviews, and learn how a team builds and maintains software.</p><div class="about-links"><a href="${contacts.github}">GitHub</a><a href="${contacts.linkedin}">LinkedIn</a><a href="assets/documents/jayrald-tajanlangit-resume.pdf" download>Download résumé</a></div></div>
      </div>
    </section>
    <section class="contact-section" id="contact" aria-labelledby="contact-title">
      <div class="shell contact-layout" data-reveal-group>
        <div class="contact-intro"><h2 id="contact-title">Let’s talk.</h2><p>Have a project or a question about my work? I’d be glad to hear from you.</p><p class="contact-location">Based in the Philippines.</p></div>
        <div class="contact-details">
          <a class="contact-email" href="mailto:${contacts.email}">${e(contacts.email).replace('@', '<wbr>@')}</a>
          <div class="contact-actions">
            <a class="button-link contact-compose" href="mailto:${contacts.email}">Email me <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a>
            <button class="contact-copy" type="button" data-email-copy data-email="${e(contacts.email)}" hidden><svg class="copy-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg><svg class="copied-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg><span data-copy-label>Copy email</span></button>
          </div>
          <p class="contact-copy-status" data-copy-status role="status" aria-live="polite" aria-atomic="true"></p>
          <div class="contact-socials"><a href="${contacts.github}">GitHub <span aria-hidden="true">↗</span></a><a href="${contacts.linkedin}">LinkedIn <span aria-hidden="true">↗</span></a></div>
        </div>
      </div>
    </section>
  </main>
  <footer class="portfolio-footer"><div class="shell"><p>© 2026 ${e(site.name)}</p><a href="#top">Back to top ↑</a></div></footer>
  <script type="module" src="js/site.js"></script>
  <script type="module" src="js/motion.js"></script>
  <script type="module" src="js/walkthrough.js"></script>
  <script type="module" src="js/contact.js"></script>
</body>
</html>`;
}
