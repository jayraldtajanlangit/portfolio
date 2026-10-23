# Email and contact section

Continue the green editorial homepage selected by the user. Give the closing contact section a clear heading, a prominent selectable email address, a primary mailto action, and a secondary copy action. Keep social links and location available. A simple contact area fits this static portfolio; a form would require additional delivery infrastructure, while a mailto-only action gives visitors fewer options when they lack a configured mail app.

Use Let’s talk as the section heading. Arrange introduction and location on the left, address and actions on the right, stacking on phones. Add an arrow to the header email link and restrained directional motion to contact links. Reveal contact elements separately on scroll; reduced motion keeps the content and removes travel.

The email link remains usable without JavaScript. Reveal Copy email only when clipboard writing is supported. Disable it during an outstanding write, announce success only after the write resolves, show a short Copied state, and provide manual-copy guidance on rejection. Reserve space for the status message and expose it through a polite live region. A failed write permits retry. Teardown removes listeners and clears the feedback timer.

## Verification

28 Node tests pass, including three contact tests that first failed before implementation. They cover the exact copied address, delayed success, temporary disabled state, feedback reset, teardown, rejected permissions, and unsupported clipboard access.

16 focused browser checks pass: contact layout at 320/390/768/1440px in light/dark/system; every mailto destination; visible address and actions; social links; copy success and rejection; reduced motion; and usable fallback when enhancement scripts are blocked. The browser copy tests stub clipboard writes to avoid replacing the user's system clipboard. No external email application was launched during verification.

Final homepage inspector: 0 failures, 0 warnings. Source lint: 0 failures, 0 warnings. All eight final desktop/tablet/mobile inspector screenshots and focused contact captures were opened. No new third-party imagery or fonts were added; arrows and copy/check symbols are original inline SVG.

ROUND 1
Seen in one second: a concise invitation, an email address, and direct email and copy actions.
Idea (one sentence): close the portfolio with a clear route from reviewing the work to contacting its author.
Live thing: copy email announces verified success, supports retry after denial, and responds to keyboard focus.
Layout words by section: hero=name and introduction split / work=feature and paired projects / toolkit=evidence rows / about=profile and prose / contact=invitation and address split.
Scores: design 7.7 · usability 8.3 · creativity 7.0 · content 8.0 → overall 7.8.
Caps applied: creativity stays at 7 for the familiar editorial composition selected by the user.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. A long address could dominate a phone line (contact-dark-390.jpg). Use responsive 20–28px type and a discretionary break before the domain; all widths fit.
2. A new confirmation could move the social links (contact-dark-1440.jpg). Reserve a status line below the actions.
3. A copy button can imply success despite denied permission (contact browser checks). Wait for the clipboard promise and announce manual-copy guidance on failure.
