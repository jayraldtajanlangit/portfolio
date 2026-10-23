# Portfolio Redesign Design

**Date:** 2026-10-17  
**Status:** Approved for implementation

## Purpose

Redesign Jayrald Tajanlangit's portfolio for software engineering recruiters and hiring managers. Position Jayrald first as a full-stack and mobile engineer, with AI as a supporting capability. Replace the current neon/glitch presentation and unsupported claims with a distinctive editorial design grounded in real project evidence.

## Audience and positioning

- Primary audience: recruiters and hiring managers.
- Primary role: full-stack and mobile software engineer.
- Supporting strength: practical AI integration.
- Writing tone: concise, technical, and confident.
- Do not include invented metrics, employment history, achievements, or resume claims.

## Project lineup and order

1. **mAIstra** — flagship full-stack and AI system.
2. **SkyFire — Airline Booking System** — conventional full-stack web application.
3. **Bulk Buying Companion** — Flutter, Supabase, realtime collaboration, geolocation, and on-device ML.
4. **Pulso** — Flutter community and social product.
5. **Sige** — mobile productivity and AI coaching.

Explicitly exclude BookSphere, RideGauge, and Automated Video Captioning. Also exclude starter, clone, and undocumented repositories from the primary showcase.

## Visual direction

Use an editorial engineering-journal aesthetic rather than a generic developer template.

- Warm paper background: approximately `#F3EFE7`.
- Deep ink foreground: approximately `#171714`.
- Muted olive-gray secondary tones.
- One vermilion accent color.
- Dark charcoal frames for project screenshots and videos.
- Restrained paper texture, thin rules, asymmetric columns, and generous whitespace.
- Remove neon gradients, glowing cards, glitch effects, excessive pills, and decorative statistics.

Typography:

- **Newsreader** for large editorial headlines and project titles.
- **IBM Plex Sans** for body text, controls, and navigation.
- **IBM Plex Mono** for technologies, dates, project numbers, and technical annotations.

The hero keeps the existing portrait with a natural rectangular crop, minimal framing, and an editorial caption. It leads with “Full-stack and mobile engineer,” while AI appears as a supporting capability.

The signature visual pattern is a project dossier strip containing role, platform, stack, primary technical challenge, and repository status.

## Homepage structure

1. Header with Jayrald's name, Work, About, Contact, GitHub, and LinkedIn.
2. Hero with focused role statement, concise introduction, portrait, location, and availability.
3. Selected Work with the five approved projects in the approved order.
4. Capabilities covering full-stack web, mobile development, backend/data systems, and AI integration.
5. Short About section grounded in Jayrald's product-building approach.
6. Contact section with email, GitHub, and LinkedIn.

Remove the current fabricated Writing section, timeline, quotation, success percentage, product count, and team-lead count.

Contact details:

- Email: `jayraldtajanlangit123@gmail.com`
- GitHub: `https://github.com/jayraldtajanlangit`
- LinkedIn: `https://www.linkedin.com/in/jayrald-tajanlangit-b8646a280/`

## Case-study structure

Create a dedicated page for each project. Each case study should contain:

1. Project purpose and strongest interface preview.
2. Problem or user need.
3. Jayrald's contribution, separated from the team's overall work.
4. System architecture and key technologies.
5. Notable engineering decisions and tradeoffs.
6. Product workflow and interface gallery.
7. Repository visibility and appropriate source link.
8. Link to the next project.

Use diagrams or annotated screenshots only when they materially clarify architecture or product flow.

## Project media

Capture the real projects locally at a consistent viewport. Each project should have an 8–15 second muted loop demonstrating one meaningful workflow:

- **mAIstra:** open a submission, review extracted code, and move into execution and grading.
- **SkyFire:** search for a flight, review results, select a seat, and reach the booking summary.
- **Bulk Buying Companion:** browse the Split Board, open a deal, and reserve a share. Use a still image for receipt or barcode scanning.
- **Pulso:** move from the community feed into a post interaction or messaging thread.
- **Sige:** move from AI coaching into a task or weekly insight.

Web projects use restrained browser frames. Mobile projects use restrained phone frames. Every video must have a poster and two or three still images.

Videos begin muted only when their preview enters the viewport, pause when off-screen, and expose standard controls when opened. Reduced-motion users see still images instead of autoplaying media.

If a project cannot run because of credentials, backend services, or environment configuration, capture any repository-supported demo state first. If that is impossible, report the exact blocker and use repository-backed screenshots temporarily. Never invent an interface.

## Technical architecture

Keep the implementation framework-free: semantic HTML, modern CSS, and modular JavaScript.

```text
index.html
projects/
  maistra.html
  skyfire.html
  bulk-buying-companion.html
  pulso.html
  sige.html
assets/
  images/
  videos/
css/
  tokens.css
  global.css
  home.css
  case-study.css
js/
  projects.js
  site.js
  media.js
```

Maintain project content in one structured JavaScript data source containing the title, summary, role, technologies, repository visibility, media paths, challenge, contribution, architecture notes, and order. Homepage and case-study content should use the same source where practical.

CSS variables define palette, typography, spacing, borders, and motion timing. Reusable class patterns cover project chapters, technical labels, media frames, controls, and case-study sections.

JavaScript progressively enhances media and navigation. The site remains readable and navigable if JavaScript fails.

## Accessibility and resilience

- Meet WCAG AA contrast for text and controls.
- Keep visible keyboard focus states.
- Use touch targets of at least 44 by 44 pixels.
- Preserve logical content and heading order at all responsive widths.
- Support reduced motion.
- Provide accessible labels and controls for media.
- Reserve media space to prevent layout shift.
- Keep poster images and captions visible when video loading fails.
- Never rely on hover for essential information.
- Label public, private, and team repositories honestly.

## Responsive behavior

Verify the site at approximately 375, 768, 1024, and 1440 pixels. Editorial headings must wrap intentionally without overflow. Forms are not planned. Project chapters reflow from asymmetric desktop compositions into a clear single-column mobile sequence.

## SEO and metadata

Give every page a unique title, description, canonical-friendly path, semantic heading structure, and social preview metadata. Use descriptive alt text for meaningful images and empty alt text for purely decorative assets.

## Verification

Before completion:

- Validate page structure and internal links.
- Test keyboard navigation and focus order.
- Test reduced-motion behavior.
- Test video posters and media fallbacks.
- Inspect browser console errors.
- Verify responsive layouts at the target widths.
- Check content against repository evidence and documented ownership.
- Compress media while preserving readable UI text.
- Confirm the site remains usable without JavaScript.

