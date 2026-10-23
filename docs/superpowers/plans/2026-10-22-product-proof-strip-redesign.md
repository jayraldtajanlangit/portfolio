# Product Proof Strip Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic editorial homepage with a charcoal-and-sage product proof strip built from Jayrald's real interface captures, including an accessible project workflow scrubber.

**Architecture:** Keep the existing static-site generator, structured project data, and framework-free runtime. The renderer will emit a complete no-JavaScript contact sheet and project chapters; a new `workflow.js` module will progressively enhance the sequences with project selection and stage navigation. Existing case-study URLs, media behavior, and ownership disclosures remain intact.

**Tech Stack:** Semantic HTML, modern CSS, ES modules, Node.js built-in test runner, existing image/video assets, design-taste lint and browser inspector.

**Spec:** `docs/plans/2026-10-22-product-proof-strip-redesign-design.md`

## Global Constraints

- Keep the framework-free architecture and add no runtime dependencies.
- Preserve all five case-study routes, project data, real media, fallback behavior, and ownership disclosures.
- Use the approved palette: `#1c1c1c`, `#262626`, `#f1f1ef`, `#9a9b96`, `#8fa68e`, and `#c8c5ba`.
- Use Libre Franklin for display type and Source Serif 4 for reading text.
- The first screen must identify Jayrald as a full-stack and mobile engineer and expose one real primary action.
- Headlines must stay within two lines at 1440, 768, and 390 pixels.
- No gradients, glass, decorative shadows, pills, icon-card rows, or horizontal page overflow.
- The workflow scrubber must work by keyboard and touch, announce state changes, and degrade to an ordered static sequence without JavaScript.
- Respect `prefers-reduced-motion`; no content may remain hidden when motion is unavailable or script execution fails.
- The current folder has no usable Git metadata. Commit steps are conditional: if Git remains unavailable, record the verification result in the execution ledger and do not attempt repository repair.

## Review Focus

- JavaScript disabled: every project state and case-study link remains visible and logically ordered.
- Missing or failed video: its poster or first still remains visible with the correct caption.
- Workflow boundaries: Previous at the first stage and Next at the final stage do not produce an invalid index.
- Mobile interaction: controls remain at least 44px high, the sheet wraps instead of scrolling the page sideways, and hover is never required.
- Existing routes and claims: all five generated case studies retain their project-specific ownership and disclosure copy.

---

### Task 1: Render the Product Proof Homepage Structure

**Files:**
- Create: `test/home-render.test.mjs`
- Modify: `package.json`
- Modify: `scripts/render-site.mjs:12-210`

**Interfaces:**
- Consumes: `projects`, `contacts`, and `site` from `js/projects.js`.
- Produces: `renderHomePage(): string`, static `.contact-hero`, `.contact-sheet`, `.proof-project`, and `[data-workflow-stage]` markup consumed by Tasks 2 and 3.

- [ ] **Step 1: Add the Node test command and a failing homepage render test**

Add `"test": "node --test"` to `package.json`. In `test/home-render.test.mjs`, assert that `renderHomePage()` contains the approved h1 copy, a real `#work` primary action, all five project slugs, three ordered workflow stages per project, the existing portrait, and GitHub/LinkedIn/email destinations.

- [ ] **Step 2: Run the test and verify RED**

Run: `cmd /c npm test -- --test-name-pattern="renders the product proof homepage"`

Expected: FAIL because `.contact-hero`, `.contact-sheet`, and workflow stage markup do not exist.

- [ ] **Step 3: Implement the static renderer structure**

Add focused renderer helpers in `scripts/render-site.mjs`:

- `renderContactSheetFrame(project, still, stageIndex): string`
- `renderContactHero(): string`
- `renderProofProject(project, projectIndex): string`

Render every still in source order, preserve its alt text and caption, and make every project understandable without JavaScript. Keep case-study links real and retain existing video/poster data where used.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `cmd /c npm test -- --test-name-pattern="renders the product proof homepage"`

Expected: PASS.

- [ ] **Step 5: Render generated files and verify routes still exist**

Run: `cmd /c npm run render`

Expected: exit 0 and regenerated `index.html` plus five files under `projects/`.

- [ ] **Step 6: Commit or ledger the verified task**

If Git is available, commit `package.json`, `test/home-render.test.mjs`, `scripts/render-site.mjs`, and generated HTML with message `feat: render product proof homepage`. Otherwise record the no-repository ruling and passing command in the execution ledger.

### Task 2: Add the Accessible Workflow Scrubber

