# Appearance toggle

Replace the Light/Dark/System dropdown with a direct light/dark switch on all pages. Use a sun/moon track and moving thumb, with a 64×44px button, a stable “Dark mode” accessible name, and aria-checked describing the resolved appearance. Native button Enter/Space behavior toggles the theme; visible focus and reduced-motion support remain.

Keep the head script so saved appearance applies before paint. With no saved choice, or an existing System preference, follow device appearance until the user toggles; then save an explicit Light or Dark choice. Keep cross-tab updates and storage-denied fallback. No menu or system option is shown.

Verify state transitions, persisted/system defaults, storage failures and cross-tab events. Check browser keyboard behavior, reload/navigation persistence, reduced motion, and responsive header fit on home and case studies.

Verified: 36 unit tests and 53 browser checks pass. Native Space/Enter activation works on all six public pages and the existing concept preview. Header fits at 320, 390, 768 and 1440px. Navigation/reload persistence, device default, reduced motion and denied storage were exercised. Read-only code review found no actionable issues. Source lint has no findings; the visual inspector has zero failures and the previously documented stale-font warning. All eight final inspector screenshots were opened, along with focused light/dark switch screenshots.

ROUND 1
Seen in one second: The existing editorial portfolio with a compact sun/moon switch in the header.
Idea (one sentence): Appearance is a direct binary control that uses the existing green palette.
Live thing: The switch changes appearance immediately and remembers the selection.
Layout words by section: header=wordmark-and-navigation / other sections=unchanged
Scores: design 7.5 · usability 8 · creativity 6.5 · content 8.5 → overall 7.6
Caps applied: No component regressions or unresolved measurement failures. Existing brand fonts retained; no direction redraw.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. No remaining switch-specific visual defect in desktop-fold.jpg.
2. No header collision in tablet-fold.jpg or mobile-fold.jpg.
3. The case-study phone header retains its existing separate control row (case-dark-390.jpg); accepted to preserve the existing header composition.

No new third-party assets, sample content or imagery. The sun/moon icons are existing authored vectors.
