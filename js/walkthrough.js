export function shouldPreviewPlay({ intersecting, documentVisible, reducedMotion, userPaused, manual }) {
  return Boolean(intersecting && documentVisible && !userPaused && (!reducedMotion || manual));
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
  const fullscreen = record => doc.fullscreenElement === record.video;
  const updateLabel = record => {
    record.video.setAttribute?.('aria-label', `${record.video.paused ? 'Play' : 'Pause'} ${record.label}`);
  };
  const pause = record => {
    record.generation++;
    record.autoRequested = false;
    if (!record.video.paused) {
      record.video.pause();
    }
    updateLabel(record);
  };
  const play = record => {
    if (!record.video.paused || record.autoRequested) return;
    const generation = ++record.generation;
    record.autoRequested = true;
    Promise.resolve(record.video.play()).then(() => {
      if (generation !== record.generation) return;
      if (stopped || !record.wanted) pause(record);
    }).catch(() => { if (generation === record.generation) { record.autoRequested = false; updateLabel(record); } });
  };
  const sync = () => {
    if (stopped) return;
    for (const record of records) {
      record.wanted = shouldPreviewPlay({
        ...record,
        intersecting: record.intersecting || fullscreen(record),
        manual: record.manual || fullscreen(record),
        documentVisible: !doc.hidden, reducedMotion: reduced.matches,
      });
      record.wanted ? play(record) : pause(record);
    }
  };
  for (const card of root.querySelectorAll?.('[data-walkthrough-preview]') ?? []) {
    const video = card.querySelector('video');
    const frame = card.querySelector('.selected-project-media');
    if (!video || !frame) continue;
    const record = { card, video, frame, label: video.getAttribute?.('aria-label') ?? 'project preview', intersecting: !hasObserver, userPaused: false, manual: false, generation: 0, wanted: false, autoRequested: false };
    records.push(record);
    video.muted = true;
    video.loop = true;
    // HTML autoplay is the no-JavaScript fallback; the controller manages visibility and motion preferences.
    video.autoplay = false;
    video.controls = false;
    video.tabIndex = 0;
    video.setAttribute?.('role', 'button');
    const toggle = () => {
      record.userPaused = !video.paused;
      record.manual = video.paused;
      sync();
    };
    listen(video, 'click', toggle);
    listen(video, 'keydown', event => {
      if (![' ', 'Enter', 'Spacebar'].includes(event.key)) return;
      event.preventDefault();
      if (!event.repeat) toggle();
    });
    listen(video, 'play', () => {
      record.autoRequested = false;
      if (!record.wanted) pause(record);
      else updateLabel(record);
    });
    listen(video, 'pause', () => updateLabel(record));
  }
  const byFrame = new Map(records.map(record => [record.frame, record]));
  const observer = hasObserver ? new view.IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = byFrame.get(entry.target);
      if (!record) continue;
      const visible = entry.isIntersecting && entry.intersectionRatio >= .2;
      record.intersecting = visible;
      if (!visible && !fullscreen(record)) record.manual = false;
    }
    sync();
  }, { threshold: [0, .2, .4, .6, .8, 1] }) : null;
  records.forEach(record => observer?.observe(record.frame));
  listen(doc, 'visibilitychange', sync);
  listen(doc, 'fullscreenchange', sync);
  listen(reduced, 'change', () => {
    if (reduced.matches) records.forEach(record => { record.manual = false; });
    sync();
  });
  sync();
  return () => {
    stopped = true;
    observer?.disconnect();
    cleanups.forEach(cleanup => cleanup());
    records.forEach(pause);
  };
}

if (typeof document !== 'undefined') initWalkthroughPreviews(document);
