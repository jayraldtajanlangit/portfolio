# Appearance menu correction

The native select popup used Windows styling and did not match the editorial portfolio. Replace it with a 44px icon button and a right-aligned menu containing Light, Dark, and System, their icons, and a selected checkmark. Use the existing monochrome palette and brief motion; disable animation for reduced motion.

The shared renderer supplies both home and case-study controls; the portrait preview uses the same markup. Preserve saved preferences, live device appearance changes in System mode, and unavailable-storage handling. Menu controls support arrows, Home, End, Escape, Tab, outside dismissal, and restored trigger focus after a selection.

Verification: 17 Node tests, 40 custom-menu browser checks, and 48 appearance regression checks pass. Open-menu screenshots were reviewed in light and dark themes and on a phone. Menu bounds were checked at 320, 390, 768, and 1440px. The shadow is limited to the floating menu overlay.
