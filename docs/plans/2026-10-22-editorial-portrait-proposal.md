# Editorial portrait portfolio: design proposal

Status: visual concept for review. The live homepage and shared styles have not been changed by this proposal.

Confirmed choices: editorial portfolio, portrait-led introduction. Audience remains web and mobile software development internship reviewers. Education is Computer Science at the University of San Jose Recoletos. Use the existing black-and-white portrait without editing its pixels.

Concept: Jayrald's studio portrait becomes the opening magazine photograph; his actual applications become large plates paired with specific ownership notes. The photograph's left-facing gaze sits on the right of the desktop opening, facing the introduction.

Desktop opening: concise navigation; generous two-column introduction; Gambarino serif name set on two lines; General Sans for the developer focus, student introduction, and links; large rectangular portrait on the right. White and charcoal with one restrained slate interaction colour. Keep the image, title, and actions visible without decorative scroll effects.

Phone opening: portrait first, then name, role, student introduction, and actions. Crop the image with CSS, retaining its original file. Use normal document flow and visible content without JavaScript.

Work: remove the duplicated thumbnail strip. Feature SkyFire at full width with its ownership and technical contribution directly beneath it. Follow with an unequal two-column pairing of mAIstra and Bulk Buying Companion. Use secondary links for Pulso and Sige, retaining the full existing case studies. Keep prototype and source availability disclosures in the implementation.

About: a short account of individual/team work, education, internship motivation, and technologies linked to evidence in the final implementation. Add a résumé action only when a real PDF is supplied.

Contact: a charcoal closing field with a short invitation, the actual email address, GitHub, and LinkedIn. Keep the opening focused on project and email actions.

Architecture if approved: retain the static renderer and shared project records; replace homepage composition and styling, propagate the new typography/palette into case studies, and keep existing media/navigation behaviour. No new backend or dependencies. Verify generated output, all project routes, ownership/prototype honesty, keyboard navigation, mobile menu, images, no-JavaScript fallback, reduced motion, and responsive layouts.

Art direction: printed annual, seed 573972893. Existing user choices fix the palette/type. The dealt mosaic masthead is adapted to the explicitly selected portrait-led opening; unrelated architecture photographs and the scroll spectacle are omitted. No fabricated achievements, education dates, internship dates, or résumé assets.

Reviewable mockup: .taste-skill/editorial-concept/index.html. This standalone concept demonstrates hierarchy, composition, imagery, and content density; it does not replace the generated homepage.

## Visual review

ROUND 1
Seen in one second: Jayrald's monochrome portrait and name, with web/mobile development and internship intent.
Idea (one sentence): the existing studio portrait opens the portfolio as a magazine profile, followed by large application plates.
Live thing: project navigation and actual contact destinations; native mAIstra walkthrough added in refinement.
Layout words by section: intro=portrait-and-profile / work=large-plate-and-unequal-pair / about=two-column-profile / contact=charcoal-close.
Scores: design 7 · usability 7 · creativity 7 · content 8 → overall 7.1 before inspection cap.
Caps applied: initial automated findings limit the initial inspection to 6.0.
Top three problems:
1. review/tablet-page-01.jpg: education is buried in the right column, leaving the left underused. Move education alongside the About heading.
2. review/mobile-fold.jpg: the opening mixes project/contact actions and social links. Move the social links into Contact and clarify the role statement.
3. review/desktop-fold.jpg: the near-white ground has a warm tint despite the chosen white/charcoal direction. Use pure white.

FINAL ROUND
Seen in one second: an identifiable student developer, a prominent real portrait, and direct project/contact actions.
Idea (one sentence): the portrait anchors a personal editorial profile; application captures carry the evidence below.
Live thing: native mAIstra walkthrough, project links, and email contact.
Layout words by section: intro=portrait-and-profile / work=large-plate-and-unequal-pair / about=education-and-bio / contact=charcoal-close.
Scores: design 7 · usability 8 · creativity 7 · content 8 → overall 7.4
Caps applied: low motion deliberately retained for the previously documented student-portfolio preference; familiar editorial composition limits creativity to 7.
Top three remaining considerations:
1. The portrait leads on mobile and gives projects their own following screen. This follows the user's chosen introduction priority.
2. Three phone captures are previews; full case studies retain larger screenshots for detailed inspection.
3. Résumé, graduation date, and internship availability still require actual supplied content.

Verification: source lint passes. Desktop and tablet renders in verified/ have no findings at their widths; the only remaining finding there was the phone primary action being mistaken for a label above the work heading. Increase phone section separation to 96px; the final 390px inspection in mobile-spacing/ reports 0 failures and 0 warnings. The last edit affects only widths below 700px, so desktop/tablet composition and screenshots remain current. Retain the documented still-page allowance, with no other allowances. Opened every final desktop/tablet image and both final phone images, including the full-page sheets. All fonts loaded, name/headings fit two lines, and the existing portrait and application imagery render. No stock or generated pictures were added. No new sample education or achievements were added.

Only the standalone concept and these notes changed in this brainstorming step. Implementation in scripts/render-home.mjs and shared production styles remains pending design review.
