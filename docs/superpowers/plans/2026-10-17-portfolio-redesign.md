# Recruiter-Focused Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy neon portfolio with a fast editorial site that presents five verified projects through static recruiter-friendly case studies and real project media.

**Architecture:** A zero-dependency Node build script renders committed static HTML from one project-data module, so core content remains available without client JavaScript. Modular CSS provides the editorial design system; small ES modules progressively enhance navigation and viewport-aware media playback.

**Tech Stack:** Semantic HTML5, CSS, browser ES modules, Node 25 built-in `node:test`, PowerShell/Flutter/Angular/Django project tooling for media capture, FFmpeg or native Android recording where available.

**Spec:** `docs/plans/2026-10-17-portfolio-redesign-design.md`

## Global Constraints

- Target recruiters and hiring managers; position Jayrald as a full-stack and mobile engineer with AI as a supporting capability.
- Project order is exactly: mAIstra, SkyFire, Bulk Buying Companion, Pulso, Sige.
- Do not mention BookSphere, RideGauge, Automated Video Captioning, Balayan, PlantDito, or unsupported statistics/history.
- Use Newsreader, IBM Plex Sans, and IBM Plex Mono with resilient local fallbacks.
- Use warm paper, deep ink, muted olive-gray, vermilion, and dark charcoal media frames; no neon/glitch styling.
- Keep the site usable without client JavaScript.
- Respect `prefers-reduced-motion`; never make hover the only path to information.
- Use real repository evidence for claims and distinguish Jayrald's work from team scope.
- Keep source links only where public access is verified; label private/team repositories honestly.
- Do not copy credentials, `.env` files, service-role keys, or private project source into the portfolio.

## Review Focus

1. **JavaScript unavailable:** all project summaries, navigation, contact links, and case-study content remain in committed HTML; Task 2 and Task 4 render tests pin this behavior.
2. **Reduced motion or media failure:** previews never autoplay and poster/caption content remains visible; Task 3 media-policy tests pin this behavior.
3. **Untrusted project copy:** renderer escapes `<`, `>`, `&`, quotes, and apostrophes; Task 1 renderer tests pin this behavior.
4. **Broken or escaping local paths:** every local reference resolves inside the portfolio and exists with exact casing; Task 7 integrity tests pin this behavior.
5. **Overstated ownership or unfinished features:** case-study copy matches audited repository evidence and labels prototypes/private branches; Task 4 content assertions pin the critical statements.

---

### Task 1: Zero-Dependency Test Harness, Project Data, and Renderer Primitives

**Files:**
- Create: `package.json`
- Create: `js/projects.js`
- Create: `scripts/render-utils.mjs`
- Create: `test/project-data.test.mjs`
- Create: `test/render-utils.test.mjs`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `projects: Project[]`, `contacts`, `site`; `getProject(slug)`; `escapeHtml(value)`; `renderAttrs(attributes)`.
- Consumes: approved project order, contact links, audited repository evidence, and the design spec.

- [ ] **Step 1: Write failing project-data tests**

Assert exactly five unique projects in the approved order; required typed fields; exact contact links; repository status from `public | private | team`; HTTPS source URLs only when accessible; planned poster/video/still paths; and absence of excluded projects and unsupported claims.

- [ ] **Step 2: Run project-data tests and verify RED**

Run: `npm test -- test/project-data.test.mjs`  
Expected: FAIL because `package.json` and `js/projects.js` do not exist.

- [ ] **Step 3: Add the minimal package script and verified project records**

Create an ESM-only `package.json` with `test: node --test` and `render: node scripts/render-site.mjs`. Implement the five audited project records, including explicit `ownership`, `repositoryStatus`, `contribution`, `decisions`, `workflow`, and planned `media` fields. Add `.capture/` and generated capture scratch files to `.gitignore`.

- [ ] **Step 4: Run project-data tests and verify GREEN**

