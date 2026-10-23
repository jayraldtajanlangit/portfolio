# Large monitor responsiveness

User request: make the portfolio use large screens more effectively; the screenshot showed excessive side margins on a 27-inch monitor. The existing homepage stopped growing at 1400px regardless of viewport width.

The homepage now uses equal fluid gutters from 32px to 96px per side and a 3584px safety cap. Every homepage shell shares these edges, including navigation, hero, projects, technologies, about, contact and footer. Existing 20px mobile gutters remain. The homepage-scoped width leaves case-study reading layouts unchanged.

Mobile project frames grow from 272px toward a maximum 416px, constrained by their grid column. The hero name grows with large viewports; at 1600px and wider, project body/metadata/title sizes become 18/16/32px. Paragraph lengths remain bounded by their existing character measures. Desktop subgrid rows remain aligned and tablet/mobile layouts keep their natural reading order. Existing video fit, tap indicators, autoplay, focus and reduced-motion behavior remains intact.

Measured before/after:

| Viewport | Content width before → after | Side margin before → after | Phone width before → after |
| --- | --- | --- | --- |
| 1920px | 1400 → 1775px | 260 → 73px | 272 → 307px |
| 2560px | 1400 → 2376px | 580 → 92px | 272 → 410px |
| 3840px | 1400 → 3584px | 1220 → 128px | 272 → 416px |

Verification: 21 browser checks pass across 320/390/768/1024/1440/1920/2560/3440/3840px, both themes, reduced browser scaling, HiDPI, equal shell edges, no overflow, readable copy, aligned project rows and concurrent QHD preview playback. All 43 tests pass. Source lint has zero failures/warnings. The final four-width inspector reports zero failures and two explainable warnings: the existing stale font-sheet warning, and a glyph-percentile margin warning caused by paragraphs remaining narrower than their columns. Direct measurement confirms every shell has identical left/right edges. Desktop/QHD/phone screenshots were visually reviewed and focused read-only code review found no actionable issues. Evidence: `.taste-skill/large-screens/`.
