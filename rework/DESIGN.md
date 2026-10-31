# DESIGN.md — ApexRN design bible

Every component, specimen and website page is built and reviewed against this file. It lists **decisions**, not moods. If a component needs something this file does not cover, the orchestrator adds a rule here first, then builds. Start values are tuned once on the specimen board (Phase B0), then locked.

## 0. Where the ideas come from (and what we take)

We borrow proven systems and translate them into brutalist vocabulary. We do not copy anyone's look.

### shadcn/ui: the model for the whole library
- **Semantic token pairs:** every surface token has a matching `*Foreground`, and components only ever use pairs.
- **Variants as data:** each component has a `variants` + `sizes` map (shadcn uses `cva`), never inline conditionals.
- **Compound parts and `asChild`:** composition is preferred over prop lists. This comes from Radix, which shadcn is built on.
- **Restraint:** shadcn looks good because almost everything is neutral and only the primary action is loud.
- **A small API surface:** components look plain by default, and you get your own look by editing tokens.

### Radix primitives: behaviour contracts
- Controlled and uncontrolled versions of everything.
- Overlays trap focus, close on escape/back, and return focus to the trigger.
- Every interactive part exposes its state to assistive tech.

### Material 3: state and motion discipline
- Every interactive component has an explicit, consistent state model: enabled, pressed, focused, disabled, error.
- Elevation means something.
- Motion uses one easing family with entry slower than exit.
- We replace Material's tonal "state layers" with brutalist physics (sink, offset, outline).

### Apple HIG: platform respect
- 44pt minimum targets (48dp on Android).
- Dynamic Type / font scale is honoured, not fought.
- Reduced Motion and the safe areas are respected.
- Edge-swipe is not hijacked on iOS where it means "back".

### Swiss / International Typographic Style: structure
- A strict grid, a rule-based type scale, numbered systems, and visible rules (lines) as structure.
- The website's "parts catalogue" concept comes from here.

### Industrial hardware UI (think Teenage Engineering, Braun): the brutalist soul
- Function labels in small mono caps.
- One signal colour.
- Controls that look like physical parts you press.
- Nothing decorative that does not also explain something.

**What brutalist means here:** thick borders, zero radius, hard offset shadows, flat fills, heavy type and tactile presses, applied *with shadcn's restraint*. We are loud in one place per screen and quiet everywhere else.

## 1. Tokens

### 1.1 Colour roles (shadcn-style semantic pairs)

Add these to `ColorScheme` in both presets and both schemes. Components may only use the roles in this table, and only in their pairs.

| Role | Purpose |
|---|---|
| `background` / `foreground` | Page and its text |
| `surface` / `surfaceForeground` | Cards, sheets, drawer panel (equivalent to shadcn `card`/`popover`) |
| `muted` / `mutedForeground` | Quiet regions, secondary text, placeholders |
| `primary` / `primaryForeground` | The one loud action per screen |
| `secondary` / `secondaryForeground` | A second action, still visible |
| `accent` / `accentForeground` | Highlight, selection, the active Drawer/BottomNav block |
| `destructive`, `success`, `warning` (+ `Foreground`) | Status only, never decoration |
| `border` | All borders |
| `input` | Input borders when idle (may equal `border`) |
| `ring` | Focus outline |
| `shadow` | Hard shadow fill |
| `scrim` | Overlay backdrop (opacity 0.5 in light, 0.7 in dark) |

**Dark-mode correction (do this first):** the dark `shadow` must stop being `#FFFFFF`. A white slab behind every surface glows on OLED screens and looks cheap.
- Start the dark shadow at a mid-grey (around `#4A4A4A` on `#1A1A1A`).
- Keep the borders bright.
- Decide the final value on the specimen board, side by side.

### 1.2 Presets
- **`neo` (default):** the current palette, kept with the dark shadow fix.
- **`raw`:** paper and ink, with a single signal colour.
  - Light theme: paper background (around `#F2F0EB`), ink foreground (around `#111111`), `primary` = ink with paper text, `accent` = a paper-dark grey, `destructive` is the only colour.
  - Dark theme: the inverse.
  - The shadow is 2px and reads as misregistered print.
- Both presets must pass `tokens:check` (≥ 4.5:1 for every pair, in both schemes).

### 1.3 Space, size, border, shadow

| Token | Values | Rule |
|---|---|---|
| Grid | 4pt | Every padding, gap and margin is a `spacing` token. No odd numbers. |
| Control height | sm 40 / md 48 / lg 56 | md is the default. Hit target ≥ 44/48, using `hitSlop` when visually smaller. |
| Border | **2** controls, **3** containers/overlays | No other widths. The 4px border is retired except for the focus ring. |
| Shadow depth (elevation) | 0 flat content · **2** controls · **4** cards · **6** overlays | `BrutalSurface` reads only this token. Pressed means the depth drops to 0. |
| Radius | 0 | Always. No exceptions, including avatars (square). |

## 2. Type

Add a `Text` primitive whose `variant` is one of the roles below. Components never set font sizes directly.

