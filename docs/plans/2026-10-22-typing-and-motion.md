# Typing interests and portfolio motion

Requested: remove the internship-seeking line and add typing for Artificial intelligence, Mobile apps, and Web apps, plus animation and motion. Extend both the editorial concept and the current generated portfolio; preserve the existing Light/Dark/System controls.

Copy: use “I’m interested in …” to describe the student's interests without claiming specialist credentials. Remove repeated internship-seeking copy from the introduction, contact wording, metadata, and shared positioning. Preserve the real education and project contributions.

Typing: repeat type/hold/erase through all three phrases. Reserve the longest phrase's width and a stable two-line area to prevent layout shifts. Keep a complete static sentence for assistive technology, no JavaScript, and reduced motion. Include an accessible pause/resume button. Pause in hidden tabs, respect reduced-motion changes during the visit, and clean up listeners/timers.

Motion: choreographed hero text entrances, a small portrait/image scale settling into place, one-time section entrances, and subtle button/image hover and press feedback. Use transforms and opacity with native browser animations and IntersectionObserver, without new dependencies, scroll interception, pinned scenes, or loading screens. Content stays visible when APIs are missing or JavaScript is unavailable. Cancel active animations for reduced motion.

Implementation: shared js/motion.js and css/motion.css; shared typing markup helper for the generated homepage; equivalent markup in the separate concept; script/style links in page templates; regenerate all six HTML pages. The editorial layout remains in its reviewable concept file; motion and the updated wording also work in the current site.

Tests: first run four failing Node tests for the missing typing controller, then implement cycling, pause/resume, reduced motion, visibility changes, and cleanup. Verify all existing tests, real-browser cycling and stable layout, responsive views, scroll entrances, static fallback, and Light/Dark/System compatibility. Inspect and visually review the final concept at desktop, tablet, and phone sizes.

Final verification: 17 Node tests passed, including all four new typing tests. All 21 motion browser checks passed on the current homepage and editorial concept. All three full phrases were observed in real time; action positions stayed stable; pause/resume, scroll entrances, reduced-motion changes, no-JavaScript readability, and widths 320/390/768/1440 were checked. The first scroll check was corrected to use an instant programmatic scroll so it measures the destination rather than the start of the page's normal smooth-scroll travel.

The final concept inspector reports 0 failures and one name-only-title warning at 1440/768/390, with no motion allowances. The warning is retained intentionally: the requested animated interests replace the old role line, while the readable introduction immediately below explicitly identifies Jayrald as a Computer Science student and describes his projects. All six final screenshots, including full-page sheets, were opened. Source lint passes; the 1px accessible-text clipping box is documented as screen-reader content rather than a decorative line.

ROUND 1
Seen in one second: the editorial portrait and name, followed by a changing interests line.
Idea (one sentence): Jayrald's AI, mobile, and web interests provide the typing sequence, while his real projects provide the scroll content.
Live thing: a type/erase loop with pause/resume; native mode selection and project walkthrough remain available.
Layout words by section: intro=portrait-and-profile / work=large-plate-and-unequal-pair / about=education-and-bio / contact=charcoal-close.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6
Caps applied: familiar editorial composition limits creativity to 7.
Top three review points:
1. The first phone render placed pause on its own line. Position the control at the right of the interests line and reserve its width; verified in motion-verified/mobile-fold.jpg.
2. Changing words could move adjacent content. Use the longest phrase as the invisible measuring span; real-browser action positions remain stable through all phrases.
3. Partial words are intentional during playback. Keep the complete sentence available to assistive technology and show it visually for reduced motion or no JavaScript; both browser fallbacks pass.

Art direction remains the printed annual, seed 573972893. No new images, drawings, stock assets, or sample achievements were added. All picture pixels remain original. No deployment was performed.
