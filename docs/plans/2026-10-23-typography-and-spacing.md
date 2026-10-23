# Typography and spacing polish

Preserve the approved portrait-led editorial composition (The printed annual, seed 573972893) and monochrome preview palette. Replace Gambarino / General Sans with locally served Bodoni Moda for the name and section headings, and Manrope for body, navigation, project titles, and controls. The typography change responds directly to the user's request for a less generic appearance; no composition redraw is needed.

The portrait introduces Jayrald; real application screens demonstrate the work; ownership copy explains his contributions; education and contact finish the page. Preserve the existing projects, links, typing, appearance menu, and reduced-motion behavior.

Reduce the desktop project-to-project gap from 96px to 48px, the preview frame padding from 48px to 24px, and the mobile hero-to-project gap from 96px to 48px. Bring captions closer to screenshots, give project names a distinct weight, and tighten secondary project, about, and footer spacing. Apply the same fonts and hierarchy to the generated homepage and case studies.

Verify font loading without external services, text wrapping, four responsive widths, both color modes, project links, typing stability, and menu operation. Review full-page desktop and phone screenshots before delivery.

## Verification

17 Node tests pass. Browser verification passes 43 typography, layout, asset, and link checks; 21 motion checks; and 40 appearance-menu checks. Both fonts load with outside services blocked. All homepage and case-study headings fit within two lines at 320, 390, 768, and 1440px. The portrait preview's desktop project gap measures 48px, screenshot padding 24px, and caption spacing 20px. Its measured length falls from 3.9 to 3.3 desktop screens.

Final inspectors: portrait preview 0 failures / 1 warning; generated homepage 0 failures / 0 warnings. The preview's existing name-only-title heuristic remains: the visible introduction identifies Jayrald as a Computer Science student at 16px, below the inspector's 18px identification threshold. Retain the user's requested name and typing introduction. `font-not-dealt` is excluded because the user explicitly requested new typography; `eyebrow` is excluded because the measured candidates are the working hero action and project-navigation links, not labels above headings. No genuine eyebrow was introduced, and the smaller spacing is intentional.

ROUND 1
Seen in one second: the name and portrait, followed by real application screenshots.
Idea (one sentence): Jayrald's studio portrait and high-contrast name introduce the person, while the actual interfaces form an edited record of his development work.
Live thing: the existing typing introduction and animated Light / Dark / System menu.
Layout words by section: hero=portrait split / work=featured screen then paired screens / about=education and prose / contact=dark closing field.
Scores: design 8.0 · usability 8.0 · creativity 7.0 · content 8.0 → overall 7.8.
Caps applied: creativity is limited to 7 because the editorial portrait approach remains a known portfolio convention.
Top three findings after reviewing every final desktop, tablet, and phone sheet:
1. The preview's original 96px project break is now 48px; related screenshots and captions form clearer groups (`polish-final/desktop-page-01.jpg`).
2. The body font, semibold project titles, and display serif now have distinct roles; the two local faces render successfully (`polish-final/desktop-fold.jpg`).
3. The generated homepage keeps its earlier composition, while the portrait preview keeps the user's selected composition; they share fonts and controls but remain separate layouts. No new sample content or imagery was introduced.
