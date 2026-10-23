# Portfolio design review

Implemented locally using UI/UX Pro Max's accessible layout and interaction guidance. Its installed CLI is unavailable because its scripts/data entries point to missing source directories. No packages or skills were installed.

Direction: The split stage, seed 829093555. No redraws. The green/gold introduction pairs Jayrald's role with his actual mAIstra walkthrough. Neutral reading surfaces adapt the palette for long-form project evaluation. Contact uses working email/social destinations rather than the dealt input form, because no backend exists. All photographs, screenshots and video are existing portfolio assets; no stock or generated placeholders were added.

ROUND 1
Seen in one second: a full-stack/mobile engineer and an instructor code-review interface.
Idea (one sentence): Jayrald's real product workflows sit beside the explanation of what he builds.
Live thing: user-controlled mAIstra walkthrough, with screenshots and a case-study fallback.
Layout words by section: hero=split / work=index / about=portrait-and-bio / skills=definition-list / contact=statement.
Scores: design 7 · usability 7 · creativity 7 · content 7 → overall 7.0 before cap.
Caps applied: initial tablet headline wrapped to three lines; initial inspector failures capped score at 6.0.
Top three problems:
1. Tablet heading broke across three lines in uiux-review/tablet-fold.jpg. Give the introduction one column at intermediate widths.
2. Body font fell back to Arial. Fontshare returned only Gambarino for the combined request; split into two stylesheet requests.
3. Case-study system panel inherited light text after a light background override. Restore the dark green field and verify it visually.

ROUND 2
Seen in one second: a clear professional role in gold beside actual product evidence.
Idea (one sentence): real grading, reservation, cooperative purchase, social and coaching work is the portfolio's visual material.
Live thing: playable walkthrough with native controls and no autoplay.
Layout words by section: hero=split / work=index / about=portrait-and-bio / skills=definition-list / contact=statement.
Scores: design 7.5 · usability 8 · creativity 7 · content 7.5 → overall 7.6.
Caps applied: creativity 7; the composition is a recognizable portfolio approach, distinguished primarily by the work itself.
Remaining limitations:
1. Three phone screenshots become small previews on mobile. Each links to the full case study, where larger captures are available.
2. The skills section has more whitespace on desktop than the project index; it deliberately keeps stack-to-project evidence in a single reading column.
3. Résumé, education/experience, project timelines and measured outcomes require factual content from Jayrald.

Verification:
- Render completed; 13 node tests passed.
- All six pages checked at 375, 768, 1024 and 1440px: no horizontal overflow, broken loaded images or JavaScript exceptions.
- Mobile menu opens, Escape closes and restores focus, and section links close the menu.
- Without JavaScript, navigation, five project entries and video controls remain available.
- Reduced motion: no active animations and no automatically playing homepage video.
- Internal links, anchors, image/video and stylesheet paths resolve locally.
- Final homepage inspector at 1440, 768 and 390px: 0 failures, 3 warnings. Both fonts loaded.
- Screenshots reviewed for all homepage widths and representative desktop/mobile case studies.
- Case-study screenshot review found an inherited alternating-column rule shrinking the middle capture; all desktop workflow steps now use the larger media column.
- Separate agent review was requested but never started; it is not counted as completed validation.

Inspector warning assessment:
- Mixed font: the media caption deliberately has a serif title and a separate sans-serif descriptive line, not a mixed-font headline.
- Size count: fluid sizes create several sampled values across hero, section, project and metadata roles. The hierarchy is readable but could be reduced further.
- Margin estimate: measured global bounds combine the inset demo panel with centered text shells and the native scrollbar. Text column edges align; this is an intentional split composition.

Content priorities before job applications:
1. Add a real downloadable résumé, experience/internships, education and graduation date.
2. Add project dates, duration, team size and current status.
3. Link working public demos where possible; retain honest private-source labels.
4. Record outcomes you can substantiate: usability findings, test coverage, response time or real adoption. Do not invent percentages or user counts.
5. Specify preferred roles, remote/on-site preference and start availability.

Related guidance: [NN/g: 5 Steps to Creating a UX-Design Portfolio](https://www.nngroup.com/articles/ux-design-portfolios/) recommends explaining role, constraints, timeline, process and results. It concerns UX hiring; applying those evidence principles to this engineering portfolio is a design recommendation.
