# Stacked tech categories and logo motion

Remove the sentence beside Tech stack, place Languages above Frameworks at every width, and give the existing seven local icons gentle motion. Keep labels, project links, hit targets and mobile layout intact.

The category container now has one column with a 24px row gap. Each logo floats up to 6px over 4.8 seconds with staggered negative delays. Only the decorative logo moves; links and tooltips retain stable positions. Hovering or focusing a category pauses its logos. Reduced-motion users get static logos, including when the preference changes while the page is open.

Verification: all 44 tests pass, including the new semantic toolkit test that failed before removing the introductory copy. All 20 browser checks pass across 320–3840px and both themes, covering category order, no overflow, icon assets, actual motion, hover/focus pause, reduced-motion changes, and no-JavaScript links. Screenshots reviewed at mobile and QHD sizes. Lint has zero failures/warnings; inspector has zero failures and the two previously documented font-sheet/glyph-margin warnings. Evidence: `.taste-skill/tech-stack-motion/`.
