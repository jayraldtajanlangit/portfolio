# Pulso account screens in the walkthrough

Extend the existing real Flutter capture with the account entry and exit flow. Start signed out at Welcome to Pulso, preview Create account, return to sign-in, enter fictional demo credentials, sign in, retain image posting/reactions/profile/avatar editing, and finish by signing out to the welcome screen.

Use the original auth screens and AuthController. The isolated AuthRepository starts without a session, accepts only the fictional local demo credentials, emits local session changes, and clears the session on sign-out. Supabase remains disabled and browser requests remain limited to the local capture host. Registration is a screen preview; do not claim to create a real account or verify email confirmation.

The capture must assert both sign-in/sign-out events and a cleared final session, in addition to the existing image-post, like/bookmark, profile-name/bio and avatar assertions. Update both media formats, motion cues, login poster/first still, caption and disclosures. Preserve the previous image/profile-only media under `previous-auth/`.

Completed: both video formats show the full account-to-profile journey. The H.264 export is 27.466667 seconds at 390 × 844 and 60 fps; the profile uses a full-frame camera and matching duration. The first still and poster now show sign-in. The manifest records sign-in and sign-out, a false final session, and the previously verified post/profile changes. Only external font-fallback requests were attempted and aborted; no live authentication or community service was contacted.

Validation: isolated Flutter build, site generation and all 39 automated tests passed. Fourteen browser checks passed for actual project-link navigation, both themes at 320–1857px, reduced-motion/manual playback, disabled JavaScript, local-file playback and autoplay rejection/retry. Reviewed the final video timeline and explicit registration/sign-out frames. Read-only review found no actionable issues in the auth fixture, capture flow, claims or service isolation.
