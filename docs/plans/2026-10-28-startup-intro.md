# Portfolio startup intro

Approved direction: minimal terminal startup with a cyan circular scanner, JT SYSTEM,
three status messages, and “Welcome. I’m Jayrald.” before a slide-up reveal.

Use the existing static homepage generator, CSS and a small standalone script.
Keep the complete sequence near two seconds, silent, once per tab session.
Use the current theme background and contrasting cyan. No dependencies or new media.
Alternatives considered: full HUD (too visually busy) and plain name reveal (less of
the requested system-startup feel).

## Implementation plan

- [x] Add behavioral tests covering completion, skip/Escape, repeat visits,
  reduced motion, direct links, history returns, disabled storage and cleanup.
- [x] Add homepage-only hidden dialog markup and a tiny inline controller
  immediately after it, plus transform/opacity CSS animations. Native dialog
  provides keyboard containment; absent JavaScript leaves the homepage available.
- [x] Regenerate only index.html from renderHomePage; preserve existing unrelated edits.
- [ ] Run the full Node test suite and browser checks at desktop/mobile sizes,
  both themes, with no JavaScript and reduced motion. Inspect screenshots.

Review focus: avoid page flashes, repeat playback, trapped focus, layout overflow,
and leaving a modal open after navigation or a motion-preference change.

## Validation

All 58 Node tests passed, including 12 startup checks. JavaScript syntax checks and
the scoped whitespace diff check passed. Browser checks are prepared in
`tmp/startup-browser-check.mjs`, but visual verification is outstanding: Chrome
failed to start its crash server; Edge failed the CDP WebSocket connection.
The full test suite invokes the site generator, which also refreshes its existing
generated case-study/concept files using the user's current source changes.

Independent code review caught a blocking external request for the controller.
Added a failing regression test and embedded the existing script into generated
HTML instead, preserving a testable source file without an extra script request.

## Approved visual refinement

User chose the recommended cleaner futuristic direction after requesting more
style across the whole screen. Use an edge-to-edge charcoal canvas in both themes,
a static cyan grid and corner framing, a larger double-ring scanner, a single
scan-line pass, and small identity/environment labels around the perimeter.
Collapse secondary labels on mobile and compact the scanner on short screens.
Preserve the existing two-second timing, inline controller, once-per-session
behavior, skip/Escape and reduced-motion bypass. No new media or dependencies.

## Longer startup pacing

User requested a longer sequence. Extend the intro to 4.5 seconds: initialize for
1 second, load projects until 2.6 seconds, show system online, reveal the welcome
at 2.9 seconds and hold it until the 400ms exit starts at 4.1 seconds. Slow the scan
and progress animations to match. Skip/Escape remain immediate throughout; retain
all existing bypass and cleanup behavior. Updated timing regression checks verify
the longer welcome hold and dismissal during the extended sequence.

## Frozen-preview fix

The screenshot showed the initial status and welcome together, matching the
temporary frozen layout preview, whose controller had no completion timer.
Removed that controller from both preview entry points. The layout preview now
renders the actual homepage controller through render-startup-preview.mjs, and
the HTTP preview serves index.html unchanged. A regression check runs the preview
controller and verifies message progression and automatic dismissal at 4.5s.

## Entrance after startup

User requested another animation after the intro. Wait for the splash's native
close event before starting the existing typing loop and scroll reveals. On that
first entrance, animate the header, name, interests, description paragraphs and
buttons with 100ms stagger and 700ms opacity/translate animations (1.2s total).
Natural completion and Skip/Escape share the same handoff. Repeat visits retain
the regular reveals; reduced motion keeps static content. Do not hide any content
in CSS: unsupported JavaScript or animation APIs must leave the page readable.

## Continuous handoff fix

The close-only handoff exposed the complete homepage before IntersectionObserver
applied its transparent starting frames, creating a refresh-like flash. Dispatch
a single startup:reveal event before the overlay starts its exit. Start the hero
effects synchronously, while still covered, and exclude those already-seen targets
from scroll observation. Keep native close as a cached-controller fallback. Skip
also dispatches before closing; neither path starts the entrance twice.

## Match homepage appearance

Use the homepage's color-paper, color-ink, color-muted, color-rule and accent
tokens throughout the intro, including the Skip button. Derive grid, scanner,
glow and framing transparencies from the accent rather than hardcoded cyan.
The intro now follows the selected light/dark appearance automatically.

## Approved CI/CD direction

Replace the JARVIS HUD with four connected stage cards: Source / Connecting ideas,
Build / Building experiences, Test / Checking the details, Deploy / Portfolio ready.
Activate stages at 0, 0.8, 1.6 and 2.4 seconds; complete all four and show the welcome
at 3.2 seconds. Keep the existing reveal event at 4.1 seconds and deadline at 4.5.
Use homepage color tokens, a horizontal desktop pipeline and vertical mobile
pipeline, and brief loading indicators that become checkmarks. These are decorative
startup stages, without fabricated test results or claims of an actual deployment.
Retain Skip, Escape, no-JavaScript fallback, reduced motion and session bypass.

