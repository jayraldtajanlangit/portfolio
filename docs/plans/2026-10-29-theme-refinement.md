# Forest and ivory refinement

Approved direction: refine the existing forest-green theme with deeper charcoal
backgrounds, clearer card separation, warm ivory text, restrained mint accents,
consistent controls, numbered homepage section labels and a quiet hero glow.
Keep the serif display type, project layouts, recordings and current behavior.

Approaches considered: a forest-and-ivory refinement preserves the portfolio's
identity; a GitHub-like developer interface would replace that identity. The user
chose the refinement after seeing the proposed changes.

Implementation plan (execute in this session):

- [x] Refine shared light/dark tokens, including the system-dark fallback, and
  expose common control/card/media radii. Keep readable foreground/background
  pairings on both normal and inverse surfaces.
- [x] Add numbered labels to Projects, Tech stack, About and Contact through
  the existing renderers. Add a static CSS hero glow and unify button treatments.
- [x] Carry the shared surfaces into the workflow and case-study dossier without
  changing timing, media framing, controls or project facts. Rebuild all HTML.
- [x] Run the existing Node suite and check the actual served homepage, workflow
  and all case studies on phone/tablet/desktop in both themes. Measure contrast,
  overflow, focus and target sizes; inspect representative screenshots.

Use existing vanilla CSS and HTML generators; add no runtime dependencies or
animation loops. This is a reversible visual change, so browser layout/contrast
checks and the existing suite are the appropriate verification.

Verification: 66/66 Node tests pass. All six shipped HTML files match their
renderers. The live homepage and five case studies passed 39 theme/layout checks
at 320, 768 and 1440 pixels in both themes, including text contrast (sampled
minimum 5.58:1 light and 8.50:1 dark), focus, controls, system-dark fallback
without JavaScript and the five-second intro handoff. The existing 15 card/media
browser checks also passed across six widths.

Final review identified the Contact kicker's inherited paragraph size. Excluding
the kicker from that paragraph rule corrected it; a browser check reproduced the
18px mismatch first, then passed all four labels at 11px in both themes at 320
and 1440 pixels. Reviewed final narrow light-theme and desktop Contact screenshots
after the correction. The final check used a temporary server after the user's
original preview server stopped; that temporary server was closed afterward.
