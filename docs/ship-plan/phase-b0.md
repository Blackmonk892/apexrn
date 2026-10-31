# Phase B0: Design system first. Implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tokens, presets and primitives match `rework/DESIGN.md` §1–§5. Both presets pass the contrast gate, and a specimen board shows them side by side so the start values can be tuned and locked.

**Architecture:** Each preset is four plain palette objects plus a depth ladder in `lib/colors.ts`. `ApexRNProvider` takes `preset` and exposes `colors` and `elevation` through `useTheme()`. Motion constants move to `lib/motion.ts`. `lib/variants.ts` is a typed, dependency-free cva. `BrutalSurface` takes an elevation key instead of a pixel offset and owns the focus ring, disabled and invalid treatments. `Text` is the only place font sizes live. Existing call sites are migrated mechanically so typecheck stays green; Phase B redesigns each component properly.

**Tech Stack:** as Phase A, plus Jest harness from A2 (`demo/__tests__`, `renderWithTheme`).

**Spec:** `rework/DESIGN.md` (§1 tokens, §2 type, §3 states, §4 motion, §5 icons, §6 variants, §8 specimen board), `rework/ORCHESTRATOR.md` §1.3–1.5 and §2b, `CLAUDE.md`.

## Global Constraints

- Preset names: `neo` (default) and `raw`. `ApexRNProvider` prop: `preset?: 'neo' | 'raw'` (default `'neo'`).
- Colour roles, in every preset × scheme: `background foreground surface surfaceForeground muted mutedForeground primary primaryForeground secondary secondaryForeground accent accentForeground destructive destructiveForeground success successForeground warning warningForeground border input ring shadow scrim`.
- Scrim opacity: 0.5 light, 0.7 dark.
- Border widths: **2** controls, **3** containers/overlays. No other widths except the focus ring.
- Elevation ladder keys: `flat` 0, `control` 2, `card` 4, `overlay` 6 (neo). Raw: the same keys, every non-zero depth is **2** ("misregistered print").
- Focus ring: 2px `ring`, offset 2px outside the border. No glow.
- Disabled: `opacity.disabled`, dashed border, elevation 0, no haptic.
- Press: spring `{ damping: 15, stiffness: 400, mass: 0.5 }`; surface translates by its depth, depth → 0; no squash, no fade. Reduced motion: instant sink.
- Overlay motion: enter 180ms `Easing.bezier(0.2, 0, 0, 1)`, exit 120ms `Easing.bezier(0.3, 0, 1, 1)`. Selection: 160ms, enter easing. Reduced motion: 100ms opacity.
- Type roles: `display` 32/36 w900 tracking −0.5 · `title` 20/24 w800 · `body` 16/22 w400 (`bodyStrong` not added) · `label` 12/16 w700 mono uppercase tracking +1 · `mono` 14/20 w500 tabular-nums. Mono family: `Menlo` iOS, `monospace` Android, `ui-monospace` web. `maxFontSizeMultiplier` 1.3.
- Contrast gate: every fg/bg pair ≥ 4.5:1; `border`/background and `ring`/background ≥ 3:1 (WCAG 1.4.11 non-text); `shadow`/background ≥ 1.5:1 (decorative; the border carries the edge). All four palettes.
- No hex outside `lib/colors.ts`. No `any`. Comments say why. Every new lib file is registered in `registry/meta.json`.
- Strictly no AI slop: no narrating comments, no filler docblocks, no TODOs, no emoji, no marketing copy.

## Review Focus

1. A consumer who still writes `<ApexRNProvider>` with no `preset` must get exactly the neo look (B0-1 test: default preset is neo).
2. A tree with two nested providers of different presets (the specimen board does this) must resolve each subtree to its own provider (B0-1 test).
3. `check-contrast` must fail loudly if a palette is missing a role, not skip it (B0-1 fixture test).
4. Disabled surfaces must swallow presses **and** haptics, and must not keep a stuck sunk state if `disabled` flips mid-press (B0-3 test).
5. `variants()` with a variant value not in the map must fall back to `defaultVariants` at runtime instead of returning `undefined` styles (B0-2 test).

