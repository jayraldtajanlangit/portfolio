# Product Proof Strip Portfolio Redesign

**Date:** 2026-10-22  
**Status:** Approved for implementation

## Purpose

Redesign Jayrald Tajanlangit's portfolio so it no longer reads as a tasteful but generic editorial template. The new homepage should make Jayrald's defining strength visible: connecting interface flows to reliable backend and data state across full-stack and mobile products.

The primary audience is software engineering recruiters and hiring managers. The first screen must identify Jayrald as a full-stack and mobile engineer, show real work immediately, and offer a direct route into the selected projects.

## Art direction

Use the design-taste direction **The Contact Sheet** (seed `703012227`), adapted into a **Product Proof Strip**.

The page uses real product captures as its visual material. Staggered columns of interface states fill a charcoal field like a contact sheet or engineering workbench. A solid text panel sits inside the sheet and carries the introduction, primary action, and contact links.

Design idea:

> On this page, Jayrald's real product-state transitions become a contact sheet of engineering proof.

The nearest competitor could also show screenshots, but not this exact set of classroom review, booking, cooperative buying, community, and accountability workflows. The work's transitions and ownership boundaries make the concept specific to Jayrald.

## Hero

Desktop opens with six staggered image columns. They use existing project posters, stills, and videos with square corners and compact project labels. A sage text panel is embedded within the sheet.

Proposed first-screen copy:

- Name: **Jayrald Tajanlangit**
- Title: **Full-stack and mobile systems, from screen to state.**
- Support: **I design the interface, backend boundaries, and data flows that keep a product working end to end.**
- Primary action: **Explore the work**
- Secondary links: GitHub, LinkedIn, and email

There is no conventional desktop header above the hero. Navigation is part of the text panel. On mobile, the text panel becomes the first full-width block, followed by a wrapped two-column image sheet.

## Visual system

- Ground: charcoal `#1c1c1c`
- Surface: `#262626`
- Primary ink: `#f1f1ef`
- Muted ink: `#9a9b96`
- Accent: sage `#8fa68e`
- Light field: concrete `#c8c5ba`
- Display type: Libre Franklin, weight 700
- Reading type: Source Serif 4, weights 400 and 600
- Square media and controls; no gradients, glass, decorative shadows, pills, icon cards, or repeated generic card grids
- A compact type scale with no more than five sizes

## Live interaction

The page's one live thing is a workflow scrubber. Selecting a project emphasizes its sequence and exposes three captured states. Visitors can move through the states using pointer input, keyboard controls, or large Previous and Next controls.

The scrubber must remain usable on a phone, announce its active state to assistive technology, and degrade to an ordered static sequence when JavaScript is unavailable. Hover can add emphasis but cannot reveal otherwise unavailable information.

## Homepage argument and structure

The page makes four claims in order:

1. Jayrald builds full-stack and mobile systems from interface through data state. Proof: the first-screen contact sheet of real products.
2. Jayrald understands complete product workflows. Proof: captured state transitions and the interactive workflow scrubber.
3. Jayrald distinguishes personal ownership from team work. Proof: concise role and engineering-boundary notes for every project.
4. Jayrald is available for relevant engineering work. Proof: a direct contact close with email and professional links.

### Project chapters

**mAIstra** is the flagship chapter and primary workflow scrubber. It expands submission review, code execution, and recorded grade into one large demonstration.

**SkyFire** uses a wide horizontal sequence: flight search, trip configuration, and confirmed booking.

**Bulk Buying Companion** uses a staggered mobile sequence: discover a deal, reserve a share, and see capacity update.

**Pulso** uses a compact vertical sequence connecting feed interaction to saved content.

**Sige** uses a quieter sequence. It clearly labels Tasks as an interface prototype rather than implying a live backend feature.

Each project exposes only its purpose, Jayrald's role, its main engineering boundary, technologies, and case-study link. Detailed architecture and ownership disclosure remain on the existing case-study pages.

### About and contact

About uses one wide paragraph plus compact facts for location, disciplines, availability, and working style.

Contact uses a direct hiring statement, the existing portrait, email, GitHub, and LinkedIn. The footer returns Jayrald's name at large scale as the closing visual gesture.

## Technical approach

Keep the existing framework-free architecture and content source. Do not migrate the stack or replace working media behavior.

Add:

- A contact-sheet renderer that assembles existing posters, stills, and videos into project runs.
- A workflow controller for selected project, active stage, keyboard interaction, accessible announcements, and mobile controls.
- CSS tokens for the new palette, type system, spacing, and motion.

Existing project data, case-study routes, videos, media fallbacks, navigation resilience, and ownership disclosures must survive the redesign.

Without JavaScript, all project states and links remain visible. Broken or unavailable videos fall back to their posters or first still.

## Responsive behavior

- Desktop: six staggered image columns and an embedded text cell.
- Tablet: three or four columns with simplified offsets.
- Mobile: introduction panel first, followed by a wrapped two-column sheet and deliberate single-column project chapters.
- Touch targets remain at least 44 by 44 pixels.
- No horizontal overflow or information available only through hover.
- The first-screen title stays within two lines at every target width.

## Motion

Use one shutter-style reveal on the principal mAIstra image. Other motion consists of short staggered entrances, subtle image settling, and immediate control feedback. Existing project videos provide the moving imagery.

Reduced-motion users receive the complete final layout with no animated travel or typing effects.

## Accessibility and error handling

- Preserve semantic heading order and real links and buttons.
- Maintain visible keyboard focus and WCAG AA text contrast.
- Announce workflow changes without moving focus.
- Preserve posters and captions when videos fail.
- Keep the page readable and navigable without JavaScript.
- Do not present prototype states, private source, team work, or local sample data as something else.

## Verification

Before completion:

- Render and inspect the homepage at 1440, 768, and 390 pixels.
- Run the design-taste lint and browser inspector with zero unresolved failures.
- Compare before and after screenshots at every viewport.
- Complete up to three visual critique and correction rounds.
- Test keyboard navigation, focus order, workflow controls, internal links, video fallbacks, reduced motion, and no-JavaScript behavior.
- Confirm no horizontal overflow, blank reveal bands, clipped content, broken media, or headings longer than two lines.
- Verify that all existing case-study routes still work and their ownership claims remain unchanged.

