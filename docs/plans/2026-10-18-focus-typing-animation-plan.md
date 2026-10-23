# Focus Typing Animation Implementation Plan

**Goal:** Add a one-time, accessible typing entrance to the homepage `FOCUS` sentence.

**Architecture:** Keep the full sentence in static HTML, then progressively enhance its visible span only when motion is allowed. Reuse the existing homepage runtime and CSS motion system; avoid dependencies and layout-changing markup.

**Tech Stack:** Static HTML generation, CSS, vanilla JavaScript

---

### Task 1: Implement and verify the focus-line typing treatment

**Files:**

- Modify: `scripts/render-site.mjs`
- Modify: `js/site.js`
- Modify: `css/home.css`
- Regenerate: `index.html`

1. Add a `data-typing-focus` hook and an explicit sentence value to the existing Focus row while keeping the complete fallback text in HTML.
2. Add an idempotent homepage initializer that types once, skips reduced motion, keeps assistive output stable, and removes its caret state on completion or teardown.
3. Add a restrained thin-caret style using existing color and motion tokens, with an explicit reduced-motion override.
4. Run `npm run render`, JavaScript syntax checks, source checks for the static fallback and absence from case studies, and a responsive browser smoke check when a browser surface is available.
5. Commit the implementation without adding a formal test suite.