---

### Task 1 (B0-1): Colour roles, presets, provider `preset`, contrast gate

**Files:**
- Modify: `packages/ui/lib/colors.ts`, `packages/ui/lib/theme.tsx`, `packages/ui/index.ts`
- Modify: `registry/check-contrast.mjs`; create `registry/check-contrast.test.mjs` + `registry/__fixtures__/`
- Modify: `website/scripts/generate-docs.mjs` (token parser must read the new shape; the theming page shows the neo preset)
- Modify: `demo/__tests__/utils/render.tsx` (`renderWithTheme(ui, { mode?, preset? })`)
- Modify: root `package.json` (`"tokens:test": "node --test registry/"`)
- Test: `demo/__tests__/theme-presets.test.tsx`

**Interfaces:**
- Produces in `lib/colors.ts`: `type PresetName = 'neo' | 'raw'`; `interface ColorScheme` with the 23 roles above; `interface Elevation { flat: number; control: number; card: number; overlay: number }`; `interface Preset { light: ColorScheme; dark: ColorScheme; elevation: Elevation; scrimOpacity: { light: number; dark: number } }`; `export const presets: Record<PresetName, Preset>`. Palettes are declared as top-level `const neoLight: ColorScheme = { … }` (also `neoDark`, `rawLight`, `rawDark`) so the checker can parse them by name. `borderWidths = { control: 2, container: 3 } as const`; `focusRing = { width: 2, offset: 2 } as const`. Remove `colors` and `shadowOffset` exports.
- Produces in `lib/theme.tsx`: `ApexRNProvider({ children, defaultMode?, preset? })`; `ThemeContextType` gains `preset: PresetName`, `elevation: Elevation`, `scrimOpacity: number` (for the resolved scheme). Fallback outside provider = neo light.
- `check-contrast.mjs` exports `checkSource(source: string): string[]` (list of failure lines; empty = pass) and keeps its CLI behaviour.

- [ ] **Step 1: Failing tests.** `registry/check-contrast.test.mjs`: real `colors.ts` → `[]`; fixture where `rawDark` lacks `ring` → one line containing `rawDark` and `ring`; fixture with `neoLight.border` = background → line mentions `border` and `3:1`. `demo/__tests__/theme-presets.test.tsx`: probe component prints `useTheme().preset` and `elevation.card`; no prop → `neo`, `4`; `preset="raw"` → `raw`, `2`; nested `<ApexRNProvider preset="raw">` inside neo → inner probe `raw`, outer `neo`; dark raw → `colors.background` equals `presets.raw.dark.background`.
- [ ] **Step 2:** run both → FAIL.
- [ ] **Step 3: Implement.** neo light/dark = current values plus new roles: `surface` = background (light `#FFFFFF`, dark `#222222`), `surfaceForeground` = foreground, `input` = border, `ring` = light `#3D5AFE` / dark `#8C9EFF`, dark `shadow` = `#4A4A4A`. raw light: background `#F2F0EB`, foreground `#111111`, surface `#F2F0EB`, muted/accent `#DEDAD2`, mutedForeground `#5A5750`, primary `#111111`/fg `#F2F0EB`, secondary `#DEDAD2`/fg `#111111`, accent fg `#111111`, destructive `#C8102E`/fg `#FFFFFF`, success and warning = ink on paper-dark (`#DEDAD2`/`#111111`; raw has one colour — status reads through the ✕/✓ glyph and label, never colour), border/input/shadow `#111111`, ring `#C8102E`, scrim `#111111`. raw dark: the inverse (background `#111111`, foreground `#F2F0EB`, …, destructive `#FF5A5F`/fg `#111111`, shadow `#5A5750`). These are **start values**; B0-6 tunes them. Fix any pair the checker rejects by adjusting the start value, and list each adjustment in the report.
- [ ] **Step 4: Migrate consumers mechanically** so `npm run typecheck` stays green: `borderWidths.standard`→`control`, `heavy`/`extraHeavy`→`container`; `shadowOffset.*`→ read `useTheme().elevation` (`subtle`→`control`, `standard`→`card`, `elevated`→`overlay`); every `colors.light/dark` import outside theme → `presets.neo`. Update `index.ts` exports (`presets`, `borderWidths`, `focusRing`, types `PresetName`, `Preset`, `Elevation`). Update `generate-docs.mjs` token parsing to the new shape and run `node website/scripts/generate-docs.mjs` successfully.
- [ ] **Step 5: Verify:** `npm run tokens:check`, `npm run tokens:test` (root); in demo `npm test`, `npm run typecheck`, `npm run doctor`; `node registry/build.mjs`.
- [ ] **Step 6: Commit** `feat(ui): colour roles, neo + raw presets, provider preset prop`.

