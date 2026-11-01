# Site v2: Web Interface Guidelines audit

Scope: website/src/components/*.tsx (not landing), src/app/layout.tsx, src/app/docs/**, not-found.tsx, globals.css, content/docs/*.mdx.
Ruled out up front: "Title Case" (we use sentence case); mono uppercase labels, zero radius, hard shadows (brutalist spec).

## Search scrim
- globals.css (end) - overlay `div.fixed.inset-0.z-50.bg-fd-overlay` (found via CDP) had a selector tied to `.fixed.inset-0.z-50[class*=...]` plus hard-coded rgba, no dimming seen in build -> now `[class*="bg-fd-overlay"] { background-color: var(--ax-scrim) !important }`; tokens rgb(0 0 0 / .5) light, / .7 dark; blur stays `none`/`blur(0px)`. Verified computed bg rgba(0,0,0,.5), backdrop-filter blur(0px), screenshot dimmed.

## Fixed
1. globals.css:body - `touch-action: manipulation` only on body (not inherited) -> applied to a, button, summary, tab, option, input, label.
2. globals.css (end) - no `prefers-reduced-motion` for fumadocs animations (dialog fade, accordion) -> global reduce rule.
3. globals.css:Search dialog - no `overscroll-behavior: contain` in search dialog / mobile drawer / scroll areas -> added.
4. globals.css:.prose td/th - numbers not tabular -> `font-variant-numeric: tabular-nums`.
5. globals.css:.ax-tabs - tabs had no hover state -> `[aria-selected=false]:hover` muted bg.
6. layout.shared.tsx:8 - brand wordmark -> `translate="no"`.
7. mdx.tsx - inline `code`, `pre`, CliStep and SetupCode blocks -> `translate="no"`.
8. component-preview.tsx - Light/Dark toggle named only by its state, ambiguous with aria-pressed -> `aria-label="<title> preview in dark mode"`.

## Already compliant / not applicable
- No `transition: all` anywhere (only `opacity 120ms linear`, reduced-motion handled).
- `outline: none` absent; global `:focus-visible` ring with offset.
- Icon-only controls (prev/next) have `aria-label`; arrows `aria-hidden`; preview img has width/height, `alt=""`, `aria-hidden`, iframe `loading="lazy"`.
- scroll-margin-top: `[id]` 5rem + `html` scroll-padding-top 5rem (sticky bar is under that).
- color-scheme: `:root`/`.dark` set and viewport `colorScheme`; theme-color meta synced to `--ax-bg` by ThemeColorSync (viewport static #FFFFFF as the SSR fallback).
- Skip link `.ax-skip` to `#nd-page`, visible on focus.
- Headings hierarchical (page title h1, MDX h2/h3); `text-wrap: balance` on headings, `pretty` on prose.
- Copy buttons ("Copy page", code block copy) are fumadocs internals; their Copied state swaps the icon in the button and cannot be edited without forking. Not changed.
- `...` in content: only `// ...` inside the theming.mdx code sample (literal code, kept).
- No forms, no `<select>`, no dates or currency, no hydration-sensitive values (theme read via useSyncExternalStore).
- Safe areas: no full-bleed fixed footers; sticky top bar only. Not applicable.
- Brand name in prose paragraphs: not wrapped (would need an MDX transform); wordmark and code are.
- Landing page: out of scope (other owner).

## Landing
Audited `website/src/components/landing/**` and `website/src/app/(home)/**` against the Vercel guidelines (sentence case kept; brutalist spec wins).

Fixed:
1. install-block.tsx:130 - "Copied" status relied on `role=status` alone -> explicit `aria-live="polite" aria-atomic="true"`.
2. (home)/page.tsx:41 - "31 parts" and version meta could wrap mid-phrase -> non-breaking spaces.
3. own-the-code.tsx:267 - "lines 36 to 62" could break after "lines" -> non-breaking spaces.
4. landing.css:.lp-hero-meta - version/part counts not tabular -> `font-variant-numeric: tabular-nums`.
5. landing.css:.lp a/.lp button - no tap-delay control -> `touch-action: manipulation`.

Already compliant: img width/height/alt everywhere (still frames `alt=""` + `aria-hidden`); no `transition: all` (explicit property lists only); catalogue row links keep a visible ring via `tr:has(a:focus-visible)` outline plus global `.lp :focus-visible`; `translate="no"` on commands, code, tree, part names; 120ms cross-fade and all transitions disabled under `prefers-reduced-motion`; iframe has `title`; no `...` (no ellipsis strings at all); `.lp-num` and `.lp-table-num` are `tabular-nums`; headings use `text-wrap: balance`; icon-less buttons have visible text, copy button has `aria-label`.
