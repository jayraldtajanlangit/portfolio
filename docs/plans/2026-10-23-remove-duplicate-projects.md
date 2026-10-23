# Remove the duplicate hero project row

The user approved removing the three thumbnail shortcuts under the introduction. Selected projects now directly follows the introduction and remains the single complete presentation of all five projects. Keep the existing 72px separation between introductory content and the section heading. Remove unused index markup, renderer data, styles, and its motion selector.

Verification: rendered the site; 28 existing tests pass; source lint passes. Five focused browser checks pass: no duplicate row, five unique project articles and polished video sources, correct section order, no overflow at 320/390/768/1440px, and working View projects navigation. The anchor check initially assumed zero offset; investigation confirmed the existing global 32px scroll margin, which the corrected browser check measures. No navigation code change was needed. Final inspector: 0 failures and 0 warnings. All seven final viewport and page screenshots were opened.

ROUND 1
Seen in one second: a developer introduction followed immediately by a substantial SkyFire preview.
Idea (one sentence): give each project one clear place and let visitors reach the strongest work sooner.
Live thing: the existing guided walkthroughs and direct project navigation.
Layout words by section: hero=name and introduction split / work=lead feature and paired projects / toolkit=evidence rows / about=profile and prose / contact=invitation and email.
Scores: design 7.8 · usability 8.4 · creativity 7.0 · content 8.0 → overall 7.8.
Caps applied: creativity remains at 7 for the established editorial composition.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. The previous thumbnail row repeated the first three projects (user screenshot). Remove the entire row rather than hide it at a breakpoint.
2. The former row delayed the main work section on phones (mobile-fold.jpg). Selected projects now follows the introductory actions with the existing modest section spacing.
3. Unused renderer and style selectors could revive obsolete markup during later edits (source review). Remove the index function, its data, its CSS, and its entrance selector.

No new imagery, fonts, or motion effects were introduced. Existing project footage and case-study content remain in Selected projects.