### Task 2 (B0-2): `lib/variants.ts` and `lib/motion.ts`

**Files:**
- Create: `packages/ui/lib/variants.ts`, `packages/ui/lib/motion.ts`
- Modify: `packages/ui/lib/colors.ts` (remove `motion`), `packages/ui/lib/use-press-physics.ts` (import from `./motion`), `packages/ui/index.ts`, `registry/meta.json` (descriptions for `variants`, `motion`)
- Test: `demo/__tests__/variants.test.ts`, `demo/__tests__/motion.test.ts`

**Interfaces:**
- `variants<Slots extends Record<string, object>, V extends Record<string, Record<string, DeepPartialSlots<Slots>>>>(config: { base: Slots; variants: V; defaultVariants: { [K in keyof V]: keyof V[K] } }): (selection?: { [K in keyof V]?: keyof V[K] | null }) => Slots`. Per slot, merge order is base, then each variant group in declaration order. The result is plain objects (a new object per slot, never mutating `base`). Export `type VariantProps<F>` that extracts the selection type from the returned function.
- `motion.ts`: `export const motion = { press: { damping: 15, stiffness: 400, mass: 0.5 }, enter: { duration: 180, easing: Easing.bezier(0.2, 0, 0, 1) }, exit: { duration: 120, easing: Easing.bezier(0.3, 0, 1, 1) }, selection: { duration: 160, easing: <enter easing> }, reduced: { duration: 100 } } as const` (Easing from reanimated). Plus `useMotion()` hook returning `{ reduceMotion: boolean; enter; exit; selection }` where, under reduced motion, `enter`/`exit`/`selection` all become `{ duration: 100, easing: Easing.linear }` (callers switch to opacity themselves).

- [ ] **Step 1: Failing tests** (`variants.test.ts`): button-like config with slots `container`/`label`, groups `variant {primary, ghost}` and `size {sm, md}`, defaults `primary`/`md`: `fn()` equals base+primary+md per slot; `fn({ size: 'sm' })` keeps primary; `fn({ variant: 'nope' as never })` equals the default result; `fn({ variant: null })` uses the default; calling twice does not mutate `base` (deep-equal to a snapshot copy). `motion.test.ts`: `motion.enter.duration === 180`, `motion.exit.duration === 120`, `motion.selection.duration === 160`; `useMotion()` with reduced motion mocked on → `enter.duration === 100`.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement** both files; update press physics import; no behaviour change to press physics yet (B0-3 owns that).
- [ ] **Step 4: Verify:** demo `npm test`, `npm run typecheck`; root `node registry/build.mjs` (registry must list `variants` and `motion`; `motion` depends on reanimated → worklets implied).
- [ ] **Step 5: Commit** `feat(ui): typed variants() helper and motion constants`.

### Task 3 (B0-3): BrutalSurface reads the depth ladder; press, focus, disabled, invalid

**Files:**
- Modify: `packages/ui/components/brutal-surface.tsx`, `packages/ui/lib/use-press-physics.ts`, every component passing `offset=` / `borderWidth=` to BrutalSurface (mechanical), `packages/ui/index.ts` (drop `PressPhysicsConfig`)
- Test: `demo/__tests__/brutal-surface.test.tsx`

