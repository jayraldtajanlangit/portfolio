# Full-page agent build tour implementation plan

**Goal:** Animate three collaborators building every part of the real homepage,
then automatically scroll to the next area after their work completes.

**Architecture:** Generate ordered viewport stops across the hero, all projects,
toolkit, about, contact and footer from current DOM geometry. A small controller
sequences work, completion and a cancellable requestAnimationFrame scroll. Render
one decorative cursor layer plus accessible Pause/Stop controls. Existing content
and links remain available; no intro screen or duplicated portfolio.

**Stack:** Static HTML renderer, CSS, Web Animations API, existing Node tests.

1. Replace the short hero-only behavior tests in test/home-agents.test.mjs with
   deterministic tour tests. Cover every section including tall mobile sections,
   completion before scrolling, pause/resume during work and scrolling, manual
   takeover, reduced motion, history/deep-link bypass and cleanup. Run them red.
2. Update js/home-agents.js with the DOM stop planner, actor target selection,
   per-section copy, short content/image build effects and a single scheduler.
   Scroll gradually only after all three agents show completion. Cancel timers,
   animation frames, effects and listeners on interruption; never lock scrolling.
3. Update scripts/render-home-agents.mjs and css/home-agents.css with animated
   selection frames, work/done states, section progress, Pause and Stop tour.
   Keep control touch targets accessible, colors matched to the existing theme,
   cursor labels inside the viewport and decoration pointer-transparent.
4. Rebuild index.html only using renderHomePage. Run npm test and syntax/whitespace
   checks, then extend tmp/check-home-agents.mjs to exercise a complete real tour
   on desktop and phone, controls, automatic versus manual scrolling, all sections,
   no-JavaScript/reduced-motion bypass, screenshots and runtime errors.

Current balanced pacing: 1200ms of building plus a 140ms completion checkmark
per viewport, with a 380ms scroll between viewports. Taller phone sections
receive additional stops so work never happens entirely off-screen. Pause freezes
both cursor work and automatic scrolling. Wheel, touch, page-navigation keys,
page links and Escape hand control back immediately.

## Visible construction revision

The user correctly observed that the earlier version mostly moved cursors over
an already-complete page. Short opacity/wipe effects completed before they could
read as construction. Replace that with js/agent-assembly.js:

- Prepare real page units as visually pending while preserving their full layout.
  The small head bootstrap prevents a finished-hero flash and releases itself if
  the controller fails to load. No JavaScript and reduced motion retain normal
  content. The build tour owns the entrance instead of competing with motion.js.
- Draw SVG wireframes at the actual unit positions, then assemble the real cards
  from scale/blur/clipping and stagger in the real buttons and technology icons.
- Stream text in short word chunks using shown and transparent-remainder spans.
  Their combined text stays complete for accessibility. Preserve and restore the
  original text nodes; do not replace heading, link or button elements. Native
  animation time drives the painter so Pause freezes real typing as well.
- Position content cursors using measured character ranges. Coordinate cursor
  segments with overlapping icon builds while keeping native keyframe offsets
  monotonic across both new and previously built units.
- Include short captions and kickers in the build. Own native effects as soon as
  they are created so partial failures cancel every earlier effect and restore
  the page. Stop/manual takeover restores all unfinished units immediately.

Focused real-browser regression: tmp/check-agent-assembly.mjs. It reproduces the
old failure (no pending units or typed prefixes; preview already visible) and
checks actual prefix growth, final characters, media opacity 0→1, paused typing,
text accessibility, mobile layout, missing-controller fallback and partial native
animation failure. It also records a seven-second MP4 of actual browser playback.

## Approved three-agent parallel build

The user chose option 2: all agents build simultaneously with rapid text chunks,
quick media/card assembly and immediate scrolling. PARALLEL_BUILD_TIMING sets
600ms work / 80ms done / 280ms scroll. All roles start at 28ms; a capped 18ms
stagger lets every unit on a dense screen finish within 398ms. Media builds take
220ms, content chunks 280ms and controls/icons 170ms. Cursor routes touch up to
three representative work areas while the complete batch assembles in parallel.

Verified the actual default tour at 1440×900 (8.35 seconds) and 390×844 (15.30
seconds), including all six areas, zero unfinished units and original DOM/text
restoration. Mutation tracking confirms name chunks are exactly empty, Jayrald,
then JayraldTajanlangit. All 85 Node tests and 25 browser checks pass. Pause/Resume,
touch controls, manual takeover, reduced motion, missing-controller fallback and
no-JavaScript behavior remain verified. Code review found no new regressions.
The actual-speed desktop recording is parallel-agents/parallel-build.mp4 in the
task's visualization artifacts. Current browser runner: tmp/check-home-agents.mjs.

## Balanced task choreography

User feedback found the 600ms version too rushed and the cursor paths too similar.
Use 1200ms work / 140ms completion / 380ms scroll. Parallel media builds now take
440ms, text chunks 560ms and controls/icons 340ms, with enough settling time to
read the action before moving on. The complete tour measured 15.1s on desktop
and 27.2s on the longer phone layout.

Design uses a move cursor with hold, vertical placement and resize-handle gestures;
content uses a text caret following the measured chunk positions and line returns;
frontend uses a pointer that stays on the button and presses/releases. Preserve
the full content trace rather than reducing it to first/last horizontal endpoints.
Cursor gestures remain clamped to the viewport and pause/cleanup remain intact.

86 Node tests pass, including gesture shape and the updated timing bounds. The
actual desktop recording uses native browser screencast timestamps (511 frames),
at balanced-agents/balanced-build.mp4 in the visualization artifacts.

## Validation

- All 82 Node tests pass, including complete section coverage, long mobile areas,
  work-before-scroll ordering, routes through all visible previews, footer label
  separation, pause/resume during work and scrolling, mobile control taps,
  manual takeover, bypasses and failure cleanup.
- Twenty-two full-tour browser checks plus thirteen construction/recording checks
  pass. The unmodified production controller completes
  the entire tour at 1440×900 in light mode and 390×844 in dark mode, visiting all
  six areas and ending at the footer. All three agents and the controls fit the
  viewport throughout. Inspected screenshots of each section at both sizes.
- The final footer completion state has zero pending construction units on both
  desktop and phone, including short captions. All actual typed text, previews,
  icons and controls finish before the tour is disposed.
- Verified gradual automatic scrolling, completion states, Pause/Resume, touch
  Pause, wheel takeover, Stop tour, reduced motion and the no-JavaScript page.
  No browser runtime errors, horizontal overflow, modals or final label overlap.
- Code review identified replay of completed content effects on Resume. Suspend
  and resume only running effects; both the unit regression and an instrumented
  real-browser check verify completed effects remain finished.
- JavaScript syntax and Git whitespace checks pass. No new dependencies.