**Files:**
- Create: `test/workflow.test.mjs`
- Create: `js/workflow.js`
- Modify: `js/site.js:1-205`
- Modify: `scripts/render-site.mjs` workflow control markup

**Interfaces:**
- Consumes: `[data-workflow]`, `[data-project-select]`, `[data-workflow-stage]`, `[data-workflow-prev]`, `[data-workflow-next]`, and `[data-workflow-status]` from Task 1.
- Produces: `createWorkflowState(projects, activeSlug)`, `reduceWorkflow(state, action, projects)`, and `initWorkflowScrubber(root = document)`.

- [ ] **Step 1: Write failing reducer tests**

Test initial selection, selecting a different project, advancing and reversing a stage, clamping at both boundaries, and an empty project list. Assert that stage state is remembered independently for each project.

- [ ] **Step 2: Run the reducer tests and verify RED**

Run: `node --test test/workflow.test.mjs`

Expected: FAIL because `js/workflow.js` does not exist.

- [ ] **Step 3: Implement the minimal workflow state functions**

Use these public shapes:

- `createWorkflowState(projects: Array<{slug: string, stageCount: number}>, activeSlug?: string): {activeSlug: string | null, stageBySlug: Record<string, number>}`
- `reduceWorkflow(state, action, projects): WorkflowState`, with actions `{type: 'select', slug}`, `{type: 'next'}`, and `{type: 'previous'}`.

Unknown actions return the existing state; invalid slugs do not replace the current selection.

- [ ] **Step 4: Run the reducer tests and verify GREEN**

Run: `node --test test/workflow.test.mjs`

Expected: all workflow tests pass.

- [ ] **Step 5: Add DOM enhancement and controls**

Implement `initWorkflowScrubber(root = document)` using the pure reducer. Update `aria-pressed`, stage visibility, disabled boundary controls, the status announcement, and project description without moving focus. Import and initialize it in `js/site.js`. The initializer returns an idempotent teardown function.

- [ ] **Step 6: Extend the render test for accessible controls**

Assert project selectors are buttons, Previous/Next are buttons, the status uses `aria-live="polite"`, and all stages remain present in HTML.

- [ ] **Step 7: Run the focused and full suites**

Run: `cmd /c npm test`

Expected: all tests pass.

- [ ] **Step 8: Commit or ledger the verified task**

If Git is available, commit with message `feat: add accessible workflow scrubber`. Otherwise record the no-repository ruling and suite result.

### Task 3: Apply the Contact-Sheet Visual System

**Files:**
- Create: `test/design-contract.test.mjs`
- Modify: `css/tokens.css`
- Modify: `css/global.css`
- Modify: `css/home.css`
- Modify: `scripts/render-site.mjs` font loading and theme metadata

**Interfaces:**
- Consumes: Task 1's class names and Task 2's active/hidden/disabled states.
- Produces: responsive desktop, tablet, mobile, focus, reduced-motion, and no-JavaScript compositions.

- [ ] **Step 1: Write a failing visual contract test**

Read the CSS and rendered HTML as text. Assert the six approved color tokens, Libre Franklin and Source Serif 4 loading, `.contact-sheet`, `.proof-project`, `.workflow-controls`, `:focus-visible`, 390/768 responsive rules, and `prefers-reduced-motion`. Assert that homepage CSS contains no `linear-gradient`, `radial-gradient`, `backdrop-filter`, or `box-shadow`.

- [ ] **Step 2: Run the contract test and verify RED**

Run: `node --test test/design-contract.test.mjs`

Expected: FAIL on the missing palette, fonts, and new component selectors.

- [ ] **Step 3: Replace the homepage visual system**

Implement the approved charcoal contact-sheet hero, embedded sage text cell, staggered six-column desktop sheet, three-to-four-column tablet sheet, and two-column wrapped phone sheet. Build five distinct project compositions, compact ownership records, the concrete About field, contact band, and full-width name footer. Keep all text at readable contrast and controls at least 44px high.

- [ ] **Step 4: Add the motion layer and reduced-motion fallback**

Apply the shutter reveal once to the principal mAIstra image, stagger section parts, provide control feedback, and preserve visible final states under `prefers-reduced-motion` or failed JavaScript.

- [ ] **Step 5: Run the design contract and full suite**

Run: `cmd /c npm test`

Expected: all tests pass.

- [ ] **Step 6: Run source lint**

Run: `node C:\Users\Jayrald\.agents\skills\design-taste-frontend\scripts\lint.mjs index.html css js scripts`

