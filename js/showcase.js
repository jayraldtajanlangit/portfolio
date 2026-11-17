// Homepage showcase motion: the projects band takes each project's color while scrolling,
// scrolling stops at each project in turn, project media tilts toward a fine pointer, and the
// cursor is one of Swarm's agents: an arrow that leans as it moves, becomes a spinning
// "View project" badge over projects and names the action over other buttons.
import { afterSwarm } from './motion.js';

const MAX_TILT = 7, MAX_LEAN = 16;
// The agent arrow from the Swarm intro (js/vendor/swarm-rebuild.js), tip at (5, 3.5) in its 28px box.
const AGENT_ARROW = 'M4.6 3.9 C4.2 3.1 4.9 2.4 5.7 2.8 L20.6 9.4 C21.5 9.8 21.4 11.1 20.4 11.3 L13.9 12.9 C13.4 13 13 13.4 12.9 13.9 L11.3 20.4 C11.1 21.4 9.8 21.5 9.4 20.6 Z';
const clamp = value => Math.min(1, Math.max(0, value));
const round = (value, digits = 2) => +value.toFixed(digits);
const viewOf = root => (root.ownerDocument ?? root).defaultView ?? globalThis;
const reducedMotion = view => Boolean(view.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
const finePointer = view => Boolean(view.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches);

/** Rotation in degrees for a pointer at (x, y), both 0..1 across the media. */
export function tiltFor(x, y) {
  return { rx: round((0.5 - clamp(y)) * MAX_TILT * 2), ry: round((clamp(x) - 0.5) * MAX_TILT * 2) };
}

/** How far the agent arrow leans, in degrees, while it is `dx` px behind the pointer. */
export function leanFor(dx) {
  return Math.round(Math.max(-MAX_LEAN, Math.min(MAX_LEAN, dx * 0.35)));
}

/** What the cursor becomes over `target`: the project badge, a word tag, a raised arrow over links, or the plain arrow. */
export function cursorState(target) {
  const named = target?.closest?.('[data-cursor]');
  if (named) {
    const tone = named.closest?.('[data-project-tone]')?.dataset.projectTone;
    return tone ? { state: 'badge', tone } : { state: 'label', label: named.dataset.cursor };
  }
  return { state: target?.closest?.('a, button, [role="button"]') ? 'link' : '' };
}

// The badge text runs round a circle of radius 33 (circumference ~207) inside a 100-unit box.
const CURSOR_PARTS = `<span class="site-cursor-agent"><svg width="28" height="28" viewBox="0 0 28 28"><path d="${AGENT_ARROW}"/></svg></span>`
  + '<span class="site-cursor-badge"><svg viewBox="0 0 100 100"><defs><path id="site-cursor-ring" d="M50,50 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0"/></defs>'
  + '<text><textPath href="#site-cursor-ring" textLength="205">VIEW PROJECT \u2726 </textPath></text></svg>'
  + '<span class="site-cursor-arrow">\u2197</span></span>'
  + '<span class="site-cursor-pill"></span>';

export function initProjectColors(root = document) {
  const doc = root.ownerDocument ?? root;
  const view = viewOf(root);
  const section = doc.querySelector?.('[data-project-colors]');
  if (!section || reducedMotion(view) || typeof view.IntersectionObserver !== 'function') return () => {};
  let observer;
  // Swarm snapshots the page first, so it rebuilds the colorful static bands.
  const stopWaiting = afterSwarm(doc, () => {
    const heading = section.querySelector('.section-heading');
    const rows = [...section.querySelectorAll('[data-project-tone]')];
    doc.documentElement.classList.add('project-colors');
    section.dataset.activeProject = 'intro';
    observer = new view.IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) section.dataset.activeProject = entry.target === heading ? 'intro' : entry.target.dataset.projectTone;
      }
    }, { rootMargin: '-45% 0px -45% 0px' });
    [heading, ...rows].filter(Boolean).forEach(target => observer.observe(target));
  });
  return () => {
    stopWaiting();
    observer?.disconnect();
    doc.documentElement.classList.remove('project-colors');
    delete section.dataset.activeProject;
  };
}

// Scroll stops: a glide lasts GLIDE_MS and then holds the project for HOLD_MS. Arriving from another
// section, a project catches you within CATCH of a screen; a project up to OVERFLOW times the screen
// still stops in the middle, a taller one at its top and bottom with EDGE px to spare. Touchpad
// steps arriving within COAST_MS that keep shrinking are a swipe coasting, not a new push.
const GLIDE_MS = 700, HOLD_MS = 250, CATCH = 0.5, OVERFLOW = 1.15, EDGE = 16, COAST_MS = 150;
const STEP_KEYS = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 };
const easeInOut = t => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The scroll distance to the next stop in `direction` (1 down, -1 up), or null to scroll normally.
 * `gaps` are the distances from here to each stop, top to bottom (positive = further down).
 */
