# Pulso image and profile walkthrough

Extend the portfolio video with the existing Flutter image-posting and profile screens. Show a browser gallery selection, selected-image preview, caption, published image post, like/bookmark actions, profile navigation, display-name/bio edits, avatar selection and the updated profile with its post grid.

Use a workspace-local copy of the neighboring Pulso app and the original screens/controllers. Override repositories with isolated in-memory sample data, keep the normal image picker for genuine file selection and disable Supabase entirely. The post image is the portfolio's existing social card; the avatar is a fictional JD initials graphic. Reject off-machine browser HTTP requests and bundle Flutter's default Roboto font locally. Do not change the neighboring app or access live community accounts.

The recorder asserts that the image post exists with its caption, the like and bookmark actions ran, and the final profile retains the edited name/bio and avatar. Replace both public video formats and refresh the poster, case-study stills and copy only after reviewing the exported sequence. Keep previous media under `.taste-skill/pulso-image-recording/previous/`.

Completed: the exported H.264 video is 19.666667 seconds at 390 × 844 and 60 fps, with a matching WebM fallback. The final capture manifest confirms the captioned image post, like/bookmark events, edited display name and bio, selected avatar and no off-machine requests. Updated the homepage summary, case-study outcome/disclosures, all three walkthrough captions and images, and the poster.

Validation: the isolated Flutter web build succeeded; site generation and all 39 automated tests passed. Fourteen focused browser checks passed across light/dark themes at 320–1857px, actual homepage project navigation, reduced-motion manual playback, disabled JavaScript, local-file playback and autoplay denial/retry. Reviewed the final video timeline, updated profile frame, and phone/desktop case-study screenshots. Evidence is in `.taste-skill/pulso-image-recording/` and `.taste-skill/pulso-image-playback/`.

Read-only review found no playback, content-claim or network-isolation issues. Clarified its reproduction note: offline dependency resolution requires a populated package cache; a fresh setup needs one normal package resolution in the isolated copy.
