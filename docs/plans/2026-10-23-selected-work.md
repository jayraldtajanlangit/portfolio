# Selected work: approved split feature

The user approved a compact SkyFire feature with the screenshot on the left and the project details on the right, approximately 60/40. Follow it with mAIstra and Bulk Buying Companion side by side, then the existing remaining projects. Preserve the serif section heading, sans-serif project titles, real captures, ownership details, public-source availability, appearance modes, and reduced motion.

Use one shared renderer and stylesheet for the generated homepage and nested portrait preview. Stack screenshot above details on phones, use little framing around the screenshots, and keep each project's title, purpose, contribution, technologies, and links grouped together. Existing anchors into the three projects continue to work.

Verify correct relative paths for both entry points, honest source disclosures, preserved links and walkthrough, and the actual split/paired/stacked layout at desktop, tablet, and phone widths. Review the final screenshots in light and dark themes.

## Verification and critique

19 Node tests pass, including two new checks covering nested preview paths and source availability. Browser checks pass for font loading, heading wrapping, links, framing, and the approved responsive composition at 320, 390, 768, and 1440px. Screenshots of the actual selected-work section were reviewed in light, dark, and phone views, followed by every final inspector sheet. Both inspectors report no failures; the portrait preview retains its previously documented name-only-title warning. The existing eyebrow false positives and user-requested replacement fonts use the same documented inspector exceptions as the preceding typography pass.

The approved section replaces the original full-width screenshot and detached caption with a 60/40 feature. Frame padding is 12px on desktop and 8px on phones; the supporting pair follows after 40px on desktop and 32px on phones. Below 900px, the feature stacks to keep the capture readable. Below 700px, the supporting pair stacks as well. The original project anchors, real roles, private-source disclosures, and mAIstra walkthrough remain available.

ROUND 1
Seen in one second: a real booking interface with its developer's contribution beside it.
Idea (one sentence): Jayrald's application screens sit directly beside the record of what he built, so the work and ownership can be read together.
Live thing: case-study navigation, the existing on-demand walkthrough, and the existing typing and appearance controls.
Layout words by section: hero=portrait split / work=split feature then paired projects / about=education and prose / contact=dark closing field.
Scores: design 8.0 · usability 8.3 · creativity 7.0 · content 8.0 → overall 7.9.
Caps applied: creativity stays at 7 for a familiar editorial portfolio composition.
Top three findings:
1. The feature's contribution and action fit beside the capture at desktop width (`selected-work-dark.jpg`).
2. Narrow framing gives the actual interface more space while the two supporting projects remain aligned (`work-final/desktop-page-01.jpg`).
3. Phone layouts put each screenshot directly above its own details, with no horizontal overflow (`selected-work-phone.jpg`). No new imagery, invented results, or sample claims were introduced.

## Walkthrough update

At the user's request, the three primary screenshots are now direct video players using the existing SkyFire (13.2s), mAIstra (13s), and Bulk Buying Companion (11.04s) WebM clips. Native controls provide play, pause, seeking, and fullscreen; `playsinline` supports mobile, and metadata-only preload avoids fetching every full clip immediately. Posters supply the initial preview. Playback starts on request, which also respects reduced-motion preferences. The duplicate mAIstra walkthrough disclosure was removed. The featured/paired/stacked layout and project information are preserved.

Verification: 19 Node tests and 60 browser checks pass, including actual decoding and advancing playback for all three clips in both the generated homepage and portrait preview. Responsive layouts pass at four widths. The final portrait inspector reports zero failures and the previously documented name-only-title warning; every final desktop, tablet, and phone sheet was reviewed. The earlier editorial direction and critique remain applicable; real project video replaces real project stills without a composition redraw.
