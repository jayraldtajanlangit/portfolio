# Web and mobile hero composition

The user selected a composition of existing web/mobile projects over a portrait
for the homepage hero. Preserve the forest-and-ivory palette, serif name, all
project facts, project videos and the Source/Build/Test/Deploy workflow.

Use a layered SkyFire browser and Bulk Buying Companion phone, drawing their
existing local posters from project data. Link each preview to its case study.
Keep the introduction and actions together on the left, with the composition on
the right and a stacked layout on narrow screens. A quiet four-stage trail echoes
the intro. Add no looping hero animation, external images or extra video players.

Connect the intro's final name to the hero's first name with a short, optional
Web Animations transition during the existing 400ms exit. Keep the five-second
hard deadline, Skip, Escape, reduced-motion bypass and failure fallback. The
animation must never hold the page closed and must be cancelled during cleanup.

- [x] Add focused renderer and transition tests; verify their initial failures.
- [x] Build the shared hero component and responsive styling; integrate the
  existing entrance animation without hiding content when JavaScript is absent.
- [x] Add guarded name handoff, retain timed cleanup, and rebuild root index.html.
- [x] Run the Node suite, check responsive bounds/images/links in both themes,
  verify real intro handoff and reduced-motion behavior, and review screenshots.

Verification: 70/70 Node tests pass; the served homepage matches its renderer and
inline controller. Browser checks passed 17/17: six viewport widths (320, 390,
768, 1024, 1440, 1820) in both themes, loaded captures, usable case-study links,
keyboard focus, no overflow, all five existing videos, reduced motion and no-JS
content. The real intro animates the name at 390 and 1440 pixels, closes on its
existing schedule and leaves the completed hero visible. A geometry check caught
a 12px shift from vertically centering the copy while the typing line changed
height; anchoring the copy at the top brought the handoff error to 0px. Reviewed
final desktop and phone screenshots. Independent code review found no issues.

Follow-up: the hero's Source/Build/Test/Deploy trail now repeats a subtle mint
signal with four staggered dot pulses. The CSS-only effect keeps the existing
static trail for reduced motion. All 70 tests pass; five browser checks verified
signal movement, stage order, bounds in both themes at 320/1440 pixels and the
static reduced-motion state.
