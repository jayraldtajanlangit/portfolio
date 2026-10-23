# Internship portfolio visual review

Direction: The contact sheet, seed 1237347127. No redraws. Its density is adapted to the existing documented preference for a restrained student portfolio. No stock photographs, generated illustrations, or sample education details were added. All pictures are the existing application captures and Jayrald's portrait.

Idea: Jayrald's booking, grading, and shared-purchase workflows become an application contact sheet with direct access to the work behind each image. The interactive elements are screenshot project jumps and the user-controlled mAIstra walkthrough.

ROUND 1
Seen in one second: a student developer with three web and mobile applications to inspect.
Idea (one sentence): the actual applications form the portfolio's project index.
Live thing: screenshot navigation and native video walkthrough.
Layout words by section: hero=split-and-sheet / work=project-summaries / additional=compact-list / skills=definition-list / about=portrait-and-bio / contact=inverse-field.
Scores: design 7 · usability 8 · creativity 6 · content 7 → overall 7.1
Caps applied: restrained motion limits design to 7; this remains a familiar portfolio composition, creativity 6.
Top three problems:
1. Tablet outer margins differ by a scrollbar gutter in internship-after/tablet-fold.jpg. Change the shared gutter to stable both-edges.
2. The introduction omits education in internship-after/desktop-fold.jpg. Add the program and school supplied in chat.
3. The About profile omits education in internship-after/desktop-page-02.jpg. Add a concise education block; leave year level and graduation date unspecified.

ROUND 2
Seen in one second: Jayrald, a Computer Science student applying for a software development internship, with real web and mobile work.
Idea (one sentence): application screenshots link directly to specific project contributions.
Live thing: screenshot project jumps and expandable, user-controlled walkthrough.
Layout words by section: hero=split-and-sheet / work=project-summaries / additional=compact-list / skills=definition-list / about=portrait-education-and-bio / contact=inverse-field.
Scores: design 7 · usability 8 · creativity 6 · content 8 → overall 7.2
Caps applied: deliberate low motion limits design to 7; familiar portfolio composition limits creativity to 6.
Top three remaining limitations:
1. Some thumbnail text is too small to read in internship-final/mobile-fold.jpg. The thumbnails are navigation; the full-width screenshots and case studies provide the readable detail.
2. The technology list is a long vertical section in internship-final/mobile-page-01.jpg. It retains specific project links rather than becoming an unsubstantiated list of proficiency claims.
3. No résumé download or internship dates appear in internship-final/desktop-page-02.jpg. Add the real PDF and dates when supplied; do not create an empty download or invent availability.

Verification:
- npm run render regenerated the homepage and all five case studies from their source data.
- npm test: 13 passed, 0 failed.
- Final browser inspector: 0 FAIL, 0 WARN at 1440, 768, and 390 pixels. Explicit still-page and focal-point allowances retain moderate type and low motion in accordance with the documented student-portfolio preference. This is not a claim that the unmodified theatrical motion criteria pass.
- Opened all seven final inspector screenshots, including all contact sheets and phone/tablet views.
- Functional browser check: homepage at 320, 390, 768, and 1440 pixels; five case studies at 390 and 1440 pixels; no overflow or broken images.
- Verified mobile menu opening, Escape and focus restoration, link dismissal, anchor targets, local case-study destinations, walkthrough expansion and native controls, and readable navigation/projects without JavaScript.
- Confirmed generated index.html matches renderHomePage().
- Final inspector also checked the reduced-motion view.
- Browser verification used a local HTTP server. No deployment or remote publication was performed.

The before inspector reported 2 failures (small focal point and low motion) and 2 warnings. The intermediate redesign reported 0 failures under the documented allowances and one scrollbar-gutter warning. The final version resolves that warning.

Education was supplied by the user. No year level, graduation date, start date, internship hours, or professional employment was inferred. Private and team source availability and Sige's Tasks/Insights prototype disclosure remain visible.

Career reference: [Harvard MCS portfolio guidance](https://careerservices.fas.harvard.edu/resources/portfolio-tools/) describes portfolios as a way to demonstrate skills and accomplishments in technical fields. The choice of layout and featured projects is a design judgment based on Jayrald's actual repository content.
