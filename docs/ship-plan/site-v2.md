# Site v2: Fumadocs + poster landing

The owner's brief is the spec. This file holds the plan and the split of the work.

## Design tokens (site)
- Ink `#000000`, paper `#FFFFFF`, dark paper `#1A1A1A`, dark surface `#222222`. Raw: `#F2F0EB` / `#111111`.
- Signal `#FFD600`, used once on the page: the landing install block.
- Ring `#3D5AFE` (light) / `#8C9EFF` (dark): a 2px focus outline with a 2px offset.
- Radius 0. Borders 2px (dialogs and the phone 3px). Shadows are hard offsets: 4px for cards and preview boxes, 6px for dialogs, the phone and the install block. Dark shadow `#5A5A5A`.
- Headings: system sans, 900 weight, tight tracking. Labels: `ui-monospace` 12px, uppercase, +0.08em, only for part numbers, tabs, table headers and sidebar group titles.
- The scrim is solid `#000` at 0.5 (light) / 0.7 (dark), with no blur.

## One loud thing
The headline and the phone. Everything else is quiet ink on paper. No section eyebrows; section titles are sentence-case h2s.

## Branches
- `ship/site-v2`: the integration branch and the PR into main.
- `site-v2/preview`: preview/ only (example route, examples, showcase route, screenshot script).
- `site-v2/web`: website/ (Fumadocs foundation, theme, docs, ComponentPreview, MUST-NOT-BREAK test).
- `site-v2/landing`: website landing, after web lands.
