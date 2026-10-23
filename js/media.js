const actionByVideo = new WeakMap();
const actionVersionByVideo = new WeakMap();

function mediaFrameFor(video) {
  return video.closest?.('[data-project-media]') ?? video.parentElement ?? null;
}

function revealFallback(video) {
  const frame = mediaFrameFor(video);
  const fallback = frame?.querySelector?.('[data-media-fallback]');

  video.dataset.mediaFailed = 'true';
  video.controls = false;
  video.pause?.();
  frame?.classList?.add('project-media--fallback');

  if (fallback) {
    fallback.hidden = false;
  }
}

export function decideMediaAction({
  reducedMotion,
  intersecting,
  documentVisible,
  failed,
}) {
  if (failed) return 'fallback';
  if (reducedMotion || !intersecting || !documentVisible) return 'pause';
  return 'play';
}

export async function applyMediaAction(video, action) {
  if (!video) return action;

  const previousAction = actionByVideo.get(video);
  if (previousAction === action) return action;

  const version = (actionVersionByVideo.get(video) ?? 0) + 1;
  actionVersionByVideo.set(video, version);
  actionByVideo.set(video, action);

  if (action === 'fallback') {
    revealFallback(video);
    return 'fallback';
  }

  if (action === 'pause') {
    video.pause?.();
    return 'pause';
  }

  video.muted = true;

  try {
    await Promise.resolve(video.play?.());

    if (
      actionVersionByVideo.get(video) !== version ||
      actionByVideo.get(video) !== 'play'
    ) {
      return 'pause';
    }

    return 'play';
  } catch (error) {
    if (actionVersionByVideo.get(video) === version) {
      if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') {
        actionByVideo.set(video, 'pause');
        return 'pause';
      }
      actionByVideo.set(video, 'fallback');
      revealFallback(video);
      return 'fallback';
    }

    return actionByVideo.get(video) ?? 'pause';
  }
}

function listen(target, type, listener, cleanups) {
  target?.addEventListener?.(type, listener);
  cleanups.push(() => target?.removeEventListener?.(type, listener));
}

export function initProjectMedia(root = document, options = {}) {
  const documentRoot = options.document ?? root.ownerDocument ?? root;
  const view = documentRoot.defaultView ?? globalThis;
  const Observer = options.IntersectionObserver ?? view.IntersectionObserver;
  const hasObserver = typeof Observer === 'function';
  const matchMedia = options.matchMedia ?? view.matchMedia?.bind(view);
  const motionQuery = matchMedia?.('(prefers-reduced-motion: reduce)') ?? {
    matches: false,
  };
  const frames = [...(root.querySelectorAll?.('[data-project-media]') ?? [])];
  const cleanups = [];
  const records = new Map();
  let stopped = false;

  const documentVisible = () => documentRoot.visibilityState !== 'hidden';

  const update = (record) => {
    if (stopped) return;

    const viewportEligible = record.intersecting && documentVisible();
    if (!viewportEligible || !record.open) record.userStarted = false;
    const reducedMotionPause =
      Boolean(motionQuery.matches) && !(record.open && record.userStarted);

    const action = decideMediaAction({
      reducedMotion: reducedMotionPause,
      intersecting: viewportEligible,
      documentVisible: documentVisible(),
      failed: record.failed || record.video.dataset.mediaFailed === 'true',
    });

    void applyMediaAction(record.video, action);
  };

  const closeRecord = (record, { restoreFocus = false } = {}) => {
    if (!record.open) return;

    record.open = false;
    record.userStarted = false;
    record.frame.classList.remove('project-media--open');
    record.toggle?.setAttribute('aria-expanded', 'false');
    if (record.toggle) {
      record.toggle.textContent = record.toggle.dataset.openLabel ?? 'Open media';
    }
    record.video.controls = false;
    record.video.currentTime = 0;
    update(record);

    if (restoreFocus) record.toggle?.focus?.();
  };

  const openRecord = (record) => {
    record.open = true;
    record.frame.classList.add('project-media--open');
    record.toggle?.setAttribute('aria-expanded', 'true');
    if (record.toggle) {
      record.toggle.textContent = record.toggle.dataset.closeLabel ?? 'Close media';
    }
    record.video.controls = true;
    update(record);
  };

  for (const frame of frames) {
    const video = frame.querySelector?.('[data-project-video]');
    if (!video) continue;

    const toggle = frame.querySelector?.('[data-media-toggle]') ?? null;
    const fallback = frame.querySelector?.('[data-media-fallback]') ?? null;
    const record = {
      failed: false,
      frame,
      intersecting: !hasObserver,
      open: !toggle || toggle.getAttribute('aria-expanded') === 'true',
      toggle,
      userStarted: false,
      video,
    };
    records.set(frame, record);

    video.muted = true;
    video.controls = record.open;
    actionByVideo.set(video, 'pause');
    if (toggle) toggle.hidden = false;

    const handleToggle = () => {
      record.open ? closeRecord(record) : openRecord(record);
    };
    const handleError = () => {
      record.failed = true;
      update(record);
    };
    const handlePlay = () => {
      const viewportEligible = record.intersecting && documentVisible();

      if (motionQuery.matches && record.open && viewportEligible) {
        record.userStarted = true;
        actionByVideo.set(video, 'play');
      } else if (motionQuery.matches || !viewportEligible) {
        actionByVideo.delete(video);
        update(record);
      }
    };
    const handleReady = () => frame.classList.add('project-media--ready');
    const handleStillReady = () =>
      frame.classList.add('project-media--still-ready');

    if (toggle) listen(toggle, 'click', handleToggle, cleanups);
    listen(video, 'error', handleError, cleanups);
    listen(video, 'play', handlePlay, cleanups);
    listen(video, 'loadeddata', handleReady, cleanups);
    if (video.error) {
      handleError();
    } else if (video.readyState >= 2) {
      handleReady();
    }
    if (fallback?.complete && fallback.naturalWidth > 0) {
      handleStillReady();
    } else if (fallback) {
      listen(fallback, 'load', handleStillReady, cleanups);
    }

  }

  const observer = hasObserver
    ? new Observer(
        (entries) => {
          for (const entry of entries) {
            const record = records.get(entry.target);
            if (!record) continue;
            record.intersecting = Boolean(entry.isIntersecting);
            update(record);
          }
        },
        { threshold: 0.35 },
      )
    : null;

  for (const frame of records.keys()) observer?.observe(frame);

  const handleVisibility = () => {
    for (const record of records.values()) update(record);
  };
  const handleMotionChange = () => {
    for (const record of records.values()) update(record);
  };
  const handleEscape = (event) => {
    if (event.key !== 'Escape') return;

    const openRecords = [...records.values()].filter((record) => record.open && record.toggle);
    openRecords.at(-1) && closeRecord(openRecords.at(-1), { restoreFocus: true });
  };

  listen(documentRoot, 'visibilitychange', handleVisibility, cleanups);
  listen(documentRoot, 'keydown', handleEscape, cleanups);

  if (motionQuery.addEventListener) {
    listen(motionQuery, 'change', handleMotionChange, cleanups);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(handleMotionChange);
    cleanups.push(() => motionQuery.removeListener?.(handleMotionChange));
  }

  return function teardownProjectMedia() {
    if (stopped) return;
    stopped = true;
    observer?.disconnect();
    cleanups.splice(0).forEach((cleanup) => cleanup());

    for (const { video } of records.values()) {
      video.pause?.();
      actionByVideo.delete(video);
      actionVersionByVideo.delete(video);
    }
  };
}
