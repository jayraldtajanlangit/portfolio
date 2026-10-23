# Mobile walkthroughs with touch cues

Replace the desktop pointer and camera zoom in Bulk Buying Companion, Pulso and Sige with a steady, complete 390×844 screen and a brief expanding ring at each demonstrated tap. Keep the existing phone hardware frame and preview autoplay behavior. Use the same footage on homepage previews and case studies, including WebM fallbacks; preserve un-suffixed original recordings for future edits.

`walkthrough-motion.mjs` now gives portrait clips a static centered camera and labeled tap cues. `walkthrough-touch.mjs` composites 0.48-second white rings with a dark edge for legibility on light and dark app surfaces. The renderer skips the cursor input and zoom pipeline for these clips and exports both H.264 and VP9 at 60fps. Desktop walkthroughs retain their existing presentation. Tap cues are authored against the visible footage and do not claim recorded touch telemetry.

Browser testing found that Pulso's full-range VP9 export failed to decode in Chrome. Converting the fallback to limited range resolved the failure; this conversion is included in the reproducible renderer.

Verification: all 42 tests pass, including the new fixed-screen/touch-profile check that failed before implementation. Full-video comparison with the clean sources gives SSIM 0.996619 (Bulk Buying Companion), 0.996506 (Pulso), and 0.995823 (Sige), supporting unchanged screen framing. Both formats are 390×844 at 60fps. Reviewed tap contact sheets and desktop/mobile phone screenshots. All 15 browser checks pass: MP4 autoplay and WebM playback for each app at 1440px and 390px, plus native case-study controls for each app. Review artifacts and reproduction scripts are in `.taste-skill/mobile-taps/`.