| Role | Size / line height | Weight | Notes |
|---|---|---|---|
| `display` | 32 / 36 | 900 | Tracking −0.5. Screen titles and hero numbers only. |
| `title` | 20 / 24 | 800 | Card, dialog, drawer and sheet titles. |
| `body` | 16 / 22 | 400–500 | Sentence case. |
| `label` | 12 / 16 | 700, **mono**, uppercase, tracking +1 | Field labels, section labels, badges, part numbers. |
| `mono` | 14 / 20 | 500, tabular figures | Numbers, prices, dates, counts, codes. |

- **Font families:** system sans for display/title/body. For mono, use `Menlo` (iOS), `monospace` (Android), `ui-monospace` (web).
- **Font scale:** honour the OS font scale up to 1.3×, with layouts checked at 2×. Text wraps or truncates with an ellipsis; it never clips.
- **Uppercase is for `label` only.** Button text is sentence case, set in title weight. This is the single biggest move away from the generic neo-brutalist look.

## 3. States (the same everywhere)

| State | Treatment |
|---|---|
| Idle | Surface at its elevation depth. Border uses `border` (or `input` for fields). |
| Pressed | Surface sinks into its shadow (translate by depth, depth goes to 0), with a light haptic. Spring `{damping 15, stiffness 400, mass 0.5}`. |
| Focused | 2px `ring` outline, offset 2px outside the border (shadcn's ring-offset idea). **No glow, ever.** |
| Selected / active | Inverted block: `foreground` fill with `background` text. Or the `accent` block for navigation. Not a tint. |
| Disabled | `opacity.disabled`, dashed border, no shadow, no haptic. Still readable. |
| Error | Border becomes `destructive`. A message appears below in `label` style with a ✕ glyph drawn as an icon. Colour is never the only signal. |
| Loading | Width is kept. The label is replaced by a 3-block stepping indicator. The control does not change size. |
| Empty / long content | Every list or text slot defines both cases (empty state, two-line truncation rule). |

## 4. Motion grammar

- **Press:** the spring above. This is the only bouncy thing in the library.
- **Overlays:**
  - They slide from their edge with a hard stop, no bounce, no scale.
  - Entry is 180ms on `Easing.bezier(0.2, 0, 0, 1)`; exit is 120ms on `Easing.bezier(0.3, 0, 1, 1)`.
  - The scrim fades in parallel.
- **Selection** (tabs, segmented, bottom-nav, drawer active block): the block slides to its new position in 160ms with the entry easing.
- **No fades combined with scaling, no blur, no stagger cascades, no looping animation** except Skeleton and Marquee, and both stop under reduced motion.
- **Reduced motion:** any movement becomes a 100ms opacity change, and the press becomes an instant sink.
- Animate transform and opacity only, on the UI thread (see the `CLAUDE.md` rules).

## 5. Icons

- 24×24 grid, 2px stroke matching the control border, square caps, miter joins, no fills except the selected state.
- One family only (`lib/icons`). Any new icon gets drawn to these rules.
- An icon-only button always has an accessible label.

## 6. Component anatomy rules (from shadcn and Radix)

- **Parts, not props:** compound components (`Dialog`, `DialogTrigger`, `DialogContent`…) with `asChild` triggers. A convenience wrapper is allowed (AlertDialog), but the parts must exist too.
- **`lib/variants.ts`:** a tiny typed `variants({ base, variants, defaultVariants })` helper, a dependency-free `cva` for React Native styles. Every component's look is defined through it.
- **Every component, before it is built, gets a one-line comparison to its shadcn equivalent** (where one exists) in its spec: same anatomy, or a deliberate difference with the reason. Mobile-only components (BottomNav, AppBar, FAB, Sheet) compare against Material 3 and the HIG instead.
- **Density:** real-app density, not chunky.
  - List rows are 56 (one line) or 72 (two lines).
  - Section gaps are 24.
  - Screen padding is 16.

## 7. Composition rules (what makes screens look designed)

1. **One loud thing per screen.** A screen has at most one `primary` fill. Everything else is `surface`, outline or ghost.
2. **Depth follows hierarchy.** Do not nest shadows: a shadowed card's children are flat.
3. **Rules beat boxes.** Group content in lists with 2px rules (Separator), not by putting every item in its own bordered box.
4. **Mono for data, sans for language.** A price, a date or a count is always `mono`.
5. **Numbered structure** (`01`, `02`) only where order means something: drawer sections, steps, catalogue parts.

## 8. The specimen board and reference screens (the gate)

### Phase B0 specimen board (`demo/src/screens/specimen/`)
One scrolling screen that shows, side by side in light/dark × neo/raw:
- every token pair;
- the type scale;
- the border and depth ladder;
- all states of Button, Input and Checkbox;
- the icon set.

Tune values here, then lock them.

### Reference screens (`demo/src/screens/reference/`)
Built with **only** `@apexrn/ui`, no custom styling beyond layout:
1. **Settings:** AppBar, list rows with switches, a Drawer, a destructive action.
2. **Checkout:** form fields with error states, Select, a price summary in mono, a primary button, a Toast on submit.
3. **Inbox:** SearchBar, Chips as filters, list items with badges, BottomNav, an empty state, swipe or long-press actions.

### Gate
The orchestrator reviews screenshots of all three reference screens, in both schemes and both presets, against sections 1 to 7. They must look like a shipped product, not a component catalogue.
- If any screen fails, the fix happens in the **system** (tokens, primitives, rules), never as a one-off patch in that screen.
- The website reuses these screenshots.
