# Swarm Rebuild integration

The user explicitly selected the actual Swarm Rebuild engine from
https://github.com/DhvanilPatel/swarm-cursors, replacing the custom cursor tour.

The vendored engine is js/vendor/swarm-rebuild.js, upstream blob
626e40b8e7cb5eea3544d814af585ad9b39453dc. It retains the upstream DOM blueprint,
renderer, generator tasks, cursor physics, typing, guides, duplication and media
construction. js/vendor/NOTICE.md preserves provenance and the upstream notice
that no reuse license is currently supplied.

The homepage adapter loads the engine locally, with no extension installation.
Intro orbit/logo is disabled; automatic Tour is enabled; sound starts muted.
The completed tour fades back to the original clickable portfolio. The native
HUD retains Tour, speed, sound and Exit; Pause/Resume is added.

Reduced motion, deep links, restored history and visits already below the top
bypass the effect. Loading failures release the page. Startup scanning observes
Pause and cannot reset scrolling after cancellation. Replay clears the old
completion timer. The vendor entry point rechecks eligibility after module fetch.

Validation: 69 Node tests pass, including VM regressions for scan pause and
cancellation and late module eligibility. The actual desktop engine was observed
rebuilding 350 layers, auto-scrolling to the footer and removing its overlay.
The earlier custom-engine plans and screenshots are superseded.

Phone verification: the actual engine rebuilds at 390px width with a wrapping
HUD fully inside the viewport. Pause/Resume and Exit were checked. Exit removes
the overlay and leaves the original page visible. Desktop viewport was restored.
Visual captures: swarm-rebuild/desktop.png and swarm-rebuild/mobile.png in the
session visualization directory. A focused review verified the four startup and
cancellation fixes; all 13 targeted integration tests pass (69 tests overall).

Cursor reduction: the user asked for a smaller swarm. Start with six desktop
cursors, keep at least four, and cap all visible cursors (including departures
and the ending flock) at ten. Phones start with three, retain two, and cap at
six. Build speed and generator choreography remain unchanged. The live HUD
reports concurrent cursors rather than the historical total of retired workers.

Reduction verification: all 72 tests pass, including stressed build queues,
departing cursors and the final flock under both budgets. The browser showed
five concurrent desktop cursors and three on the phone while rebuilding real
project content. Captures are saved in the session's calm-swarm directory.
Restored the desktop viewport after verification.