Run: `npm test -- test/project-data.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Write failing renderer-primitive tests**

Assert escaping for `<script>`, ampersands, double/single quotes, and safe attribute omission for `null`/`undefined` values.

- [ ] **Step 6: Run renderer tests and verify RED**

Run: `npm test -- test/render-utils.test.mjs`  
Expected: FAIL because renderer helpers do not exist.

- [ ] **Step 7: Implement renderer primitives and verify GREEN**

Implement `escapeHtml(value: unknown): string` and `renderAttrs(attributes: Record<string, unknown>): string`; rerun both Task 1 test files and expect PASS.

- [ ] **Step 8: Commit Task 1**

```powershell
git add portfolio/package.json portfolio/.gitignore portfolio/js/projects.js portfolio/scripts/render-utils.mjs portfolio/test/project-data.test.mjs portfolio/test/render-utils.test.mjs
git commit -m "test: establish portfolio content contract"
```

### Task 2: Editorial Design System and Static Homepage

**Files:**
- Create: `css/tokens.css`
- Create: `css/global.css`
- Create: `css/home.css`
- Create: `scripts/render-site.mjs`
- Create: `test/home-render.test.mjs`
- Modify (generated): `index.html`
- Delete after replacement: `design.css`, `index.js`, `style.css.bak`

**Interfaces:**
- Consumes: `projects`, `contacts`, `site`, `escapeHtml`, `renderAttrs` from Task 1.
- Produces: `renderHomePage(): string`, committed `index.html`, shared header/footer/project-dossier markup, and editorial CSS tokens.

- [ ] **Step 1: Write failing homepage-render tests**

Assert unique title/description/Open Graph metadata; one `h1`; Work/About/Contact landmarks; all five project titles and case-study links; exact contact URLs; portrait alt text; static project summaries; and no excluded names, fake metrics, Writing, Timeline, glitch, or inert `href="#"` actions.

- [ ] **Step 2: Run homepage-render test and verify RED**

Run: `npm test -- test/home-render.test.mjs`  
Expected: FAIL against the legacy homepage.

- [ ] **Step 3: Implement the homepage renderer and editorial styles**

Render semantic static HTML with the approved hero, portrait, numbered project chapters, dossier strips, capabilities, About, and Contact. Implement warm paper/ink/vermilion tokens, asymmetric layouts, dark media frames, typography fallbacks, visible focus, 44px targets, and responsive behavior at 375/768/1024/1440 widths.

- [ ] **Step 4: Render the site and verify GREEN**

Run: `npm run render` then `npm test -- test/home-render.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Remove superseded legacy files and run all tests**

Delete only `design.css`, `index.js`, and `style.css.bak` after confirming `index.html` no longer references them. Run `npm test`; expected all tests PASS.

- [ ] **Step 6: Commit Task 2**

```powershell
git add -A portfolio/index.html portfolio/css portfolio/scripts/render-site.mjs portfolio/test/home-render.test.mjs portfolio/design.css portfolio/index.js portfolio/style.css.bak
git commit -m "feat: build editorial portfolio homepage"
```

### Task 3: Accessible Viewport-Aware Project Media

**Files:**
- Create: `js/media.js`
- Create: `js/site.js`
- Create: `test/media-policy.test.mjs`
- Modify: `scripts/render-site.mjs`
- Modify: `css/global.css`
- Modify (generated): `index.html`

**Interfaces:**
- Produces: `decideMediaAction({ reducedMotion, intersecting, documentVisible, failed }): 'play' | 'pause' | 'fallback'`; `applyMediaAction(video, action)`; `initProjectMedia(root, options)`; `initNavigation(root)`.
- Consumes: media paths from `projects` and the generated `.project-media` markup.

- [ ] **Step 1: Write failing media-policy tests with hand-written fakes**

Cover visible/muted playback, offscreen pause, hidden-document pause, reduced-motion no-play, rejected `play()` fallback, media-error fallback, idempotent teardown, and repeated intersection events.

- [ ] **Step 2: Run media-policy tests and verify RED**

Run: `npm test -- test/media-policy.test.mjs`  
Expected: FAIL because `js/media.js` does not exist.

- [ ] **Step 3: Implement the minimal media state machine and DOM integration**

Use `IntersectionObserver`, `visibilitychange`, `matchMedia('(prefers-reduced-motion: reduce)')`, guarded `video.play()`, and an explicit fallback class. Do not add unconditional `autoplay`.

- [ ] **Step 4: Render accessible media markup**

Each preview must include `muted`, `loop`, `playsinline`, `preload="metadata"`, poster, intrinsic dimensions/aspect ratio, a visible caption, and a still-image fallback. Add keyboard-safe mobile navigation in `js/site.js`.

- [ ] **Step 5: Verify GREEN and regression suite**

Run: `npm run render` then `npm test`  
Expected: all tests PASS with no unhandled promise rejection.

- [ ] **Step 6: Commit Task 3**

```powershell
git add portfolio/js/media.js portfolio/js/site.js portfolio/css/global.css portfolio/scripts/render-site.mjs portfolio/index.html portfolio/test/media-policy.test.mjs
git commit -m "feat: add accessible project media playback"
```

### Task 4: Five Evidence-Backed Case-Study Pages

**Files:**
- Create: `css/case-study.css`
- Create: `test/case-studies.test.mjs`
- Modify: `js/projects.js`
- Modify: `scripts/render-site.mjs`
- Create (generated): `projects/maistra.html`
- Create (generated): `projects/skyfire.html`
- Create (generated): `projects/bulk-buying-companion.html`
- Create (generated): `projects/pulso.html`
- Create (generated): `projects/sige.html`

