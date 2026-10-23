import { initProjectMedia } from './media.js';
import { initWorkflowScrubber } from './workflow.js';

export function initNavigation(root = document) {
  const toggle = root.querySelector?.('[data-nav-toggle]');
  const menu = root.querySelector?.('#primary-navigation');
  const view = root.defaultView ?? root.ownerDocument?.defaultView ?? globalThis;
  const mobileQuery = view.matchMedia?.('(max-width: 47.99rem)') ?? {
    matches: true,
  };
  let stopped = false;

  if (!toggle || !menu) return () => {};

  root.documentElement?.classList?.add('js');
  toggle.setAttribute('aria-expanded', 'false');

  const setOpen = (open, { restoreFocus = false } = {}) => {
    const mobile = Boolean(mobileQuery.matches);
    const expanded = mobile && Boolean(open);

    toggle.setAttribute('aria-expanded', String(expanded));
    menu.hidden = mobile ? !expanded : false;
    if (restoreFocus && mobile) toggle.focus?.();
  };

  const handleToggle = () => {
    if (!mobileQuery.matches) return;
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  };
  const handleEscape = (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false, { restoreFocus: true });
    }
  };
  const handleLink = () => {
    if (mobileQuery.matches) setOpen(false);
  };
  const syncViewport = () => {
    const mobile = Boolean(mobileQuery.matches);
    toggle.hidden = !mobile;
    setOpen(false);
  };

  toggle.addEventListener('click', handleToggle);
  root.addEventListener?.('keydown', handleEscape);
  const links = [...(menu.querySelectorAll?.('a') ?? [])];
  links.forEach((link) => link.addEventListener('click', handleLink));
  mobileQuery.addEventListener?.('change', syncViewport);
  if (!mobileQuery.addEventListener) mobileQuery.addListener?.(syncViewport);
  syncViewport();

  return function teardownNavigation() {
    if (stopped) return;
    stopped = true;
    toggle.removeEventListener('click', handleToggle);
    root.removeEventListener?.('keydown', handleEscape);
    links.forEach((link) => link.removeEventListener('click', handleLink));
    mobileQuery.removeEventListener?.('change', syncViewport);
    if (!mobileQuery.removeEventListener) mobileQuery.removeListener?.(syncViewport);
    root.documentElement?.classList?.remove('js');
    toggle.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = false;
  };
}

export function initReveals(root = document) {
  const documentRoot = root.ownerDocument ?? root;
  const view = documentRoot.defaultView ?? globalThis;
  const motionQuery = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  const Observer = view.IntersectionObserver;
  const html = documentRoot.documentElement;
  const introItems = [...(root.querySelectorAll?.('[data-intro-reveal]') ?? [])];
  const scrollItems = [
    ...(root.querySelectorAll?.('[data-reveal-group]') ?? []),
    ...(root.querySelectorAll?.('[data-reveal-project]') ?? []),
  ];
  let stopped = false;
  let observerResponded = false;
  let failSafe;
  let frame;

  const revealEverything = () => {
    introItems.forEach((item) => item.classList.add('is-revealed'));
    scrollItems.forEach((item) => item.classList.add('is-revealed'));
    html?.classList?.add('motion-intro-play');
  };

  if (motionQuery?.matches || typeof Observer !== 'function') {
    revealEverything();
    return () => {};
  }

  let observer;

  try {
    observer = new Observer(
      (entries) => {
        observerResponded = true;
        if (failSafe !== undefined) {
          view.clearTimeout?.(failSafe);
          failSafe = undefined;
        }

        for (const entry of entries) {
          const passedAboveViewport = entry.boundingClientRect?.bottom <= 0;
          if (!entry.isIntersecting && !passedAboveViewport) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    scrollItems.forEach((item) => observer.observe(item));
    html?.classList?.add('motion-ready');
  } catch {
    revealEverything();
    html?.classList?.remove('motion-ready');
    return () => {};
  }

  const playIntro = () => {
    html?.classList?.add('motion-intro-play');
    introItems.forEach((item) => item.classList.add('is-revealed'));
  };
  if (view.requestAnimationFrame) {
    frame = view.requestAnimationFrame(playIntro);
  } else {
    playIntro();
  }

  failSafe = view.setTimeout?.(() => {
    if (observerResponded) return;
    revealEverything();
    html?.classList?.add('motion-failsafe');
    observer.disconnect();
  }, 6000);

  return function teardownReveals() {
    if (stopped) return;
    stopped = true;
    observer.disconnect();
    if (frame !== undefined) view.cancelAnimationFrame?.(frame);
    if (failSafe !== undefined) view.clearTimeout?.(failSafe);
    revealEverything();
    html?.classList?.remove('motion-ready', 'motion-intro-play', 'motion-failsafe');
  };
}

export function initFocusTyping(root = document, options = {}) {
  const target = root.querySelector?.('[data-typing-focus]');
  if (!target) return () => {};

  const documentRoot = root.ownerDocument ?? root;
  const view = documentRoot.defaultView ?? globalThis;
  const motionQuery = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  const text = target.dataset.typingText ?? target.textContent ?? '';
  const characters = Array.from(text);
  const startDelay = options.startDelay ?? 900;
  const characterDelay = options.characterDelay ?? 34;
  let timer;
  let index = 0;
  let stopped = false;

  if (!text || motionQuery?.matches) return () => {};

  const finish = () => {
    target.textContent = text;
    target.classList.remove('is-typing');
    target.classList.add('is-typed');
  };

  const typeNext = () => {
    if (stopped) return;
    index += 1;
    target.textContent = characters.slice(0, index).join('');

    if (index >= characters.length) {
      finish();
      return;
    }

    timer = view.setTimeout?.(typeNext, characterDelay);
  };

  target.textContent = '';
  target.classList.add('is-typing');
  timer = view.setTimeout?.(typeNext, startDelay);

  return function teardownFocusTyping() {
    if (stopped) return;
    stopped = true;
    if (timer !== undefined) view.clearTimeout?.(timer);
    target.textContent = text;
    target.classList.remove('is-typing', 'is-typed');
  };
}

if (typeof document !== 'undefined') {
  initNavigation(document);
  initProjectMedia(document);
  initWorkflowScrubber(document);
  initReveals(document);
  initFocusTyping(document);
}
