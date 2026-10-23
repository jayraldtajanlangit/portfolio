# Landscape preview fit

The homepage landscape figures forced both recordings into padded 16:10 panels. SkyFire is 1440×900 and mAIstra is 1280×720, so the shared panel ratio and padding left visible gaps around the video.

Keep the existing project layout, typography, autoplay and mobile phone frames. Let landscape video height follow its intrinsic ratio at full column width, and remove the figure background, padding and fixed ratio. This fits the complete encoded frame without adding a crop or stretching it. Existing guided camera movements inside the recordings remain part of the videos.

Verification: the browser reproduction failed all 32 fit checks before the change and passed all 32 afterward. It covers both homepage versions, light/dark themes, 390/768/1381/1857px widths, exact figure/video edge alignment, intrinsic ratio, autoplay, hidden controls and horizontal overflow. All 41 automated tests pass. The three-width design inspector reports zero failures and the existing stale direction-sheet font warning; the approved Manrope/Bodoni typography remains unchanged. Desktop and mobile screenshots were visually reviewed. Evidence: `.taste-skill/landscape-fit/`.
