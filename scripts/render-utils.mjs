const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const booleanAttributes = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'hidden',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected',
]);

const attributeNamePattern = /^[A-Za-z][A-Za-z0-9:._-]*$/;

export function renderPhoneFrame(content, aspect = '390 / 844') {
  return `<div class="phone-frame" style="--phone-screen-aspect: ${escapeHtml(aspect)}"><span class="phone-frame-buttons" aria-hidden="true"></span><div class="phone-frame-screen">${content}</div></div>`;
}

export function renderThemeControl() {
  const icons = {
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    dark: '<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>',
  };
  return `<div class="theme-control" hidden><button class="theme-trigger" data-theme-trigger type="button" role="switch" aria-label="Dark mode" aria-checked="false" title="Switch to dark mode"><span class="theme-track" aria-hidden="true"><span class="theme-thumb"></span>${Object.keys(icons).map(mode => `<svg data-theme-icon="${mode}" viewBox="0 0 24 24">${icons[mode]}</svg>`).join('')}</span></button></div>`;
}

export function renderTypingLine() {
  const words = ['web development', 'mobile development', 'artificial intelligence'];
  return `<p class="intro-role typing-line"><span class="typing-static">I’m interested in web development, mobile development, and artificial intelligence.</span><span class="typing-visual" aria-hidden="true">I’m interested in <span class="typing-slot"><span class="typing-measure">artificial intelligence|</span><span class="typing-text" data-typing-words="${escapeHtml(JSON.stringify(words))}">${words[0]}</span></span></span></p>`;
}

export function renderPageMetadata({ pathPrefix = '', siteUrl = process.env.SITE_URL ?? '' } = {}) {
  const imagePath = 'assets/images/social-preview.png';
  const image = siteUrl
    ? new URL(imagePath, siteUrl.replace(/\/+$/, '') + '/').href
    : pathPrefix + imagePath;
  const alt = 'Jayrald Tajanlangit — Computer Science student building web and mobile applications.';
  return `<link rel="icon" href="${escapeHtml(pathPrefix)}assets/favicon.svg" type="image/svg+xml">
  <meta property="og:site_name" content="Jayrald Tajanlangit">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(alt)}">`;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => htmlEntities[character]);
}

export function renderAttrs(attributes) {
  const rendered = [];

  for (const [name, value] of Object.entries(attributes)) {
    if (!attributeNamePattern.test(name)) {
      throw new TypeError(`Invalid attribute name: ${name}`);
    }

    if (value === null || value === undefined) {
      continue;
    }

    if (booleanAttributes.has(name.toLowerCase())) {
      if (value === false) {
        continue;
      }

      if (value !== true) {
        throw new TypeError(`Boolean attribute ${name} must be true or false`);
      }

      rendered.push(` ${name}`);
      continue;
    }

    rendered.push(` ${name}="${escapeHtml(value)}"`);
  }

  return rendered.join('');
}
