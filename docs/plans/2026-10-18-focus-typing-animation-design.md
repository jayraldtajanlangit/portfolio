# Focus Typing Animation Design

The typing treatment belongs in the hero's `FOCUS` row, not in the display headline. The headline remains an immediate, stable statement of position; the smaller monospace row behaves like an editorial annotation being set into place.

The sentence is: “Product engineering across web, mobile, and applied AI.” It types once after the existing hero entrance settles, holds as complete text, and never deletes or loops. A thin vermilion caret follows the active character and disappears at completion. The row reserves its full width before animation begins, preventing layout shift.

Progressive enhancement is mandatory. The committed HTML contains the complete sentence. JavaScript only clears and retypes the visible span after confirming that motion is allowed. If JavaScript is unavailable, initialization fails, or `prefers-reduced-motion: reduce` is active, the complete sentence remains visible with no caret animation. Assistive technology receives the complete sentence rather than character-by-character announcements.

The implementation reuses the existing site runtime and editorial motion tokens. It adds one data hook to the generated homepage, a small initializer in `js/site.js`, and narrowly scoped caret styling in `css/home.css`. The animation must not run on case-study pages.