**Interfaces:**
- Consumes: Task 1 project records and Task 3 media markup.
- Produces: `renderCaseStudy(project, nextProject): string` and five committed static pages with circular next-project navigation.

- [ ] **Step 1: Write failing case-study tests**

Assert five files, unique metadata, exactly one `h1`, home and next-project links, purpose/problem/contribution/architecture/decisions/workflow/stack/repository sections, static content without JavaScript, valid heading order, and project-specific truth markers: mAIstra team ownership and Judge0/Supabase work; SkyFire private solo ownership and transactional seat locking; Bulk team ownership and Jayrald's barcode/auth/hub/realtime slices; Pulso team ownership and Jayrald's social/realtime work; Sige solo ownership with Tasks/Insights clearly labelled prototype where applicable.

- [ ] **Step 2: Run case-study tests and verify RED**

Run: `npm test -- test/case-studies.test.mjs`  
Expected: FAIL because the case pages do not exist.

- [ ] **Step 3: Expand project records with concise evidence-backed narratives**

Use audited repository facts only. Avoid commit-count-as-impact claims, unsupported product outcomes, and claims that Jayrald authored teammates' OCR/receipt work.

- [ ] **Step 4: Implement the case-study renderer and styles**

Render project hero, dossier, problem, contribution, system view, decisions, workflow media gallery, repository disclosure, and next-project footer. Use the shared design tokens and a readable 65–75 character text measure.

- [ ] **Step 5: Render pages and verify GREEN**

Run: `npm run render` then `npm test`  
Expected: all tests PASS.

- [ ] **Step 6: Commit Task 4**

```powershell
git add portfolio/js/projects.js portfolio/scripts/render-site.mjs portfolio/css/case-study.css portfolio/projects portfolio/test/case-studies.test.mjs portfolio/index.html
git commit -m "feat: add five engineering case studies"
```

### Task 5: Capture and Integrate mAIstra and SkyFire Media

**Files:**
- Create: `assets/images/projects/maistra/*`
- Create: `assets/videos/maistra.webm`
- Create: `assets/images/projects/skyfire/*`
- Create: `assets/videos/skyfire.webm`
- Create: `test/flagship-media.test.mjs`
- Modify: `js/projects.js`
- Modify (generated): `index.html`, `projects/maistra.html`, `projects/skyfire.html`

**Interfaces:**
- Consumes: planned media paths from Task 1 and media markup from Task 3.
- Produces: real poster, 2–3 stills, and 8–15 second loop for each flagship project.

- [ ] **Step 1: Write failing flagship-media integrity tests**

Assert nonempty real image/video files, valid PNG/JPEG/WebP/WebM magic bytes, maximum documented file sizes, matching project-data paths, and absence of credentials/source archives.

- [ ] **Step 2: Verify RED**

Run: `npm test -- test/flagship-media.test.mjs`  
Expected: FAIL because the captures are absent.

- [ ] **Step 3: Capture mAIstra from its fake-backed teacher workflow**

Use `maistra_web/tests/e2e/teacher-workflow.spec.ts` and installed Chrome where possible. Record Submissions → Review code → Run & grade → 100% result. Use branch `judge0-integration`; do not imply OCR ownership.

- [ ] **Step 4: Capture SkyFire from a local seeded environment**

Clone the private repository into ignored `.capture/` if needed, install the documented Angular/Django dependencies, seed one flight and user, then record Flights → seat/add-ons → Confirm Booking → My Bookings. Do not expose the private repository URL as a public source action.

- [ ] **Step 5: Optimize and integrate the files**

Crop consistently, remove audio, target an 8–15 second loop, preserve readable UI text, create posters/stills, update project data, and rerender.

- [ ] **Step 6: Verify GREEN and commit**

Run: `npm run render` then `npm test`; expected all tests PASS.

```powershell
git add portfolio/assets/images/projects/maistra portfolio/assets/videos/maistra.webm portfolio/assets/images/projects/skyfire portfolio/assets/videos/skyfire.webm portfolio/js/projects.js portfolio/index.html portfolio/projects portfolio/test/flagship-media.test.mjs
git commit -m "feat: add flagship project walkthroughs"
```

### Task 6: Capture and Integrate Bulk Buying Companion, Pulso, and Sige Media

**Files:**
- Create: `assets/images/projects/bulk-buying-companion/*`
- Create: `assets/videos/bulk-buying-companion.webm`
- Create: `assets/images/projects/pulso/*`
- Create: `assets/videos/pulso.webm`
- Create: `assets/images/projects/sige/*`
- Create: `assets/videos/sige.webm`
- Create: `test/mobile-media.test.mjs`
- Modify: `js/projects.js`
- Modify (generated): `index.html`, three matching case-study pages

