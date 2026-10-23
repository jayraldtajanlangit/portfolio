# All five projects in Selected work

Keep the approved portrait-led editorial direction (The printed annual, seed 573972893). Lead with SkyFire, then show mAIstra, Bulk Buying Companion, Pulso, and Sige in a two-column supporting grid that becomes a single column on phones. This preserves a clear lead while making the full range of web and mobile work directly inspectable. A carousel would hide projects again; five full-width features would add unnecessary scrolling.

Promote Pulso and Sige from small additional links to complete articles with walkthroughs, summaries, ownership, contributions, technologies, case-study links, and public source links. Remove duplicate additional-project sections. Retain Sige's prototype disclosure next to its walkthrough description and in the contribution summary.

Use the existing staggered scroll entrances and attention-based playback controller for all five projects. Add restrained directional feedback to case-study links with a reduced-motion fallback. Render separate Pulso and Sige videos with authored cursor guidance and modest eased camera movement; preserve original recordings. No new external imagery or assets are used.

## Verification

25 Node tests pass. Before implementation, expanded Selected work tests failed on the missing projects and count. The final renderer provides all five videos and case-study paths from both entry points, including Sige's prototype status.

64 browser checks pass for fonts, decoded videos, destinations, readable headings, no overflow at 320/390/768/1440px, and the complete four-item supporting grid. 53 playback checks pass, including Pulso and Sige hover/leave and visible mobile autoplay, single active playback, keyboard operation, manual pause, reduced motion, fullscreen, and background-tab pause.

FFprobe verifies the new videos are 390×844 H.264 at 60fps; Pulso is 8.88s and Sige is 8.4s. Both rendered frame sheets were visually reviewed. Final desktop, tablet, and mobile inspector screenshots were opened. Inspector: 0 failures; the existing name-only-title warning remains defensible because the visible introduction identifies Jayrald as a Computer Science student and describes his applications. Source lint: 0 failures and 0 warnings.

ROUND 1
Seen in one second: a portrait-led developer portfolio followed by a prominent booking app and four accessible supporting projects.
Idea (one sentence): demonstrate the breadth of Jayrald's development work through actual guided application workflows and specific contributions.
Live thing: hover or keyboard focus previews a project on desktop; the visible project previews on touch devices.
Layout words by section: hero=portrait split / work=lead feature and two paired rows / about=education and prose / contact=closing field.
Scores: design 7.8 · usability 8.2 · creativity 7.0 · content 8.0 → overall 7.8.
Caps applied: creativity remains at 7 for the established editorial composition.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Phone footage is small inside the landscape supporting media fields (desktop-page-01.jpg). Retain fullscreen and guided zoom; enlarging every mobile player would expand a section the user asked to keep compact.
2. Sige has more explanation than Pulso (additional-selected-work.jpg). Keep the explicit prototype disclosure: truthful presentation takes priority over matching text heights.
3. The five-project section is necessarily longer on phones (mobile-page-01.jpg). Keep the compact spacing and direct case-study links; hiding projects in a carousel would reverse the requested visibility improvement.
