# Project showcase refinement

Approved scope: apply numbered category labels, stronger project accents, compact
three-step walkthroughs and preview-first scroll reveals to all five homepage
projects. Retain full recordings, role/contribution text, technology lists, links,
phone frames, reduced-motion behavior and the visible Sige prototype disclosures.

Use the existing selected-work renderer/CSS and motion controller. Put each
workflow in a semantic figcaption below its recording. Summarize actual project
workflow data: SkyFire search/seat/booking; mAIstra extraction/review/grading; Bulk
Buying browsing/deal detail/reservation; Pulso sign-in/post/profile; Sige prototype
list/detail/completion. Number cards in the homepage display order. Keep mobile
card headings and CTAs aligned using the current subgrid pattern.

- [x] Test all five workflow/category records and preview-first motion ordering.
- [x] Implement renderer, media framing, labels and responsive workflow strips.
- [x] Adjust motion timing without hiding static content or replaying reveals.
- [x] Rebuild the homepage; run the Node suite and live browser checks across
  six widths in both themes, including text bounds/contrast, media playback,
  keyboard focus, mobile card alignment and reduced-motion behavior.

Verified: all 71 Node tests pass. Eighteen browser checks pass, including all five
cards at 320, 390, 768, 1024, 1440 and 1820 pixels in both themes; minimum sampled
text contrast is 5.58:1 light and 8.50:1 dark. The three desktop phone-card titles
and CTAs align exactly. All five recordings play, keyboard pause works, previews
precede their complete copy blocks by 140ms, and reduced motion cancels reveals.
Reviewed desktop web cards, the mobile-card row and a narrow light-theme card.
The served homepage exactly matches its renderer.

Review correction: the Bulk Buying recording demonstrates browsing, inspecting
a deal and reserving a share. Its caption was corrected to those steps rather
than implying a pickup-tracking capture. The corrected assertion failed first;
the updated renderer and full suite then passed. No other review findings remain.