**Interfaces:**
- `BrutalSurfaceProps`: remove `offset`, `borderRadius`; `elevation?: 'flat' | 'control' | 'card' | 'overlay'` (default `'card'`); `borderWidth?: 'control' | 'container'` (default `'container'`); add `invalid?: boolean` (border → `destructive`); add `focused?: boolean` (forces the ring; otherwise the surface shows the ring while its Pressable has focus via `onFocus`/`onBlur`). Depth = `useTheme().elevation[elevation]`; disabled → depth 0, dashed border, `opacity.disabled`, no press physics, no haptic. The ring is an absolutely positioned, non-interactive View inset by `-(focusRing.offset + focusRing.width)` with `borderWidth: focusRing.width`, `borderColor: colors.ring`, hidden from assistive tech.
- `usePressPhysics({ depth, disabled, haptics })`: drop `squash` and the shadow drift/fade; surface translates `pressed * depth` on both axes; returns `{ pressed, animatedSurfaceStyle, handlePressIn, handlePressOut }` (`animatedShadowStyle` removed — the shadow is static).
- Mechanical migration: `offset={2}`→`elevation="control"`, `{4}`→`"card"`, `{6}` / `{8}`→`"overlay"`, `offset={0}` or `hasShadow={false}`→`elevation="flat"` (remove `hasShadow`).

- [ ] **Step 1: Failing tests:** neo default renders the shadow layer offset 4 (find by `testID="brutal-surface-shadow"`, read its style `top`); raw → 2; `elevation="flat"` → no shadow node; `disabled` → no shadow node, surface `borderStyle: 'dashed'`, `onPress` not called on `fireEvent.press`, `Haptics.impactAsync` not called on `pressIn`; `invalid` → surface `borderColor === presets.neo.light.destructive`; `focused` → node `testID="brutal-surface-ring"` present, `borderWidth: 2`, `borderColor === ring`; `fireEvent(surface, 'focus')` shows the ring and `'blur'` hides it; pressable press calls `Haptics.impactAsync` once.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implement**, then the mechanical migration across components (no other changes to those components).
- [ ] **Step 4: Verify:** demo `npm test`, `npm run typecheck`, `npx expo export --platform web` (scratch dir); root `node registry/build.mjs`.
- [ ] **Step 5: Commit** `feat(ui): BrutalSurface on the depth ladder with ring, disabled and invalid states`.

### Task 4 (B0-4): `Text` primitive and loading blocks

**Files:**
- Create: `packages/ui/components/text.tsx`, `packages/ui/lib/loading-blocks.tsx`
- Modify: `packages/ui/components/index.ts`, `packages/ui/lib/colors.ts` (add `textStyles`, `fontFamilies`), `registry/meta.json`
- Test: `demo/__tests__/text.test.tsx`, `demo/__tests__/loading-blocks.test.tsx`

**Interfaces:**
- `colors.ts`: `export const fontFamilies = { mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace' }) }`; `export const textStyles: Record<TextVariant, TextStyle>` with the five roles from Global Constraints (`label` gets `textTransform: 'uppercase'`, `letterSpacing: 1`, mono family; `mono` gets `fontVariant: ['tabular-nums']`, mono family; `display` `letterSpacing: -0.5`). `type TextVariant = 'display' | 'title' | 'body' | 'label' | 'mono'`.
- `text.tsx`: `export function Text({ variant = 'body', tone = 'default', numberOfLines, style, ...props }: TextProps)` where `TextProps extends RNTextProps` + `variant?: TextVariant; tone?: 'default' | 'muted' | 'inherit'`. `tone='default'` → `colors.foreground`, `muted` → `mutedForeground`, `inherit` sets no colour (for text inside filled controls whose parent supplies the pair). Always `maxFontSizeMultiplier={1.3}`. `display`/`title` default `accessibilityRole="header"`. Also `export default Text`.
- `loading-blocks.tsx`: `export function LoadingBlocks({ color, size = 6 }: { color: string; size?: number })` — three squares stepping (one filled at a time, 3 steps × 160ms, loop via Reanimated `withRepeat`) — the only looping animation outside Skeleton/Marquee — stops (all three static, middle filled) under reduced motion; `accessibilityRole="progressbar"`, `accessibilityLabel="Loading"`.