Expected: 0 FAIL; every warning is either corrected or recorded with a one-sentence rationale.

- [ ] **Step 7: Commit or ledger the verified task**

If Git is available, commit with message `feat: apply contact sheet art direction`. Otherwise record the no-repository ruling and verification results.

### Task 4: Preserve Case Studies and Resilient Media

**Files:**
- Modify: `test/home-render.test.mjs`
- Create: `test/case-study-render.test.mjs`
- Modify: `css/case-study.css`
- Modify: `css/global.css`
- Modify: `scripts/render-site.mjs` only where shared metadata or fonts require alignment

**Interfaces:**
- Consumes: existing `renderCaseStudy(project, nextProject)`, `renderProjectMedia(project, pathPrefix)`, and project disclosure data.
- Produces: visually aligned case-study pages without changing claims, routes, source visibility, or fallback semantics.

- [ ] **Step 1: Write failing preservation and resilience tests**

For each project, assert the generated case study contains its title, ownership boundary, media poster, first fallback still, workflow images, next-project link, and disclosure copy. Assert the redesigned shared shell loads the approved fonts and palette without removing existing media attributes.

- [ ] **Step 2: Run the case-study tests and verify RED**

Run: `node --test test/case-study-render.test.mjs`

Expected: FAIL only on the new shared design contract; route, ownership, and media assertions establish the preservation baseline.

- [ ] **Step 3: Align case-study styling with the new system**

Map existing case-study compositions onto the charcoal, concrete, sage, Libre Franklin, and Source Serif 4 tokens. Do not restructure their content or weaken disclosure language. Ensure failed video and reduced-motion modes still expose posters and captions.

- [ ] **Step 4: Run the full suite and regenerate every page**

Run: `cmd /c npm test`

Expected: all tests pass.

Run: `cmd /c npm run render`

Expected: exit 0.

- [ ] **Step 5: Commit or ledger the verified task**

If Git is available, commit with message `style: align portfolio case studies`. Otherwise record the no-repository ruling and verification results.

### Task 5: Browser Inspection, Critique, and Final Verification

**Files:**
- Modify as findings require: `css/home.css`, `css/global.css`, `css/case-study.css`, `js/workflow.js`, `scripts/render-site.mjs`
- Create: `.taste-skill/after/` inspection artifacts
- Create: `.taste-skill/critique.md`

**Interfaces:**
- Consumes: the complete generated site from Tasks 1-4.
- Produces: measured screenshots, written critique, corrected implementation, and final verification evidence.

- [ ] **Step 1: Run the complete automated baseline**

Run: `cmd /c npm test`

Expected: all tests pass.

Run: `cmd /c npm run render`

Expected: exit 0.

- [ ] **Step 2: Inspect the homepage in a real browser**

Run the design-taste inspector against `index.html` at 1440, 768, and 390 pixels into `.taste-skill/after`.

Expected: 0 FAIL. Treat warnings as defects unless the approved direction supplies a concrete rationale.

- [ ] **Step 3: Inspect representative case studies**

Inspect at least `projects/maistra.html` and `projects/skyfire.html` at desktop and mobile widths. Verify navigation, media posters, captions, tables, ownership copy, and next-project links.

- [ ] **Step 4: Write critique round 1 from the screenshots**

Use the required critique format: one-second impression, idea, live thing, layout words, weighted scores, caps, and the top three visible problems with screenshot names and proposed fixes.

- [ ] **Step 5: Fix the top three problems and re-inspect**

Treat the failing inspector measurement or written visual finding as RED evidence, make the smallest correction, rerun the affected automated tests, then rerun the inspector. Complete no more than three critique rounds.

- [ ] **Step 6: Verify resilience and interaction manually**

Check keyboard-only project selection and stage navigation, disabled boundaries, reduced motion, mobile controls, no horizontal overflow, video fallback, all internal links, and the no-JavaScript reading order.

- [ ] **Step 7: Run final verification**

Run: `cmd /c npm test`

Expected: all tests pass.

Run: `node C:\Users\Jayrald\.agents\skills\design-taste-frontend\scripts\lint.mjs index.html css js scripts`

Expected: 0 FAIL.

Run the final homepage inspector again.

Expected: 0 FAIL at all three widths, with every final screenshot opened and reviewed.

- [ ] **Step 8: Commit or ledger completion**

If Git is available, commit final corrections with message `fix: polish responsive portfolio experience`. Otherwise record the final suite, lint, inspector, and critique results in the execution ledger.