export function stepDistance(gaps, direction, height) {
  const ahead = gaps.filter(gap => Math.sign(gap) === direction && Math.abs(gap) > 2);
  if (!ahead.length) return null;
  const next = direction > 0 ? Math.min(...ahead) : Math.max(...ahead);
  const inside = gaps[0] <= 2 && gaps.at(-1) >= -2;
  return inside || Math.abs(next) <= height * CATCH ? Math.round(next) : null;
}

/** On a mouse or touchpad, each scroll step through the projects glides to the next one and stops there. */
export function initProjectSnap(root = document) {
  const doc = root.ownerDocument ?? root;
  const view = viewOf(root);
  const section = doc.querySelector?.('[data-project-colors]');
  if (!section || !finePointer(view) || reducedMotion(view)) return () => {};
  const px = value => parseFloat(value) || 0;
  let started = false, busy = false, frame, hold, lastWheel = -Infinity, lastSize = 0;
  // A project that fits the screen stops in the middle, where the background takes its color;
  // a taller one stops with its top in view, then its bottom.
  const gaps = () => {
    const height = view.innerHeight, list = [];
    for (const project of section.querySelectorAll('[data-project-tone]')) {
      const rect = project.getBoundingClientRect(), style = view.getComputedStyle(project);
      const top = rect.top + px(style.paddingTop), bottom = rect.bottom - px(style.paddingBottom);
      if (bottom - top <= height * OVERFLOW) list.push((top + bottom) / 2 - height / 2);
      else list.push(top - EDGE, bottom + EDGE - height);
    }
    return list;
  };
  const stopGlide = () => {
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    if (hold !== undefined) view.clearTimeout(hold);
    frame = hold = undefined;
    busy = false;
  };
  const glide = distance => {
    const from = view.scrollY;
    let begin;
    busy = true;
    const move = time => {
      begin ??= time;
      const progress = Math.min(1, (time - begin) / GLIDE_MS);
      view.scrollTo({ top: Math.round(from + distance * easeInOut(progress)), behavior: 'instant' });
      if (progress < 1) { frame = view.requestAnimationFrame(move); return; }
      frame = undefined;
      hold = view.setTimeout(() => { hold = undefined; busy = false; }, HOLD_MS);
    };
    frame = view.requestAnimationFrame(move);
  };
  // One step: glide to the next stop (holding the page still meanwhile), or past either end scroll on normally.
  const stepBy = (direction, event, push = true) => {
    if (busy) { event.preventDefault(); return; }
    const distance = stepDistance(gaps(), direction, view.innerHeight);
    if (distance === null) return;
    event.preventDefault();
    if (push) glide(distance);
  };
  const wheel = event => {
    if (event.ctrlKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const size = Math.abs(event.deltaY);
    const push = event.timeStamp - lastWheel > COAST_MS || size >= lastSize;
    lastWheel = event.timeStamp;
    lastSize = size;
    stepBy(Math.sign(event.deltaY), event, push);
  };
  const key = event => {
    let direction = STEP_KEYS[event.key];
    if (!direction || event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if (event.shiftKey) { if (event.key !== ' ') return; direction = -1; }
    // Keys stay with a focused field, button or video (Space plays and pauses it).
    if (event.target?.closest?.('input, textarea, select, button, [role="button"], [contenteditable]')) return;
    stepBy(direction, event);
  };
  // Grabbing the scrollbar or clicking a link mid-glide takes over at once.
  const grab = () => { if (busy) stopGlide(); };
  const start = () => {
    started = true;
    doc.addEventListener('wheel', wheel, { passive: false });
    doc.addEventListener('keydown', key);
    doc.addEventListener('pointerdown', grab, { passive: true });
  };
  const stopWaiting = afterSwarm(doc, start);
  return () => {
    stopWaiting();
    if (!started) return;
    stopGlide();
    doc.removeEventListener('wheel', wheel);
    doc.removeEventListener('keydown', key);
    doc.removeEventListener('pointerdown', grab);
  };
}

export function initProjectTilt(root = document) {
  const view = viewOf(root);
  if (!finePointer(view) || reducedMotion(view)) return () => {};
  const cleanups = [];
  for (const media of root.querySelectorAll?.('[data-tilt]') ?? []) {
    let frame;
    const move = event => {
      const rect = media.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
      if (frame !== undefined) view.cancelAnimationFrame?.(frame);
      frame = view.requestAnimationFrame(() => {
        frame = undefined;
        const { rx, ry } = tiltFor(x, y);
        media.style.setProperty('--rx', `${rx}deg`);
        media.style.setProperty('--ry', `${ry}deg`);
        media.style.setProperty('--gx', `${round(clamp(x) * 100, 1)}%`);
        media.style.setProperty('--gy', `${round(clamp(y) * 100, 1)}%`);
        media.classList.add('is-tilting');
      });
    };
    const leave = () => {
      if (frame !== undefined) view.cancelAnimationFrame?.(frame);
      frame = undefined;
      ['--rx', '--ry', '--gx', '--gy'].forEach(name => media.style.removeProperty(name));
      media.classList.remove('is-tilting');
    };
    media.addEventListener('pointermove', move);
    media.addEventListener('pointerleave', leave);
    cleanups.push(() => { leave(); media.removeEventListener('pointermove', move); media.removeEventListener('pointerleave', leave); });
  }
  return () => cleanups.forEach(cleanup => cleanup());
}

export function initViewCursor(root = document) {
  const doc = root.ownerDocument ?? root;
  const view = viewOf(root);
  if (!finePointer(view) || reducedMotion(view)) return () => {};
  const html = doc.documentElement;
  let cursor, pill, watcher, frame, x = 0, y = 0, tx = 0, ty = 0, shown = false;
  const render = () => {
    frame = undefined;
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    cursor.style.transform = `translate3d(${round(x, 1)}px, ${round(y, 1)}px, 0)`;
    // Like the Swarm agents, the arrow trails behind its tip while it moves and straightens at rest.
    cursor.style.setProperty('--lean', `${leanFor(tx - x)}deg`);
    if (Math.abs(tx - x) + Math.abs(ty - y) > 0.3) frame = view.requestAnimationFrame(render);
  };
  const press = () => { cursor.dataset.pressed = ''; };
  const release = () => { delete cursor.dataset.pressed; };
  const describe = target => {
    const { state, tone, label } = cursorState(target);
    cursor.dataset.state = state;
    // Tone and word stay set while the badge or tag shrinks away, so neither flickers.
    if (tone) cursor.dataset.tone = tone;
    if (label && pill) pill.textContent = label;
    if (target?.closest?.('[data-surface="dark"]')) cursor.dataset.onDark = '';
    else delete cursor.dataset.onDark;
  };
  const move = event => {
    tx = event.clientX; ty = event.clientY;
    if (!shown) { x = tx; y = ty; shown = true; cursor.classList.add('is-visible'); }
    describe(event.target);
    if (frame === undefined) frame = view.requestAnimationFrame(render);
  };
  const hide = () => { shown = false; cursor.classList.remove('is-visible'); };
  const rescan = () => { if (shown) describe(doc.elementFromPoint?.(tx, ty)); };
  const start = () => {
    cursor = doc.createElement('div');
    cursor.classList.add('site-cursor');
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = CURSOR_PARTS;
    pill = cursor.querySelector?.('.site-cursor-pill');
    doc.body.append(cursor);
    html.classList.add('custom-cursor');
    doc.addEventListener('pointermove', move);
    doc.addEventListener('scroll', rescan, { passive: true });
    doc.addEventListener('pointerdown', press, { passive: true });
    doc.addEventListener('pointerup', release, { passive: true });
    doc.addEventListener('pointercancel', release, { passive: true });
    html.addEventListener('mouseleave', hide);
    // A button can change its word while the pointer rests on it (Copy becomes Copied!).
    if (typeof view.MutationObserver === 'function') {
      watcher = new view.MutationObserver(rescan);
      watcher.observe(doc.body, { subtree: true, attributes: true, attributeFilter: ['data-cursor'] });
    }
  };
  const stopWaiting = afterSwarm(doc, start);
  return () => {
    stopWaiting();
    if (!cursor) return;
    if (frame !== undefined) view.cancelAnimationFrame?.(frame);
    watcher?.disconnect();
    doc.removeEventListener('pointermove', move);
    doc.removeEventListener('scroll', rescan);
    doc.removeEventListener('pointerdown', press);
    doc.removeEventListener('pointerup', release);
    doc.removeEventListener('pointercancel', release);
    html.removeEventListener('mouseleave', hide);
    html.classList.remove('custom-cursor');
    cursor.remove();
  };
}

if (typeof document !== 'undefined') {
  initProjectColors(document);
  initProjectSnap(document);
  initProjectTilt(document);
  initViewCursor(document);
}
