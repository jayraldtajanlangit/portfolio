# Case-study introductions and spacing

Add a plain-language introduction beneath the existing summary on all five case-study pages. Describe each project's purpose and user flow using the existing project record. Keep Sige's Tasks and Insights explicitly identified as UI prototypes.

Retain the existing fonts, colors, walkthroughs, and sections. Remove title-block padding and the walkthrough's extra top margin. Use a consistent 24px gap between the introduction, project details, and walkthrough. Stack each dossier label above its value with a 4px gap; use two equal columns from 768px and natural stacked flow below that width. This removes the large horizontal label/value gaps without truncating technology lists.

The browser reproduction recorded the original 32px introduction-to-dossier and 48px dossier-to-media gaps. After the change, all 50 focused checks pass across all five pages, light/dark themes, and 320/390/768/1440/1820px widths: descriptions present, compact gaps, readable metadata, no horizontal overflow, and native video controls retained. Before/after screenshots at desktop, tablet, and phone widths were reviewed. All 45 existing tests pass and regeneration succeeds. Evidence is in `.taste-skill/case-intro/`.

## Walkthrough presentation follow-up

The final user preference is a plain video with rounded corners on every case-study page. Remove the colored panel, panel padding, and mobile phone mockups from the case-study renderer. Keep the heading and caption aligned with the video on the page background, with 16px corners on the video stage and native controls intact. Use page text colors so captions remain readable in both themes. Homepage previews retain their existing presentation.

SkyFire's zoom was baked into the MP4, so its camera track now stays full-frame and its polished export was regenerated. A regression test verifies that both desktop walkthroughs preserve the complete source screen throughout playback. All 46 tests and 50 browser checks pass; the latter cover every project in both themes at 320/390/768/1440/1857px, checking transparent backgrounds, zero outer padding, rounded corners, aligned headings/captions, native aspect ratios, controls, and no horizontal overflow. Screenshots were reviewed in `.taste-skill/walkthrough-framing/`.
