# Compact section heading and technology spacing

The Selected projects and Tech stack descriptions were pushed to the far right by a full-width `space-between` header. The technology labels occupied a proportional third of the page, creating another large horizontal gap before the icons.

Group each description directly beneath its heading with a 12px gap. Replace the proportional desktop technology label track with a 7rem track and retain the 24px gap before the icon list. Existing stacked mobile categories, icon sizes, keyboard labels and links remain intact. This is a CSS-only adjustment in `css/home.css`.

Verification: 13 targeted browser checks pass at 320/390/768/1024/1440/1857px in both themes, including compact heading gaps, compact category columns, no horizontal overflow, minimum icon targets and keyboard label visibility. Desktop and mobile screenshots reviewed. Source lint has no failures or warnings. Evidence: `.taste-skill/section-spacing/`.
