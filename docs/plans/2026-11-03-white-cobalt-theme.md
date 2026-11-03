# White and cobalt theme

User selected White + cobalt: bright, clean. Use white ground, dark navy ink,
cobalt actions and cool neutral panels across the homepage and case studies.
Keep the existing typography, content, responsive layout, theme switch and
Swarm Rebuild behavior. The dark option uses navy surfaces and lighter blue
actions. Project frames share the cobalt palette; project screenshots retain
their own colors. Remove the hero color wash and resting card shadows.

Validate with the existing Node suite, regenerated HTML, browser screenshots,
contrast measurements and the light/dark switch at desktop and phone widths.

Validation: regenerated the homepage and all five case studies; 69 Node tests
pass and git diff --check reports no whitespace errors. Browser checks at
1440, 768 and 390px show no horizontal overflow. The sampled light palette
has a minimum text contrast of 5.87:1, and the dark palette 7.81:1. Verified
the theme switch on the homepage and SkyFire case study. Versioned the changed
stylesheet links after reproducing an old cached palette in the preview.
Saved before/after, dark and phone screenshots in the session's white-cobalt
visualization folder. Restored the default desktop viewport and light theme.

Project palette follow-up: the user chose Petrol & citrus from the proposed
color swatches. Keep the overall white/cobalt site theme and cobalt actions.
Project preview backgrounds use a 14% tint of the chosen accent; number badges,
role dots and contribution accents carry the same identity. Hover/focus colors
mix the accent with the current text ink for contrast in each appearance.

- SkyFire: tangerine #f28a36
- mAIstra: petrol #154b57
- Bulk Buying Companion: citron #c6dc62
- Pulso: sea blue #4aaab5
- Sige: sand #d8b26e

Palette validation: regenerated all pages and passed all 72 Node tests.
Browser checks at 1440, 768 and 390px found no horizontal overflow. Verified
all five computed accent colors and the light/dark switch. Sampled role text
contrast is 5.87:1 in light and 8.66:1 in dark; number badges exceed 12:1 in
both modes. Saved actual desktop and phone screenshots for each appearance
in the session's petrol-projects visualization folder.
