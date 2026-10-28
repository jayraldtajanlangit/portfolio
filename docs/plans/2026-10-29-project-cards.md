# Project cards

Approved direction: apply the proposed card treatment to all five projects.
Use a subtle shared surface, role above the title, stronger project titles,
a compact highlighted contribution block, technology chips and a prominent
case-study link. Retain all project facts, video sources, ownership disclosures,
prototype limitations, autoplay accessibility and mobile phone frames.

Implementation: use the existing shared project renderer and selected-work CSS.
Frame web walkthroughs with a small decorative preview bar. Use restrained
per-project accents that adapt to homepage theme tokens. Preserve the two-column
web rows and three-column phone cards on desktop, with responsive stacked layouts.
Use CSS subgrid to align the mobile cards' role/title, summary, contribution, stack
and CTA without fixed text heights.

Validation: prove the role/title order and technology preservation in all five
rendered cards; run the Node suite; inspect the actual served page and all five
cards at desktop, tablet and phone widths in light and dark themes. Check preview
playback, keyboard access, text bounds and the three mobile CTA baselines. Rebuild
root index.html explicitly after renderer changes.

Verified: all 66 Node tests pass. The live homepage passed 15 browser checks,
including 320, 390, 768, 1024, 1440 and 1820 pixel layouts in both themes,
contained content, aligned desktop phone-card buttons, video playback and visible
keyboard focus. Reviewed desktop web cards, the three phone cards and the narrow
light-theme layout visually. Root index.html includes the updated renderer output.
