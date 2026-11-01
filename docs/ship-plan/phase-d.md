# Phase D — website rebuild (plan)

Owner brief (2026-11-01) is the spec; this file adds only the choices it leaves open. Where they conflict, the brief wins.

## Subject, audience, job

- Subject: a parts catalogue for a React Native UI kit that you copy into your app, not install as a dependency.
- Audience: React Native / Expo developers deciding whether to adopt it, then looking up one part.
- Job of the landing page: show the real parts working, and make `npx apexrn init` the obvious next step. Job of the docs: find a part, copy its add command and usage, read its props.

## Tokens (CSS variables on `:root`, redefined per theme)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#FFFFFF` | `#1A1A1A` | page background |
| `--ink` | `#000000` | `#FFFFFF` | text, rules, borders, hard shadows |
| `--ink-muted` | from DESIGN.md neo `mutedForeground` | same token, dark | secondary text (must be ≥4.5:1 on paper) |
| `--accent` | `#FFD600` | `#FFD600` | install block fill ONLY |
| `--accent-ink` | `#000000` | `#000000` | text on the accent |

- Raw preset: the switch also flips a `data-preset="raw"` attribute; on the site it swaps only the values DESIGN.md defines for raw (shadow depth 2 vs 4, ink tints). The page structure never changes between presets.
- Borders: `--rule: 2px` (rules, inputs, buttons, table lines), `--frame: 3px` (frames, install block). Shadows: `--shadow-card: 4px 4px 0 var(--ink)`, `--shadow-phone: 6px 6px 0 var(--ink)`. Radius 0 everywhere (global reset).
- Focus: `outline: 2px solid var(--ink); outline-offset: 2px` on `:focus-visible`, everywhere, never removed.
- Type: one system sans stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`) for headings and body; mono stack `ui-monospace, Menlo, Consolas, monospace`.
  - Hero 88/0.95 desktop, 44/0.95 mobile, weight 900, tracking -0.02em.
  - H2 48/1.0 desktop, 32/1.05 mobile, 900, -0.02em. H3 24/1.15, 900.
  - Body 18/28. Small body 15/24.
  - Mono label 12px uppercase, tracking 0.08em — only labels, part numbers, versions, table headers.
  - Code 14/22 mono.
- Grid: 12 columns, max 1280, gutter 32 desktop / 16 mobile, content left-aligned throughout (no centred blocks except none). Sections separated by full-width 2px rules.
- Motion: none on load or scroll. Only state feedback: row hover inversion (instant, no transition), copy button "Copied" swap, menu open. `prefers-reduced-motion` changes nothing because nothing moves.

## Layout

```
LANDING (desktop 1440)
┌──────────────────────────────────────────────────────────────────────┐
│ APEXRN                         Docs  Components  CLI  GitHub  ⌘K  ◐ │
├──────────────────────────────────────────────────────────────────────┤ 2px
│ REACT NATIVE · COPY-PASTE · v0.1.0          │  ┌──────────┐          │
│ Brutalist UI parts                          │  │  phone   │── AX-0xx DRAWER
│ for React Native.            (7 cols)       │  │  iframe  │── AX-0xx BUTTON
│ Copy components into your app...            │  │ 3px+6px  │── AX-0xx BOTTOM NAV
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓               │  └──────────┘ (5 cols) │
│ ┃ $ npx apexrn init   [COPY]┃ yellow        │                        │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛               │                        │
│ Browse all parts →   Read the docs →        │                        │
├──────────────────────────────────────────────────────────────────────┤
│ PART NO. │ NAME        │ WHAT IT DOES                  │ ADD         │ ruled table
│ AX-001   │ Accordion   │ ...                           │ npx apexrn… │ hover = inverted row
├──────────────────────────────────────────────────────────────────────┤
│ Two looks   [phone]   NEO|RAW   LIGHT|DARK                           │
├──────────────────────────────────────────────────────────────────────┤
│ $ npx apexrn add drawer (real output) │ tree + drawer.tsx lines 1-20 │
├──────────────────────────────────────────────────────────────────────┤
│ Built with ApexRN: [Settings] [Checkout] [Inbox]  mono captions      │
├──────────────────────────────────────────────────────────────────────┤
│ 49 parts · v0.1.0 · MIT · GitHub · Built by Blackmonk892             │
└──────────────────────────────────────────────────────────────────────┘

