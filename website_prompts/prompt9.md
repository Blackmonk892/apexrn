This is the final production audit for the ApexRN website.

Do NOT redesign the website.

Do NOT introduce new major features.

Treat the current implementation as the release candidate.

==================================================
FUNCTIONAL AUDIT
================

Test:

- landing page
- navigation
- CTAs
- phone interaction
- animations
- component previews (embedded Lab iframes)
- code examples
- copy buttons
- docs routes
- component routes
- search
- sidebar
- mobile navigation
- previous/next navigation
- GitHub links
- installation commands
- deep links (URL with a hash/query reproduces the exact preview state shown)

==================================================
REAL COMPONENT AUDIT
====================

Verify that every component showcase and documentation preview is the embedded `demo/` Lab iframe rendering the real compiled `@apexrn/ui` — not a screenshot, not a hand-rolled HTML/CSS lookalike.

Search for fake HTML replacements. Identify any place where the website claims to demonstrate an ApexRN component but is actually rendering a mock. Fix it.

Also verify the inverse mistake did NOT happen: confirm `website/package.json` has no react-native/react-native-web/Reanimated dependency and nothing in `website/` attempts to mount `@apexrn/ui` directly. That architecture decision must hold end to end.

==================================================
API AUDIT
=========

Compare documented APIs against the actual source.

Find:

- incorrect props
- nonexistent variants
- incorrect imports
- stale examples
- wrong package names
- incorrect installation commands

Fix all discrepancies.

==================================================
AEO/SEO AUDIT
=============

- Confirm every docs/component/landing page has real, crawlable static HTML text (prose, props tables, code) — not text that only exists inside an iframe.
- Confirm the generated `llms.txt`/plain-Markdown mirrors exist per component and match the HTML page's content (same source data, no drift).
- Confirm the static export produces valid HTML with correct `<title>`/meta description per route (no shared boilerplate across all pages).

==================================================
DESIGN AUDIT
============

Check every page for:

- spacing consistency
- typography
- visual hierarchy
- responsive behavior
- animation quality
- accidental generic UI
- inconsistent components
- broken states (iframe load failure, empty search results, missing props table)

The marketing site should feel exceptional.

The docs should feel extremely clear.

They should feel like the same product without looking identical.

==================================================
ENGINEERING AUDIT
=================

Run:

- lint
- typecheck
- tests
- `next build` (static export) — confirm it completes with no server-only API usage anywhere
- the registry build (`node registry/build.mjs`) and confirm its output is what `website/` copied in

Fix all errors.

Check console output for:

- React warnings
- hydration errors
- missing keys
- invalid DOM nesting
- accessibility warnings
- failed network requests (including the iframe's own asset requests under whatever base path it's served from)
- broken imports

==================================================
FINAL RULE
==========

Do not say the website is complete merely because the build passes.

Actually inspect the rendered website.

Check desktop AND mobile.

Fix anything that feels unfinished.

The final result should be something we can confidently publish as the official ApexRN website — deployed as a static export, at zero hosting cost, with every "real component" claim actually true.
