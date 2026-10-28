# Mobile case-study phone previews

The homepage used phone frames while the linked case-study renderer emitted bare
portrait recordings and captures. Reuse renderPhoneFrame for the lead video,
fallback still and three workflow images on Bulk Buying Companion, Pulso and
Sige. Keep the landscape SkyFire and mAIstra captures unchanged. Account for the
device bezel in the existing viewport-height limit, and preserve native playback
controls, accessible captions and source dimensions.

Also correct Bulk Buying's workflow headings to browse, inspect and reserve,
matching the captured evidence rather than implying a pickup-tracking capture.

Verified: the two new renderer assertions failed before the fix, then the full
73-test suite passed. All five generated case studies match the renderer.
Forty-six browser checks passed across four widths in both themes: four phone
frames on each mobile case study, complete uncropped captures, device height
limits, visible controls, successful playback through the actual homepage links
and fallback images contained in their phone screens. Reviewed Sige desktop and
Pulso phone screenshots.

The user also requested per-project design suggestions. Proposed next directions
are a boarding-pass booking story for SkyFire; handwriting/OCR comparison for
mAIstra; reservation before/after for Bulk Buying; feed/profile-first visuals for
Pulso; and a clearly labeled task-detail/completion prototype story for Sige.
These are suggestions, not an implemented redesign in this fix.
