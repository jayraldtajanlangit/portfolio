# Typing copy and typography

Implemented the approved wording and styling: cycle through lowercase “web development”, “mobile development”, and “artificial intelligence”, following “I’m interested in”. Use the existing Manrope body family at weight 500, 20px on desktop, 18px on tablet and fluid 16–18px on phones. Hold each completed phrase for 2000ms. Keep the longest-phrase measurement, static accessible text, reduced-motion fallback, and absence of typing playback controls. The concept preview is synchronized by the renderer.

Verification: all 36 unit tests pass, including a regression check for the two-second hold after every completed phrase. Source lint has no findings. All 15 focused browser checks pass: every full phrase and empty state fits at 320, 360, 375, 390, 428, 768 and 1440px in both themes, with no horizontal overflow or hero layout shift; reduced-motion text is readable at 320px. Four final light/dark desktop/phone screenshots were opened.

ROUND 1 — typing component
Seen in one second: The existing name heading followed by a more legible medium-weight interests line.
Idea (one sentence): Three consistent areas of interest complete the same natural sentence.
Live thing: The three phrases cycle, each holding for two seconds.
Layout words by section: hero=split, stacked on phone / remaining sections=unchanged
Scores: design 7.5 · usability 8 · creativity 6.5 · content 8.5 → overall 7.6
Caps applied: Existing editorial direction, palette and fonts retained; no redraw or new imagery.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. The narrowest 320px check allows natural wrapping while keeping the introduction stable; the full phrase fits inline in light-390.jpg. No spacing fix remains.
2. No clipping or unintended overlap in light-390.jpg.
3. No typing-component spacing issue in light-1440.jpg or dark-1440.jpg.