## GitHub Actions visual refinement

User requested GitHub's CI/CD appearance specifically. Replace the marketing-style
pipeline heading/cards with a repository header, selected Actions tab, Summary/Jobs
sidebar and a workflow-run summary. Use compact connected job boxes with icons to
the left of Checkout, Build, Test and Deploy, showing Queued, Running or Success.
Synchronize the sidebar and graph states, and change the overall run status from
In progress to Success when all four finish. Label this as a Workflow preview.
Preserve homepage appearance tokens, responsive vertical mobile graph, 4.5s timing,
Skip, reduced motion, session bypass and continuous homepage handoff.
Visual reference: https://docs.github.com/en/actions/how-tos/monitor-workflows/use-the-visualization-graph

## Confirmed graph reference

User explicitly confirmed GitHub's workflow-graph screenshot, not the surrounding
repository UI. Remove tabs, sidebar, repository header and log window. Render the
graph itself, with compact job cards, connector ports and curved fork/join edges.
Build splits into Test and Lint; Deploy waits for both. Build runs 0–1.2s, checks
start together at 1.2s, Test completes at 2s, Lint at 2.6s, Deploy at 3.2s. Preserve
the welcome, reveal at 4.1s, close at 4.5s and existing accessibility behavior.
Use a left-to-right graph on desktop and the same dependency structure vertically
on mobile. Derive colors from homepage tokens, with amber indicating active jobs.

Validation: 64 Node tests pass. Headless browser checks pass for 320, 390, 768
and 1440px in both themes, including connector-to-port alignment, text bounds,
viewport fit, matching homepage backgrounds and real 4.5s auto-dismissal. Inspected
desktop and mobile screenshots. Corrected a narrow-screen clipping issue caused
by 100vw interacting with the page's reserved scrollbar gutters.

## Served homepage rebuild

The root index.html had not been rebuilt after the renderer changes. The live
server on port 5500 served the old JARVIS markup against the new CSS, while the
generator-only checks and scratch preview showed the new graph. Rebuilt the root
homepage and added an integration check comparing the shipped dialog and inline
controller with the current renderer. Tests do not invoke the site generator;
run the renderer explicitly after future generator changes before testing.

## Requested node labels

Use the user's exact visible labels and descriptions: Source — Connecting ideas;
Build — Building experiences; Test — Checking the details; Deploy — Portfolio ready.
Keep the existing branching structure and timing. Add descriptions below the titles,
match the current-status copy, and allow taller cards on mobile for readable text.

## Graph design polish

User requested more visual design. Preserve the graph and exact labels; add a
workflow file icon and branch badge, a faint dot-grid canvas, layered card depth,
amber highlights for running jobs, green completion accents and small moving
signals along active dependencies. Frame the header and footer with light rules
and show a compact status legend on larger screens. No new assets or dependencies;
the existing reduced-motion bypass and 4.5-second deadline remain unchanged.

## Personal identity and visual hierarchy

User agreed to a stronger ending and said the composition still felt incomplete.
Add a restrained JT personal brand bar, larger job titles/descriptions and status
icons, and a full-size personal finale. At 3.2s the completed graph recedes and
“Hi, I’m Jayrald.” becomes the focal point with “I build web and mobile experiences.”
Use the homepage's display serif for the name and existing theme colors throughout.
Allow the finale to hold until the 4.6s exit and close at 5s. Keep the graph, labels,
Skip/Escape, reduced motion and the synchronous homepage handoff.

Validation: 65 Node tests pass. Browser checks cover both the workflow layout and
the personal finale at 320, 390, 768 and 1440px in light and dark themes. Adjusted
the title size at 320px to fit the larger type, inspected the desktop/mobile finale,
and verified automatic dismissal after the new five-second deadline.

## Approved full-screen workflow canvas

User chose the recommended full-screen canvas direction. Remove the large outer
graph panel and float the job cards directly across the homepage-colored viewport.
Add a faint oversized JT. typographic backdrop, move the personal brand to the
top edge, and keep workflow metadata small so the nodes carry the composition.
Illuminate completed connections as the run progresses. Preserve the exact four
labels, branching structure, mobile graph, five-second timing and personal finale.

Validation: 65 tests pass; workflow and finale browser checks pass at 320, 390,
768 and 1440px in both themes. Inspected desktop/mobile screenshots and confirmed
the real five-second startup dismisses correctly. A new presentation session key
lets an existing tab see this redesign once after reloading.
