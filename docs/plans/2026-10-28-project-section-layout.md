# Project section layout

The desktop heading description was detached in a right-hand column, and
vertically centered project copy shifted inconsistently against previews with
different aspect ratios and text heights. Stack the section description beneath
Projects, and top-align the SkyFire and mAIstra copy with their preview edges.

Use “Web and mobile applications, built independently and with a team.” in place
of the flight-bookings/handwritten-code line. Add restrained preview framing,
clearer contribution separation, and consistent row spacing. Keep project facts,
walkthroughs, case-study destinations and the mobile project grid intact.

Verify the generated homepage, all Node tests, and heading/row geometry on the
actual development server at 320, 390, 768, 1024, 1440 and 1820px in both themes.

Validation: all 65 Node tests pass. Live browser checks pass at all six widths in
both themes: the description is aligned beneath the title with a 12px gap, desktop
project titles sit 4px below the preview edge, and mobile previews stack with a
20px gap. Inspected desktop and mobile screenshots. Fixed the mobile display:block
override so the heading gap survives at phone sizes. Rebuilt root index.html.
