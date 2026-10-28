# Case-study spacing and alignment repair

Reported problem: linked project pages have excessive gaps and content that does
not line up. Current CSS mixes a 1400px shell, 72ch centered reading sections,
1152px workflow/outcome sections and centered narrow phone media. Section padding
adds together, system items keep a 176px minimum height, and desktop phone
screenshots remain in one vertical column.

Implementation choices: use a shared 1152px rail with responsive gutters, a
32–56px rhythm between sections, and one heading/content grid on desktop. Keep
heading/content stacked on narrow screens. Put portrait walkthroughs next to the
introduction/dossier on desktop without expanding the gap between those two text
blocks. Keep web walkthroughs below their introduction and preserve media height
limits. Arrange the three portrait captures across a row at wide desktop widths.
Remove fixed system-item heights and align capture headings/captions to devices.

Preserve all project facts, native controls, source aspect ratios, phone frames,
fallbacks and reduced-motion behavior. This repairs layout; it does not implement
the per-project art directions suggested in the prior response.

- [x] Reproduce the mixed alignment and excessive spacing in a browser check.
- [x] Add orientation classes and consolidate effective case-study layout rules.
- [x] Rebuild the case-study HTML and run the Node suite.
- [x] Verify all five pages across six widths in both themes, including bounds,
  section rhythm, portrait gallery rows, text wrapping and complete phone media.

Verified: baseline checks failed on all ten sampled layouts, with headings up to
321px off the intro rail and content gaps of 96px. The corrected layout passed
all 63 browser checks: five pages at six widths in both themes, zero heading-rail
offset, 32–56px section gaps, no overflow, full phone captures and aligned desktop
portrait galleries. All 73 Node tests pass; all generated case studies match the
renderer. A further 46 media checks passed, including playback through case-study
links and fallback containment. Independent review found no actionable issues.

Visual review also found the theme control consuming a second mobile header row.
The case-study header now uses a single row for the name, menu and theme switch;
menu open/close and theme switching passed live browser checks. Reviewed desktop
intro, reading sections, the three-phone gallery and the compact phone header.
