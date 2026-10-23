# Light, Dark, and System appearance

Requested in chat as an addition to the portrait-led editorial design. Add a compact native select to the header, with the accessible name Color theme and the options Light, Dark, System. Default to System.

Light uses the existing light palette. The editorial concept's dark mode uses charcoal and off-white with muted slate interactions. Existing portfolio pages receive a dark palette from shared tokens. Original photographs, screenshots, and video pixels are unchanged.

A shared classic script in the head resolves the saved mode before paint. System follows prefers-color-scheme and responds to device-setting changes. Explicit selections override the device setting and persist in localStorage across pages and reloads. Other tabs synchronize through the storage event. Invalid saved values fall back to System. Storage failures do not prevent in-page mode selection.

When JavaScript is unavailable, CSS follows the system setting and the inactive select stays hidden. Native form controls use the resolved color-scheme. The browser theme-color metadata follows the page background after load and when switching.

Implementation: js/theme.js; css/theme.css; shared light/dark tokens; shared rendered theme control; both generated page templates; all six generated HTML pages; the separate editorial concept. Fix inverse text on dark media, system, next-project, and footer fields to use the inverse ink token rather than the changing paper background token.

Design status: the editorial composition remains a reviewable concept; the appearance controls also work on the current generated portfolio and all five project pages. No deployment was performed.

Verification: a real-browser test first demonstrated the missing modes, then checked persistence, live OS changes, explicit overrides, invalid stored values, unavailable storage, no-JavaScript fallback, all case-study routes, and widths 320/390/768/1440. The test waits for browser rendering after media emulation so the media-query change event can be delivered. Add text contrast checks for the project pages' inverse sections; these initially reproduced dark-on-dark text and now validate the inverse token correction.

Final results: 13 Node tests passed; 36 browser checks passed. All five case studies' system descriptions, media captions, next-project labels, and footer text measure 15.87:1 against their dark field. The final concept inspector reports 0 failures and 0 warnings at 1440, 768, and 390 pixels, retaining only the documented still-page allowance. Opened all six inspector images and the explicit Light, Dark, and phone Dark captures. No overflow was found at 320/390/768/1440. Theme-control and concept source lint pass.

ROUND 1
Seen in one second: the same editorial portrait with a quiet, readable appearance selector in the header.
Idea (one sentence): light and dark preserve the photograph-led magazine composition and its visual hierarchy.
Live thing: Light/Dark/System selection, persisted preference, and live system appearance updates.
Layout words by section: intro=portrait-and-profile / work=large-plate-and-unequal-pair / about=education-and-bio / contact=charcoal-close.
Scores: design 7 · usability 8 · creativity 7 · content 8 → overall 7.4
Caps applied: the previously documented restrained-motion and familiar-composition limits remain.
Top three considerations: the phone header must retain enough width for the selector (verified down to 320px); application screenshots retain their original light interfaces; persistence is unavailable when browser storage is blocked, while selection still works during the current visit. No new imagery, sample content, or redraws.
