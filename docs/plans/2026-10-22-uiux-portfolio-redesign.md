# UI/UX portfolio redesign

Goal: make Jayrald's full-stack and mobile work easy for employers to evaluate.

Architecture: retain the static HTML generator and project data. Extract homepage rendering; regenerate all six pages. Reuse navigation and media behavior, preserve detailed evidence on case studies, and update the shared visual system.

Design: The split stage, seed 829093555. Jayrald's instructor-review and mobile workflows become the demonstration beside his introduction. The live element is the playable mAIstra walkthrough. Use Gambarino / General Sans, bottle green and gold, with ivory reading surfaces. Existing media only. Adapt the contact blueprint to actual email and social links because no form backend exists.

Audience assumption: employers, consistent with the existing brief. An asynchronous question was sent.

Subject inventory: Jayrald Tajanlangit; Philippines; mAIstra submissions; Judge0; SkyFire booking; SQLite lock limitation; Flutter; Supabase; cooperative purchases; Pulso saved posts; Sige prototypes; portrait.

Page argument:
- Introduction: Full-stack & mobile engineer. Proof: mAIstra video. Action: View my work.
- Selected work: five real products, ownership notes, stack, case-study and available source links. Keep prototypes explicit.
- About: interface and backend experience, portrait, location, and skills linked to project evidence.
- Contact: Let's build something useful. Email, GitHub and LinkedIn.

Implementation:
1. Test accessible navigation, real destinations, ownership, source links and prototype disclosure; confirm failure.
2. Extract homepage renderer; implement split hero, work index, about/skills and contact.
3. Update shared tokens/fonts and expose repository disclosures in case studies.
4. Regenerate, run node --test, inspect desktop/tablet/mobile and check interactions.
5. Deliver local changes and content checklist. Never invent credentials, dates, metrics or a résumé.

UI/UX Pro Max: 44px targets, 16px+ body, visible focus, semantic navigation, descriptive alt text, reduced motion, stable hover and contrast checks. Installed scripts/data entries are text placeholders pointing to absent source directories, so database search is unavailable.

Content still needed:
1. Current résumé PDF, experience/internships, degree and graduation date.
2. Project dates, duration, team size and deployment status.
3. Public demos or accessible recordings where source is private.
4. Verified outcomes: tests, response times, users or before/after task results.
5. Preferred roles, work arrangements and availability date.
6. Optional genuine collaborator testimonials with permission.

Rationale: prioritize evidence and ownership over an exhaustive screenshot wall. NN/g recommends role, constraints, timeline, process and outcomes in UX portfolios; applying that here is an engineering-portfolio design judgment: https://www.nngroup.com/articles/ux-design-portfolios/