DOCS (desktop ≥1280)
┌ sidebar (sticky, ruled) ┬ content (max 760) ──────────────┬ TOC ┐
│ GETTING STARTED         │ spec-sheet header block         │     │
│  Installation           │ ┌ AX-014  DRAWER ─────────────┐ │     │
│  Theming / CLI          │ │ one line · add cmd [COPY]   │ │     │
│ COMPONENTS              │ │ ships with: brutal-surface…  │ │     │
│  AX-001 Accordion       │ └─────────────────────────────┘ │     │
│  ...                    │ preview + controls, usage, props│     │
└─────────────────────────┴─────────────────────────────────┴─────┘
```

Mobile (390): top bar collapses to wordmark + search + menu; hero stacks text → command → phone (no leader lines); parts table drops the WHAT IT DOES column and keeps PART NO. / NAME / ADD (ADD wraps); docs sidebar becomes the full-screen ruled menu.

## Components to build (site-only, in `website/src/components/`)

TopBar, MobileMenu, ThemeSwitch (mode + preset, persisted in localStorage, broadcast to every preview iframe via the existing postMessage protocol), Rule, Frame, InstallBlock (the only accent), CopyButton, MonoLabel, PartsTable, PhoneFrame (iframe + leader-line variant), CodeBlock (server-highlighted, mono 14), Terminal, FileTree, PropsTable, SpecHeader, DocsSidebar, Toc, Footer, SearchDialog (Pagefind, ⌘K).

Part numbers: `AX-` + 3-digit index in registry order from docs-data.json, computed once in a `lib/parts.ts` helper used everywhere.

## Self-critique against the generic defaults

1. **Broadsheet look (zero radius, hairline rules, dense columns) is a known default.** The brief pins zero radius and rules, so they stay — but the rules here are heavy (2px/3px) and carry structure (sections, table rows, spec sheets), not decoration; no hairlines, no newspaper columns of prose.
2. **Mono uppercase labels and "A · B · C" meta strings are template tells.** The brief asks for both, in specific places (hero label, part numbers, versions, table headers). Ruling: use them ONLY there; every heading, nav item, button and body label is sentence case sans. No eyebrow above section headings except where it names a part number.
3. **"→" appended to links is a tell.** The brief specifies "Browse all parts →" and "Read the docs →" exactly; keep those two and nowhere else.
4. **Black + single bright accent is a default.** The brief pins `#FFD600` as the one accent. Ruling: it appears exactly once per page (the install block on `/`, the add-command block in each component spec header) — never as hover, link colour, focus or highlight.
5. **What makes it this product, not any docs site:** the industrial parts-catalogue frame — every part has a number, the table is the hero's next screen, and the live phone with leader lines to labelled parts reads like an exploded product diagram. That is where the boldness is spent; everything else is quiet ink on paper.
6. **Removed one accessory:** no icon set on the landing page at all (the banned list forbids icon-per-feature; the theme switch and menu use text labels or a single glyph).

## Rulings (logged in LEDGER.md)

- Phase D branches from `ship/v0.1`; `ship/v0.1` is merged into `ship/phase-d` after Phase B lands so docs-data includes the new components.
- Fonts are system stacks only (no web-font download): the brief specifies "system sans"; keeps Lighthouse and no-network builds simple.
- Syntax highlighting stays server-side with the existing highlighter, recoloured to ink-only (bold for keywords, muted for comments) — no coloured token themes.
