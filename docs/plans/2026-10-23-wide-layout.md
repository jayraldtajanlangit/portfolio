# Wide-screen layout refinement

Approved direction: increase the shared content maximum to 1400px, align header and content edges, give project recordings more width, and preserve existing readable paragraph measures and mobile layout.

Set the shared shell token to 87.5rem and have the homepage use that token rather than its previous independent 70rem cap. Keep equal 32px desktop and 20px mobile gutters. Center the navigation in a three-column header grid, grouping email and appearance actions at the right. Use a 64px desktop hero column gap and preserve existing tablet/phone overrides and text measures. Place the expanded phone navigation below the first header row.

Validate both themes at 320/390/768/1024/1440/1857/1920/2560px. Measure equal edges, the 1400px cap, header alignment, readable paragraph widths, no overflow or collisions, and an expanded mobile menu. Review full-width screenshots and a representative case study because the shared token also widens its media.

Verification: all 36 unit tests pass. All 46 browser checks pass, including both themes at every requested width, centered navigation, aligned shells, 60ch maximum measured homepage paragraph widths, the expanded phone menu, and all five case-study frames. At 1857px the homepage shell is 1400px wide with 228.5px equal outer margins; the featured media is 816px wide versus the previous 648px. Body minimum width now respects the available viewport, fixing unequal 320px gutters caused by stable scrollbar space.

Final source lint has no findings. The final inspector reports zero failures with documented allowances: the existing hero action false-positive eyebrow classification, and the wide-screen animation sampler's still-page undercount. A separate instrumented 1857px scroll records 57 actual author animation calls, so the motion layer is functioning; no new animation was added. The remaining warning compares the retained fonts with a stale direction sheet. All six final inspector screenshots were opened, plus light/dark 1857px and phone captures and a representative wide mAIstra case study. Read-only review found no actionable regressions.

ROUND 1
Seen in one second: Jayrald's editorial name, now aligned to a wider frame shared by the header and project previews.
Idea (one sentence): Give the existing real project recordings more of the available screen while retaining comfortable text measures.
Live thing: Existing typing line, theme toggle, video previews and project links remain.
Layout words by section: header=centered-navigation / hero=split / web-work=media-and-copy-rows / mobile-work=three-columns / tech-stack=icon-rows / about=split / contact=split
Scores: design 7.5 · usability 8 · creativity 6.5 · content 8.5 → overall 7.6
Caps applied: Existing brand and composition retained; no redraw or new assets.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Side margins previously consumed about 368px at the supplied width; now about 228px with larger real media (desktop-fold.jpg).
2. Long text could spread with the wider container; the introduction/project measures remain constrained and About paragraphs now cap at 60ch (desktop-page-01.jpg).
3. No phone header collision or off-center frame in mobile-fold.jpg; the open menu is verified below the first control row at 320 and 390px.
