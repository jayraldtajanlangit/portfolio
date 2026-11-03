# Hero name motion

Add motion to the existing two-line name behind the centered portrait. Each
word rises into place with a slight rotation, staggered by 140ms and settled
within 1.04 seconds. The line mask keeps the entrance within the typography.
Supported browsers also separate the two lines horizontally by 18px as each
line leaves the viewport, linked to native scrolling.

Keep the existing font metrics, accessible h1 name, portrait position, themes
and Swarm Rebuild settings. Use CSS only; no library or event loop is needed.
Reduced-motion mode renders the final static text. Older browsers keep the
entrance and static positioning without the scroll effect.

Validation: regenerated the site; all 72 existing tests pass and diff whitespace
checks pass. Browser screenshots at 1440, 768 and 390px show no horizontal
overflow. Sampled live entrance transforms confirm the 140ms stagger; scrolling
advances the first line to -16.86px before the second starts. Verified the
accessible full name, both appearances, and Swarm capture of both name lines
with no browser errors. Restored the default viewport and light homepage.
