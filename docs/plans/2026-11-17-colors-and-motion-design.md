# Colors and motion — design

Date: 2026-11-17 · Status: approved in conversation ("yes go ahead")

## Why

Jayrald felt the portfolio "lacks design", specifically in **colors and animations**. The hero (Bodoni name, black-and-white portrait, burgundy) has personality; everything below it is beige cards with grey text and quiet fade-ins. The goal is to carry the hero's confidence through the whole page and make the page feel alive, with the projects as the most colorful part.

Mockups shown and chosen: `.superpowers/brainstorm/1304-1794882650/content/colors-and-motion.html` (options) and `recommended-mix.html` (the chosen mix).

## Decisions (Jayrald's)

- **Colors: "wine & cream + project colors" mix.** Cream page, burgundy identity, deep wine and burgundy bands, and each project's own color where the work is.
- **Animations: 1, 2, 4, 5 — not 3 (no tech-stack marquee).**
  1. Name rises in letter by letter, then the portrait fades up.
  2. Project media tilts toward the cursor and glows in the project's color.
  4. Projects background changes to each project's color while scrolling.
  5. Custom cursor dot that grows into a labelled bubble over projects.
- **Keep the Swarm intro.** The name rise plays right after Swarm finishes; when Swarm does not run, it plays immediately.

## Decisions (my calls, played back and accepted)

- **Hero unchanged** in color and layout, in both themes.
- **Section titles** use Bodoni Moda with a small index number (01 About, 02 Projects, 03 Tech stack, 04 Certifications) and a thin rule. Contact keeps its own large serif title.
- **Projects become one per row** (full-width rows, media alternating left/right on desktop, stacked on mobile), replacing the 2 + 3 grid, so that each project owns a stretch of scroll for the color change.
- **Certifications become compact**: a two-column ruled list (icon, title, issuer · type, arrow). There are no card backgrounds, and the section is about half its current height. The type ("Track completion", "Course certificate") stays visible for honesty, so these are compact rows, not pills.
- **Dark mode:** cream → near-black plum, wine → deeper plum, project colors unchanged, contact → deep burgundy. The hero keeps its existing dark palette.
- **Phones:** no tilt and no custom cursor (`(hover: hover) and (pointer: fine)` only); the color change still works.
- **Reduced motion:** no name rise, tilt or cursor, and no color fade. Each project row shows its own static color band.
- **No JavaScript:** each project row shows its own static color band, and the name is static.
- **Case-study pages** inherit the new palette through shared tokens, and each uses its own project color as its accent. Their layouts are unchanged.
- **Cursor bubble label is honest:** "View" over links that open a case study; "Play" or "Pause" over the preview video, because clicking the video toggles playback and doesn't navigate.

## Palette

| Token | Light | Dark |
|---|---|---|
| Page (cream) | `#f4eee8` | `#141015` |
| Page deep | `#ece3db` | `#1e171c` |
| Ink | `#2a2226` | `#f1e8eb` |
| Muted | `#5f5157` | `#bdaeb5` |
| Rule | `#ddd1c7` | `#3a2e35` |
| Burgundy (accent, links) | `#6e2439` | accent `#a3365a`, links `#e3a9bb` |
| Wine (Projects intro band) | `#3a1320` | `#22101a` |
| Contact band | `#6e2439` | `#3d1524` |
| Text on colored bands | `#fbf3ee` | `#fbf3ee` |
| SkyFire | `#b4471a` | same |
| mAIstra | `#1f5f70` | same |
| Bulk Buying | `#4a7330` | same |
| Pulso | `#2f5c94` | same |
| Sige | `#946320` | same |

Each project tone has at least 5:1 contrast with `#fbf3ee` (computed: SkyFire 5.4, mAIstra 7.2, Bulk 5.5, Pulso 6.8, Sige 5.1).

## Behavior details

- **Name rise:** the letters of the existing `h1` (which keeps its `aria-label`) are wrapped in spans and rise from a clip mask with a 45 ms stagger, and the portrait fades up after them. It's triggered by `html[data-name-rise="play"]`. The head bootstrap sets this immediately when Swarm will not run (so there is no flash). Otherwise `motion.js` sets it on a `swarm-rebuild:end` event, which the Swarm adapter dispatches when it releases without running or when the engine's app stops.
- **Color change:** an IntersectionObserver on the project rows, using a narrow band at mid-viewport, sets `data-active-project` on the Projects section. CSS maps that value to the section background, with a 700 ms transition. The section header region maps back to wine.
- **Tilt:** pointer position on the media sets `rotateX`/`rotateY` (max about 7°) and a moving glare highlight. Hover adds a glow in the project color. Movement is throttled with rAF and resets on leave.
- **Cursor:** an `aria-hidden` dot follows the pointer (lerp, rAF only while moving) and hides the native cursor while enhanced. It grows slightly over links and buttons and becomes a bubble over project media and project links. It is cream over dark surfaces and burgundy over light ones. It starts after Swarm, like the name rise.

## Non-goals

- No moving tech-stack strip.
- No changes to the hero layout or copy, to the case-study layouts, or to the Swarm engine internals beyond the end signal in the adapter.
- No new content (copy edits only where a heading gains a serif or italic treatment).
