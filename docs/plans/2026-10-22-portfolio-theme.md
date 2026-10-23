# Portfolio theme update

Recommendation: warm white, charcoal, and deep teal. This preserves the readable student portfolio and adds a calmer, less corporate identity. Alternatives considered: dark graphite for a more technical presentation and black-and-white for a minimal editorial presentation. Theme choice is a design judgment based on the existing projects and internship audience.

Keep the current contact-sheet composition (seed 1237347127), General Sans, real imagery, restrained motion, project order, and content. This is a palette update, not a new layout. No redraws or new images.

Palette: paper #f8f8f4, charcoal #232b28, secondary text #424c45, teal #176455, pale sage #e9eee7, inverse field #183d35. Use the accent on the whole introductory name and primary actions. Project screenshot backgrounds use quiet green surface tones.

Centralize colours in css/tokens.css and remove the homepage's competing blue overrides. Apply those same tokens to case studies and browser theme metadata. Check focus and hover colours as well as default text.

Verification: regenerate static pages, run existing tests, inspect the homepage at 1440/768/390 widths, review final screenshots, and run the existing local-browser navigation and responsive checks for all project pages. Retain the documented still-page and focal-point allowances for the restrained student design.

Contrast reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html requires 4.5:1 for normal text and 3:1 for large text. Check the actual chosen foreground/background pairs; theme choice alone does not establish accessibility conformance.

## Final review

ROUND 1
Seen in one second: a student developer with a teal name, restrained actions, and real application screenshots.
Idea (one sentence): the original application contact sheet gains a coherent warm-white, charcoal, and teal palette.
Live thing: screenshot project navigation and the existing user-controlled mAIstra walkthrough.
Layout words by section: hero=split-and-sheet / work=project-summaries / additional=compact-list / skills=definition-list / about=portrait-education-and-bio / contact=inverse-field.
Scores: design 7 · usability 8 · creativity 6 · content 8 → overall 7.2
Caps applied: deliberate low motion and a familiar portfolio composition, as in the preceding redesign.
Top three limitations:
1. The style inspector flags warm white as yellow-cream. Retained deliberately: this is the recommended low-saturation warm-white ground, paired with teal; the measured text and action contrast remains strong.
2. The project thumbnails in theme-final/mobile-fold.jpg serve navigation rather than detailed reading; full-width screenshots remain below and in case studies.
3. A résumé PDF and internship dates still need to be supplied. The theme does not add unconfirmed information.

Verification: regenerated all six HTML pages; 13 Node tests passed; 22 functional browser checks passed, including all case studies on desktop and phone, menu and keyboard behaviour, images, anchors, and no-JavaScript fallback. The final homepage inspector reports 0 failures and one intentional warm-white style warning at 1440/768/390, using the documented still-page and focal-point allowances. All seven inspector screenshots and two additional case-study captures were opened and reviewed. CSS and homepage source lint passed.

The six measured palette pairs range from 6.60:1 (teal heading on paper) to 13.63:1 (body text on paper); white button text on teal is 7.02:1. These exceed the 4.5:1 normal-text threshold. This verifies those palette pairs, not comprehensive WCAG conformance. See .taste-skill/theme-final/contrast.json for the measurements. No new photographs or sample content were used.
