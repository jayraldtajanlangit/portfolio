export function initTypingLoop(root = document, options = {}) {
  const target = root.querySelectorAll?.('[data-typing-words]')?.[0];
  if (!target) return () => {};
  const doc = root.ownerDocument ?? root;
  const view = doc.defaultView ?? globalThis;
  let words;
  try { words = JSON.parse(target.dataset.typingWords).filter(word => typeof word === 'string' && word.trim()); } catch { return () => {}; }
  if (!words.length || !view.setTimeout) return () => {};
  const reduced = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  const button = root.querySelector?.('[data-typing-toggle]');
  const classes = doc.documentElement?.classList;
  const hold = options.holdDelay ?? 2000;
  const type = options.typeDelay ?? 65;
  const erase = options.eraseDelay ?? 32;
  const gap = options.gapDelay ?? 180;
  let index = 0, length = Array.from(words[0]).length, deleting = true;
  let timer, paused = false, stopped = false;

  const clear = () => { if (timer !== undefined) view.clearTimeout(timer); timer = undefined; };
  const schedule = delay => {
    clear();
    if (!stopped && !paused && !reduced?.matches && !doc.hidden) timer = view.setTimeout(tick, delay);
  };
  function tick() {
    const letters = Array.from(words[index]);
    length += deleting ? -1 : 1;
    target.textContent = letters.slice(0, Math.max(0, length)).join('');
    if (deleting && length <= 0) {
      index = (index + 1) % words.length;
      length = 0;
      deleting = false;
      schedule(gap);
    } else if (!deleting && length >= letters.length) {
      deleting = true;
      schedule(hold);
    } else schedule(deleting ? erase : type);
  }
  const sync = () => {
    clear();
    if (stopped || reduced?.matches) {
      classes?.remove('typing-enhanced');
      classes?.remove('typing-paused');
      target.textContent = words[0];
      index = 0;
      length = Array.from(words[0]).length;
      deleting = true;
      if (button) button.hidden = true;
      return;
    }
    classes?.add('typing-enhanced');
    classes?.[paused ? 'add' : 'remove']('typing-paused');
    if (button) {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? 'Resume typing animation' : 'Pause typing animation');
      button.setAttribute('title', paused ? 'Resume typing animation' : 'Pause typing animation');
    }
    schedule(hold);
  };
  const toggle = () => { paused = !paused; sync(); };
  const onVisibility = () => { if (doc.hidden) clear(); else schedule(gap); };
  button?.addEventListener('click', toggle);
  doc.addEventListener?.('visibilitychange', onVisibility);
  reduced?.addEventListener?.('change', sync);
  sync();
  return () => {
    stopped = true;
    sync();
    button?.removeEventListener('click', toggle);
    doc.removeEventListener?.('visibilitychange', onVisibility);
    reduced?.removeEventListener?.('change', sync);
  };
}

export function initPortfolioMotion(root = document, options = {}) {
  const doc = root.ownerDocument ?? root;
  const view = doc.defaultView ?? globalThis;
  if (!view.IntersectionObserver) return () => {};
  const reduced = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  const animations = new Set(), seen = new WeakSet();
  const entranceSelector = '.portfolio-header, .intro-copy h1, .intro-role, .intro-copy > .intro-description, .hero-composition';
  const entranceOrder = new Map(options.entrance
    ? [...(root.querySelectorAll?.(entranceSelector) ?? [])].map((element, index) => [element, index])
    : []);
  const selector = [
    ...(options.entrance ? ['.portfolio-header'] : []),
    '.intro-copy h1', '.intro-role', '.intro-copy > .intro-description', '.hero-composition', '.actions',
    '.portrait img', '.intro-portrait img', '.section-heading > *', '.section-intro > *',
    '.selected-project-media', '.selected-project-copy',
    '.work-copy > h3', '.work-copy > p', '.work-copy > .work-links', '.work-visual img',
    '.featured-image img', '.project-caption > *', '.secondary-image img',
    '.project-caption-small > h3', '.project-caption-small > p', '.project-caption-small > a',
    '.additional-work > h2', '.additional-project', '.tech-stack-group', '.about-profile',
    '.about > div:first-child', '.about-copy > *', '.contact-intro > *', '.contact-details > *', '.footer',
    '.portfolio-footer .shell', '.case-title-block h1', '.case-deck', '.case-dossier > div',
    '.case-lead-media', '.case-section-heading', '.case-prose > *', '.system-flow li',
    '.workflow-copy', '.workflow-media', '.next-project strong',
  ].join(',');
  let observer;
  const revealElement = (element, order = 0) => {
    if (seen.has(element)) return;
    seen.add(element);
    observer?.unobserve(element);
    if (typeof element.animate !== 'function') return;
    const picture = element.tagName === 'IMG';
    const projectPreview = element.matches?.('.selected-project-media');
    const projectCopy = element.matches?.('.selected-project-copy');
    const project = projectPreview || projectCopy;
    const group = element.closest?.('.selected-projects-mobile');
    const column = group ? [...group.children].indexOf(element.closest('.selected-project')) : -1;
    const entrance = entranceOrder.has(element);
    const header = entrance && element.matches?.('.portfolio-header');
    const delay = entrance ? entranceOrder.get(element) * 100
      : project ? Math.max(column, 0) * 90 + (projectCopy ? 140 : 0) : Math.min(order, 3) * 70;
    const animation = element.animate(
      picture ? [{ opacity: .45, transform: 'scale(1.035)' }, { opacity: 1, transform: 'scale(1)' }]
        : [{ opacity: 0, transform: `translateY(${header ? -10 : projectPreview ? 18 : projectCopy ? 12 : 20}px)` }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: entrance ? 700 : picture ? 900 : projectPreview ? 680 : projectCopy ? 560 : 680, delay, fill: 'backwards', easing: 'cubic-bezier(.16,1,.3,1)' },
    );
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
  };
  const cancel = () => {
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    doc.documentElement?.classList.remove('portfolio-motion');
  };
  const start = () => {
    cancel();
    if (reduced?.matches) return;
    doc.documentElement?.classList.add('portfolio-motion');
    observer = new view.IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        revealElement(entry.target, order++);
      }
    }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
    // Apply the hero's initial frames synchronously while the opaque splash is
    // still covering them. Waiting for IntersectionObserver would flash the
    // finished homepage before fading it back to zero.
    entranceOrder.forEach((_, element) => revealElement(element));
    root.querySelectorAll?.(selector).forEach(element => { if (!seen.has(element)) observer.observe(element); });
  };
  reduced?.addEventListener?.('change', start);
  start();
  return () => { cancel(); reduced?.removeEventListener?.('change', start); };
}

export function initPageMotion(root = document) {
  const splash = root.querySelector?.('[data-startup]');
  const waiting = Boolean(splash?.open);
  let started = false, stopTyping, stopMotion;
  const start = () => {
    if (started) return;
    started = true;
    splash?.removeEventListener('close', start);
    splash?.removeEventListener('startup:reveal', start);
    stopTyping = initTypingLoop(root);
    stopMotion = initPortfolioMotion(root, { entrance: waiting });
  };
  // Begin before the overlay exits; native close is a fallback for Skip/Escape
  // and older cached startup controllers. Start only once across both events.
  if (waiting) {
    splash.addEventListener('startup:reveal', start, { once: true });
    splash.addEventListener('close', start, { once: true });
  }
  else start();
  return () => {
    started = true;
    splash?.removeEventListener('close', start);
    splash?.removeEventListener('startup:reveal', start);
    stopTyping?.();
    stopMotion?.();
  };
}

if (typeof document !== 'undefined') initPageMotion(document);
