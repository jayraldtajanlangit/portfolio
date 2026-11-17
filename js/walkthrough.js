// Homepage project previews play on their own whenever they are on screen. They rest off screen,
// in a hidden tab and for visitors who ask for reduced motion. Clicking one opens its project.
export function shouldPreviewPlay({ intersecting, documentVisible, reducedMotion }) {
  return Boolean(intersecting && documentVisible && !reducedMotion);
}

export function initWalkthroughPreviews(root = document) {
  const doc = root.ownerDocument ?? root;
  const view = doc.defaultView ?? globalThis;
  const reduced = view.matchMedia?.('(prefers-reduced-motion: reduce)') ?? { matches: false };
  const hasObserver = typeof view.IntersectionObserver === 'function';
  const cleanups = [], records = [];
  let stopped = false;
  const listen = (element, name, handler) => {
    element?.addEventListener?.(name, handler);
    cleanups.push(() => element?.removeEventListener?.(name, handler));
  };
  const pause = record => {
    record.generation++;
    record.autoRequested = false;
    if (!record.video.paused) record.video.pause();
  };
  const play = record => {
    if (!record.video.paused || record.autoRequested) return;
    const generation = ++record.generation;
    record.autoRequested = true;
    Promise.resolve(record.video.play()).then(() => {
      if (generation !== record.generation) return;
      if (stopped || !record.wanted) pause(record);
    }).catch(() => { if (generation === record.generation) record.autoRequested = false; });
  };
  const sync = () => {
    if (stopped) return;
    for (const record of records) {
      record.wanted = shouldPreviewPlay({ intersecting: record.intersecting, documentVisible: !doc.hidden, reducedMotion: reduced.matches });
      record.wanted ? play(record) : pause(record);
    }
  };
  for (const card of root.querySelectorAll?.('[data-walkthrough-preview]') ?? []) {
    const video = card.querySelector('video');
    const frame = card.querySelector('.selected-project-media');
    if (!video || !frame) continue;
    const record = { video, frame, intersecting: !hasObserver, generation: 0, wanted: false, autoRequested: false };
    records.push(record);
    video.muted = true;
    video.loop = true;
    // HTML autoplay is the no-JavaScript fallback; the controller manages visibility and motion preferences.
    video.autoplay = false;
    video.controls = false;
    listen(video, 'play', () => {
      record.autoRequested = false;
      if (!record.wanted) pause(record);
    });
  }
  const byFrame = new Map(records.map(record => [record.frame, record]));
  const observer = hasObserver ? new view.IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = byFrame.get(entry.target);
      if (record) record.intersecting = entry.isIntersecting && entry.intersectionRatio >= .2;
    }
    sync();
  }, { threshold: [0, .2, .4, .6, .8, 1] }) : null;
  records.forEach(record => observer?.observe(record.frame));
  listen(doc, 'visibilitychange', sync);
  listen(reduced, 'change', sync);
  sync();
  return () => {
    stopped = true;
    observer?.disconnect();
    cleanups.forEach(cleanup => cleanup());
    records.forEach(pause);
  };
}

if (typeof document !== 'undefined') initWalkthroughPreviews(document);