- [ ] **Step 1: Failing tests:** each variant renders with its exact `fontSize`/`lineHeight`/`fontWeight` (flatten style); `label` uppercase + mono family; `maxFontSizeMultiplier === 1.3`; `tone="muted"` colour = `mutedForeground` in neo dark; `title` has role `header`. LoadingBlocks: renders 3 block nodes, role `progressbar`, label `Loading`; with reduced motion mocked → no `withRepeat` call (spy) .
- [ ] **Step 2:** run → FAIL. **Step 3:** implement. **Step 4:** demo `npm test`, `npm run typecheck`, root `node registry/build.mjs`.
- [ ] **Step 5: Commit** `feat(ui): Text primitive with the type scale, loading blocks`.

### Task 5 (B0-5): Icons on the §5 grid

**Files:** Modify `packages/ui/lib/icons.tsx`; Test `demo/__tests__/icons.test.tsx`

- [ ] **Step 1: Failing test:** every exported icon renders an `Svg` with `strokeWidth` 2, `strokeLinecap` `square`, `strokeLinejoin` `miter`, `viewBox` `0 0 24 24`, `fill` `none`, and is hidden from accessibility.
- [ ] **Step 2–4:** change the default `strokeWidth` to 2 (DESIGN §5: stroke matches the control border); keep the glyph geometry unless a path visibly breaks at 2px. demo `npm test` + `npm run typecheck`.
- [ ] **Step 5: Commit** `feat(ui): icons on the 2px DESIGN grid`.

### Task 6 (B0-6): Specimen board

**Files:**
- Create: `demo/src/screens/specimen/SpecimenScreen.tsx` (+ small section files in the same folder if it passes ~300 lines), route `specimen` in `demo/App.tsx` and a Home entry
- Create: `demo/e2e/specimen.yaml` (Maestro: open via Home, screenshot `specimen-top`, scroll, `specimen-states`, scroll, `specimen-icons`)
- Test: `demo/__tests__/specimen.test.tsx`

**Interfaces:** Consumes everything from B0-1..5 via `@apexrn/ui` only. Four quadrants as nested providers: neo light, neo dark, raw light, raw dark, laid out as a 2×2 grid on wide screens and stacked on phones. Each quadrant shows: every role pair as a swatch with its name in `label` and the contrast ratio in `mono`; the five `Text` variants; border 2/3 and the elevation ladder (flat/control/card/overlay surfaces); Button, Input, Checkbox in idle, pressed (`focused`/static sink is fine for pressed: render a BrutalSurface with elevation flat + translated, labelled "pressed"), focused, disabled, error, loading; the icon set.

- [ ] **Step 1: Failing test:** renders four quadrants (`testID` `quadrant-neo-light` … `quadrant-raw-dark`), each with 23 role swatches and 5 type specimens; no `console.error`.
- [ ] **Step 2–4:** implement; demo `npm test`, `npm run typecheck`, web export; web screenshots of all four quadrants via the headless-Chrome recipe (see memory `web-verification-recipe`) saved to `docs/ship-plan/specimen/`.
- [ ] **Step 5: Commit** `feat(demo): B0 specimen board`.

### Task 7 (B0-7): Tune and lock (orchestrator)

- [ ] The orchestrator reviews the web screenshots and the emulator screenshots (CI artifact) side by side, edits start values in `lib/colors.ts` through a fix dispatch, re-runs `tokens:check`, and records the final values in `rework/DESIGN.md` §1 with `Ruling: values locked` in the ledger. Commit `docs(design): lock B0 token values`.
