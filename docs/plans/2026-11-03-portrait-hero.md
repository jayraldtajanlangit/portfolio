# Centered portrait over the name

User requested their photo centered with the hero name behind it. Retain the
white/cobalt palette and dark option. Replace the opening project mockups with
one centered monochrome portrait. Set the full name as two oversized live-text
lines behind the silhouette, with one accessible h1. Keep introduction and
project/résumé actions clear beneath the composition. On phones the type sits
higher and the portrait below it, keeping the same overlapping layers.

Asset: assets/pp/jayrald-hero-cutout.png, made with the built-in ImageGen tool.
Edit prompt: remove the gray studio wall/floor and cast shadow; preserve the
seated subject, chair, monochrome pose, facial identity, glasses, clothing and
framing; return real transparent PNG with clean hair and chair gaps. Original
attachment is retained unchanged. Generated alpha is preserved.

Validation: 69 Node tests pass. Browser checks at 320, 390, 768 and 1440px show
both name lines fit without horizontal overflow; the portrait is centered to
within 0.01px, with the image above the name in the stacking order. Checked
light/dark compositions and the actual Swarm Rebuild capture, which contains
the new portrait asset and continues rebuilding the page. Narrow phone sizing
uses the composition width so neither name nor the subject's arm is clipped.

Follow-up polish: replace the continuously typing interest sentence with the
static role “Web & mobile developer.” On wide screens, dock the introduction
and student context/actions beside the lower portrait, so the image, purpose
and primary action form one composition. On phones these remain below the
photo, with the project action before the secondary education context.

Polish verification: 69 tests pass. Browser checks at 320, 390, 768, 1440 and
1827px show fitting name lines, a centered portrait, no horizontal overflow
and no collision between side copy and the portrait silhouette. Dark mode was
also checked at the supplied screenshot's 1827×872 size. New captures are in
the session's portrait-polish visualization folder.