**Interfaces:**
- Consumes: planned media paths and the approved mobile interaction stories.
- Produces: real poster, 2–3 stills, and 8–15 second loop per mobile project, plus honest demo/prototype labels.

- [ ] **Step 1: Write failing mobile-media integrity tests**

Assert the same file signatures/size/path constraints as Task 5 and require captions to identify UI-only/prototype captures where live services were unavailable.

- [ ] **Step 2: Verify RED**

Run: `npm test -- test/mobile-media.test.mjs`  
Expected: FAIL because mobile captures are absent.

- [ ] **Step 3: Capture Bulk Buying Companion**

Do not modify or discard its dirty checkout. Use its existing configured environment only if the owner state is reproducible; otherwise run a repository-supported test/demo state. Record Split Board → deal → reserve share and capture barcode/receipt entry as a still. Attribute receipt OCR to the team and barcode extension to Jayrald.

- [ ] **Step 4: Capture Pulso**

Use the public/main-supported feed flow rather than unreleased DM screens. Record Feed carousel → like/bookmark → Profile Saved. Resolve the `SUPABASE_PUBLISHABLE_KEY` naming mismatch without committing credentials.

- [ ] **Step 5: Capture Sige**

Prefer Chat quick reply → realtime coach response → Tasks tab when the backend is stable within 15 seconds. Otherwise record the deterministic Tasks prototype flow and label it `UI prototype`; do not describe static Tasks/Insights as live data.

- [ ] **Step 6: Optimize, integrate, and verify GREEN**

Use Android/native recording where possible, remove audio, generate posters/stills, update data, rerender, and run `npm test`; expected all tests PASS.

- [ ] **Step 7: Commit Task 6**

```powershell
git add portfolio/assets/images/projects portfolio/assets/videos portfolio/js/projects.js portfolio/index.html portfolio/projects portfolio/test/mobile-media.test.mjs
git commit -m "feat: add mobile project walkthroughs"
```

### Task 7: Repository Integrity, Accessibility, Responsive, and Performance Verification

**Files:**
- Create: `test/site-integrity.test.mjs`
- Create: `docs/verification/portfolio-redesign.md`
- Modify as required by failures: `css/*.css`, `js/*.js`, `scripts/*.mjs`, generated HTML, media assets

**Interfaces:**
- Consumes: the complete rendered site and all media.
- Produces: a passing integrity suite and a verification record with commands/results and any documented external capture blocker.

- [ ] **Step 1: Write failing whole-site integrity tests**

Walk every local `href`, `src`, `poster`, and `source`; assert the normalized target stays inside the portfolio, exists with exact casing, is nonempty, and is not orphaned. Reject duplicate IDs, missing fragments, backslashes, empty URLs, `href="#"`, `.env`, credentials, `.bak`, `.tmp`, build/cache files, obsolete legacy references, and local media above the documented thresholds.

- [ ] **Step 2: Run the integrity test and verify RED**

Run: `npm test -- test/site-integrity.test.mjs`  
Expected: FAIL on at least one deliberately unresolved integrity condition before cleanup.

- [ ] **Step 3: Fix integrity failures and verify GREEN**

Run: `npm run render` then `npm test`; expected all tests PASS with no warnings.

- [ ] **Step 4: Perform visual and interaction verification**

Serve the portfolio locally. Inspect 375, 768, 1024, and 1440 pixel widths; keyboard navigation; focus states; reduced motion; video play/pause/fallback; no-JavaScript content; link targets; and browser console. Record evidence in `docs/verification/portfolio-redesign.md`.

- [ ] **Step 5: Run final content audit**

Compare every ownership, repository, architecture, and prototype claim against the audit evidence and design spec. Confirm excluded projects and unsupported metrics are absent.

- [ ] **Step 6: Commit Task 7**

```powershell
git add portfolio/test/site-integrity.test.mjs portfolio/docs/verification/portfolio-redesign.md portfolio/css portfolio/js portfolio/scripts portfolio/index.html portfolio/projects portfolio/assets
git commit -m "test: verify portfolio accessibility and integrity"
```

## Plan Self-Review

- Spec coverage: homepage, five case studies, editorial system, media behavior, real capture attempts, accessibility, SEO, resilience, and verification all map to a task.
- Step scan: every code step names its interface or exact output; every behavior begins with a failing test.
- Type consistency: `Project`, project slugs, media paths, renderer names, and media-policy names are stable across tasks.
- Review Focus: each listed failure mode has an owning test task.
- Proportion: detailed capture setup remains in repository docs; this plan records only decisions needed to implement and verify the portfolio.

