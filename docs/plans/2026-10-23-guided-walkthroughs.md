# Guided walkthroughs and automatic previews

The user requested a smooth cursor and zoom treatment like recording-editor apps, plus hover or automatic playback. Use authored presentation cursor tracks and camera keyframes following the actual interface steps in the existing recordings. The clips contain no mouse telemetry, so the presentation cursor is a guide rather than a reconstruction of real mouse movement. Preserve the originals and export separate H.264 MP4 versions at 60fps. The effects are baked in so native seeking and fullscreen work consistently.

Trim the initial one-second loading lead-in. Use smooth fifth-order easing, modest desktop zoom (up to 1.55x), and restrained portrait zoom (up to 1.13x). Return to a wide shot before the loop restarts. Do not invent click results or change application content.

Desktop: hover or keyboard focus starts the visible project; leaving pauses it. Touch: the most visible player previews automatically. Only one preview plays at once. Preserve native controls, manual pause, inline playback, muted looping, and fallback video sources. Pause off-screen and in hidden tabs. Reduced motion disables automatic playback while keeping explicit playback available.

Verify authored motion bounds and easing, actual encoded video dimensions and smooth frames, hover/leave, touch visibility, manual pause, reduced motion, fullscreen, background-tab behavior, and stale play-promise handling. Review rendered footage and the final page at desktop and phone sizes.

## Verification

24 Node tests pass, including a regression reproducing an old play promise pausing a newer hover request. The fix ignores results from superseded requests. Real-browser checks pass 41 playback cases and 60 layout, asset, font, and link cases across both portfolio entry points. Actual hover, keyboard focus, pointer leave, manual pause, rapid hover changes, off-screen pause, touch autoplay, reduced motion, native fullscreen, and hidden-tab pause were exercised. Background visibility was verified using another tab in the same browser window.

FFprobe confirms H.264 at 60fps for all three exports, retaining 1440×900, 1280×720, and 390×844 source dimensions. Combined polished video size is about 4.2MB. Frame contact sheets were reviewed for all three edited clips, and all final desktop/tablet/phone inspector sheets were opened. The inspector reports no failures and the previously documented name-only-title warning. The original editorial direction (seed 573972893), palette, and type remain in place; no composition redraw or new stock imagery was needed. [Recordly's official feature description](https://recordly.dev/) informed the requested motion reference; no Recordly code or assets were used.

ROUND 1
Seen in one second: the existing portrait and name, followed by interactive project footage.
Idea (one sentence): each application's actual workflow is guided by a presentation cursor and close-up camera cues, with playback responding to the visitor's attention.
Live thing: hover starts one project preview; touch screens play the most visible preview.
Layout words by section: hero=portrait split / work=split feature and paired previews / about=education and prose / contact=dark closing field.
Scores: design 8.0 · usability 8.3 · creativity 7.0 · content 8.0 → overall 7.9.
Caps applied: creativity stays at 7 for the familiar editorial composition.
Top three findings:
1. Cursor movement and camera easing are encoded into each video, so the treatment also appears in native fullscreen and downloaded clips.
2. Hover, keyboard, and touch policies keep one preview active, and explicit pause is respected.
3. Presentation cues are authored from the visible workflow rather than recovered pointer telemetry. Originals remain available as fallback assets.
