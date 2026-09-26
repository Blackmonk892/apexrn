# ApexRN — Full Codebase Audit

Scope: `packages/ui/**` (29 components + `lib/colors.ts`, `lib/metrics.ts`, `lib/utils.ts`). Read every file in full. This doc is the reference list of everything that has to be fixed before this can be a real, publishable, brutalist React Native component library. Nothing here has been fixed yet — this is the diagnosis only.

---

## 0. Verdict up front

Two separate problems, and they need to be solved separately:

1. **This is neo-brutalism, not brutalism.** Bright red/blue/yellow, hard drop shadows, thick black borders, uppercase bold type — that's the "Gumroad / Figma neo-brutalist" aesthetic that's been a design trend since ~2021. Real Brutalism (the architecture-derived web/UI movement — see brutalistwebsites.com, the "brutalist web design" manifesto) is almost the opposite of that in spirit: raw, unstyled-looking, monochrome or near-monochrome, structural, dense, typography-led, deliberately "undesigned," minimal color, no cute shadows-as-decoration. What's in `packages/ui` right now is a skin, not brutalism. This needs a real decision (Section 1) before touching more code.
2. **The code has real, will-crash-or-misbehave bugs**, not just style problems — a missing import that will throw at runtime, a prop mismatch that silently breaks two components, a hook called inside a loop, a ref pointing at the wrong element, a component that renders its children twice. These are listed in Section 2, file by file, with line-level detail.

There's also no packaging at all — `packages/ui` has no `package.json`, no `index.ts` barrel, no `tsconfig.json`, no build step. It cannot be `npm install`ed or `npx shadcn`-style copy-pasted today. That's Section 3.

---

## 1. "Neo-brutalism" vs. real Brutalism — the design decision

Current tokens (`packages/ui/lib/colors.ts`):
- Primary `#FF5252` (bright red), secondary `#3D5AFE` (bright blue/indigo), accent `#FFD600` (bright yellow)
- 2–4px black borders everywhere, `borderRadius: 0`
- Hard offset "sticker" shadows (solid color block behind every surface, no blur) at 2/4/6/8px depending on component
- Bold uppercase, heavy letter-spacing on almost every label/title/button

This is the recognizable neo-brutalist / "Gumroad-core" UI style. It is NOT what people mean when they say "real Brutalism" in a design-history sense. Real Brutalism, translated to UI:

- **Monochrome-first.** Black, white, one or two grays. Color used only as a rare functional signal (an error state), never decoratively on primary/secondary/accent buttons.
- **No decorative shadows.** Brutalist structure is expressed with real borders, rules, and grid lines — not a drop-shadow standing in for depth. If you keep the offset-shadow motif, it should read as "printed registration marks / misaligned print," not glossy candy-shadow.
- **Typography does the work.** Heavy, condensed, mono or grotesk faces; visible type scale jumps; text-as-structure (rules, all-caps labels, numbered systems) instead of color-coded chips.
- **Raw material honesty.** Visible borders/dividers instead of soft cards; flat fills, not layered "elevation." Components look closer to a printed spec sheet or a terminal UI than a candy app.
- **Restraint on radius, restraint on flourish.** Zero border-radius is correct and should stay — that part is genuinely brutalist. The color and shadow choices are what's wrong.

Decision needed from you (the user), because it changes every token file and every component:
- **Option A — go full "raw brutalism":** strip primary/secondary/accent down to functional grays + one ink color, drop the candy palette, keep hard borders, either drop the offset shadow entirely or reduce it to a thin misregistration line (1–2px, monochrome, not colored).
- **Option B — keep the current neo-brutalist look but market it honestly as neo-brutalism**, and put the effort into fixing the bugs/architecture instead of relitigating the palette.
- **Option C — support both via theme tokens** (a "classic brutalist" theme and a "neo" theme), so consumers pick. This is the most work but the most defensible "real, useful" answer, and it plugs directly into the theming work you already need to do (Section 2.14).

Recommendation: **A or C.** If the goal is "the actual brutalism library nobody has made yet," the palette and the shadow-as-decoration pattern are the two things standing between "looks like every other neo-brutalist Dribbble shot" and "actually distinct." This is a judgment call for you to make, not something to silently decide in code.

---

## 2. Real bugs — file by file

These are correctness bugs, not style opinions. Several will crash or visibly break at runtime today.

### 2.1 `components/floating_action_button.tsx` — will crash
`Text` is used (`<Text style={styles.text}>{label}</Text>`) but never imported. The import line only pulls `Pressable, StyleSheet, View, ViewProps, PressableProps` from `react-native`. Rendering `<FAB label="..." />` throws `ReferenceError: Text is not defined`.

### 2.2 `components/alertdialog.tsx` and `components/datepicker.tsx` — wrong prop name, silently broken
Both files render `<Button label="..." onPress={...} />` (e.g. `alertdialog.tsx:134-146`, `datepicker.tsx:186-218`). But `Button`'s actual prop (`components/button.tsx:29`) is `title`, not `label`. `label` isn't in `ButtonProps` at all — TypeScript should catch this if strict, but if it doesn't (or if `any` leaks in), every button rendered through AlertDialog and DatePicker renders with **no visible text**, because `title` (Button's required prop) is `undefined`.

Compounding bug in `alertdialog.tsx:142`: `<Button variant="destructive" .../>` — `Button`'s `Variant` type is only `'default' | 'primary' | 'outline'` (`button.tsx:25`). There is no destructive variant on Button at all, so the "destructive" alert action button cannot actually render in red/destructive styling — the whole point of an AlertDialog's action button.

### 2.3 `components/alert.tsx` — references color tokens that don't exist
`VARIANT_COLORS` (`alert.tsx:42-47`) reads `colors.light.warning` and `colors.light.success`. Neither key exists in `colors.light` (`lib/colors.ts:4-37` only defines background/foreground/primary/secondary/accent/muted/destructive/border/shadow — no warning, no success). Because `colors` is declared `as const`, this is a TypeScript compile error, not just a silent `undefined` — this file will not type-check as-is. The `|| '#F59E0B'` / `|| '#10B981'` fallback pattern used here (and echoed in `badge.tsx`, `toast.tsx`) suggests the author knew the tokens might be missing and papered over it instead of adding them to the actual theme.

### 2.4 `components/input_otp.tsx` — real logic bug + hook-rule violation
- Line 121: `focusProgress[i]?.value.value === 1` — double `.value`. `focusProgress[i].value` is already the unwrapped number (a shared value's `.value` is the number itself); calling `.value` again on a number is either `undefined` (silently always false) or a crash depending on Reanimated's proxy behavior. The intended check was almost certainly `focusProgress[i]?.value === 1`. As written, the "snap to heavy border on the active block" feature never actually triggers correctly.
- Lines 71, 112, 119: `useSharedValue` and `useAnimatedStyle` are called **inside `Array.from({length}, () => ...)` and inside the `renderBlocks()` loop**, i.e. conditionally/dynamically based on the `length` prop and loop iteration, not unconditionally at the top of the component. This violates the Rules of Hooks. It will "work" as long as `length` never changes across the component's lifetime, but if a consumer ever renders `<InputOTP length={4} />` then flips to `length={6}` (e.g. switching OTP delivery method), React will throw "Rendered more hooks than during the previous render." This needs to be restructured into a fixed-size sub-component (`<OTPBlock index={i} />`) that owns its own hooks, mapped over, not hooks-in-a-loop in the parent.

### 2.5 `components/dropdown_menu.tsx` — positioning is fundamentally broken
`DropdownMenuTrigger` creates its own local `triggerRef` (line 89) and attaches it to the rendered trigger element — but that ref is never exposed through context or otherwise passed to `DropdownMenuContent`. Meanwhile `DropdownMenuContent` declares an *unrelated* `triggerRef` (line 119) and attaches it to its own `Animated.View` — the menu **content** wrapper (line 184: `<Animated.View ref={triggerRef} ...>` is the menu surface, not the trigger button). Then `handleLayout` (`onShow`) measures `triggerRef.current`, which now points at the menu content itself, not the trigger. The dropdown's screen-position math (`topPosition`/`leftPosition`, lines 157-165) is therefore built from measuring the wrong element — the menu will not actually anchor to its trigger in any reliable way. This needs a shared ref (via context, or measuring the trigger in `DropdownMenuTrigger` and passing coordinates through context) to work at all.

### 2.6 `components/select.tsx` — renders children twice
```tsx
export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, setOpen }}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        {({ handleDismiss }) => children}
      </Sheet>
    </SelectContext.Provider>
  );
}
```
`children` (presumably `<SelectTrigger/>` + `<SelectContent/>`) is rendered once directly, and again inside the `Sheet`'s render-prop, ignoring `handleDismiss` entirely. In practice this means `SelectTrigger` mounts twice (two duplicate Pressable/Input trees on screen) and `SelectContent` — which is meant to live *inside* the Sheet modal — also gets mounted directly in the page's normal layout tree (outside any modal), since it's part of the same `children` rendered unconditionally at the top. This is a composition bug, not a style nit: it will visibly duplicate UI and likely double-fire `onValueChange`/analytics if wired to real handlers.

### 2.7 `components/carousel.tsx` — `accessibilityRole="adjustments"` is not a valid RN accessibility role (should be `"adjustable"`, matching the pattern used correctly in `slider.tsx` and `datepicker.tsx`). Minor but will warn/be ignored by screen readers.

### 2.8 Hardcoded `colors.light.*` in every single component, despite a full `colors.dark` theme existing
`lib/colors.ts` defines a complete `dark` palette (lines 21-36) that is **never referenced anywhere** in any of the 29 components — every one imports `colors` and then always reads `colors.light.X`. There is no `ThemeProvider`, no context, no `useColorScheme` hook, nothing that switches a component's rendered colors based on system or app theme. The demo app has its own `ThemeContext.tsx` (`demo/src/context/ThemeContext.tsx`) with `toggleTheme`/`isDark`, but it's disconnected from the library — toggling it in the demo does nothing to any ApexRN component, because the components never read from it. This is the single biggest "not production grade" architectural gap: a real component library must let color mode be switched (system-driven or app-driven) without every consumer having to hand-override every component's `style` prop.

### 2.9 Massive duplication of the shadow/border "brutalist surface" pattern
The same ~15-line block (`position: relative` root + absolutely-positioned solid-color "shadow" backing view with `borderWidth`/`borderColor`/`zIndex: 1` + a `zIndex: 2` foreground surface) is hand-copied into **every single component**: button, card, Input, badge, avatar, alert, checkbox, dialog, dropdown_menu, sheet, progress, slider, switch, tabs, toast, floating_action_button, input_otp — with the offset constant (2/4/6/8) and border width (`standard`/`heavy`/`extraHeavy`) re-picked ad hoc per file, sometimes as a local `SHADOW_OFFSET` constant, sometimes hardcoded. There is no shared `<HardShadowSurface offset={4} borderWidth="heavy">` primitive. This is exactly the "components within components, confused about composition" problem you flagged: right now composition happens by copy-pasting the same style object into 17 files, not by building one real primitive and composing it. Any future change to "how the brutalist shadow looks" requires editing 17 files by hand and will drift (it already has — see 2.8/2.10 for the SHADOW_OFFSET-defined-but-unused files).

### 2.10 Dead code / vestigial "template compliance" comments
`accordion.tsx:92`, `alert.tsx` (unused `Animated` import), `alertdialog.tsx:70`, `avatar.tsx`, `badge.tsx`, `label.tsx:27`, `listitem.tsx:50`, `marquee.tsx:44`, `progress.tsx` (shadow only conditionally used), `radiogroup.tsx:59`, `select.tsx:71`, `separator.tsx:25`, `skeleton.tsx:32`, `tabs.tsx` (`AnimatedPressable` declared, never used) all contain a `SHADOW_OFFSET` constant and/or an unused `Animated`/`useAnimatedStyle`/`useSharedValue`/`AnimatedPressable` import that is explicitly commented as "Maintained for strict template compliance, though unused." This reads like output from an automated generation pass (the user mentioned building this with Antigravity) that mechanically stamped the same imports into every file regardless of whether the file needs them. For a real library this is dead weight: unused imports bloat bundle analysis, confuse contributors ("why does Label import Reanimated?"), and are exactly the kind of thing a linter (`no-unused-vars`) would flag on day one of a real CI setup — which this project doesn't have either (see Section 3).

### 2.11 Inconsistent style-merging API
Some components use the custom `cn()` util (`lib/utils.ts`, which does `Object.assign({}, ...styles.filter(Boolean))` — a *single merged object*, not an array), others pass raw arrays `[styles.a, cond && styles.b, style]` directly to the `style` prop (React Native supports both, but mixing the two idioms across a "shadcn-style" library is inconsistent DX — a consumer reading two files for API patterns will see two different conventions for the same problem). Worth standardizing on one (likely just arrays — RN's native style prop already merges arrays; `cn()` doesn't add much value over that and its `Object.assign` semantics are actually a worse merge strategy for RN than array-based `StyleSheet` merging, since it can't merge nested transform arrays or `StyleSheet.create`'s numeric IDs the same way).

### 2.12 `lib/metrics.ts` — screen-dimension scaling captured once at module load
`SCREEN_WIDTH`/`SCREEN_HEIGHT` (`metrics.ts:3`) are read once via `Dimensions.get('window')` at import time and never updated. Every `spacing`/`typography` token in `lib/colors.ts` is computed once from that snapshot. On a device rotation, a foldable, or a split-screen/multi-window resize (all real states on Android and iPadOS), every spacing/typography value in the entire library is frozen to whatever the screen size was when the JS bundle first loaded — components will not re-scale. A production library needs to react to `Dimensions.addEventListener('change', ...)` (or use hooks like `useWindowDimensions()` per-component) rather than baking scaled constants into module-level singletons.

### 2.13 No `warning`/`success` semantic colors, but three separate components assume them
`alert.tsx`, and the general variant pattern (`badge`, `toast` use destructive; alert additionally wants warning/success) shows the intended semantic palette needs `warning`/`success`/`info` added to `colors.light`/`colors.dark` for real, not just band-aided with inline hex fallbacks scattered per-file (`alert.tsx:44-46`, `toast.tsx:64-65`). Every place a fallback hex like `#F59E0B` appears is a sign the token model itself is incomplete.

### 2.14 No theming/context layer at all (ties together 2.8)
There's no `<ApexRNProvider theme="light|dark|system">`, no `useTheme()` hook exported from the package, no way for a consuming app to say "use dark mode" without forking every component. For an npm-publishable, shadcn-like library this is not optional — it's the #1 thing consumers will ask for in the first week.

---

## 3. Packaging / "can a dev actually install this" gaps

- `packages/ui` has **no `package.json`** — it isn't a package. There's nothing to `npm install`, no name, no version, no `main`/`exports` field, no listed peer dependencies (react, react-native, react-native-reanimated, react-native-svg, react-native-gesture-handler are all required by components but not declared anywhere).
- **No `index.ts` barrel export.** A consumer has no single import surface (`import { Button, Card } from 'apexrn-ui'`) — every component would have to be reached by deep relative path.
- **No `tsconfig.json`** scoped to the package (build target, JSX mode, module resolution for a library vs. an app).
- **No build step** (tsup/rollup/babel) to emit `.js`/`.d.ts` output — right now it's raw `.tsx` source with zero compilation story.
- **No shadcn-style CLI/registry.** The user explicitly wants "download it like shadcn" — that means either (a) a real npm package consumers `npm install`, or (b) a CLI/registry (`npx apexrn add button`) that copies source into the consumer's repo à la shadcn. These are two different distribution models and the project currently supports **neither**. This is a decision to make, same as Section 1 — worth asking which one you actually want, since it changes whether `packages/ui` needs to be an installable package (model a) or a registry of copyable templates with a manifest (model b).
- **No tests.** Zero test files anywhere in `packages/ui`. Given how many of the bugs above (2.2, 2.4, 2.5, 2.6) are the kind that a basic render test or interaction test (React Native Testing Library) would have caught immediately, this is the highest-leverage gap to close early — even a handful of "renders without throwing" smoke tests per component would have caught the FAB crash and the Button `label`/`title` mismatch.
- **`components/test.tsx`** is a leftover scratch/smoke-test file (`TestComponent`, "Registry Architecture Works!") that isn't part of the real API surface and shouldn't ship — needs to be deleted or moved out of `components/`.
- **Inconsistent naming convention**: `Input.tsx` is capitalized, every other file is lowercase (`button.tsx`, `card.tsx`, `dropdown_menu.tsx` uses snake_case, `floating_action_button.tsx` uses snake_case, `listitem.tsx`/`radiogroup.tsx`/`alertdialog.tsx`/`input_otp.tsx` mash words together with no separator or inconsistent separators). Pick one filename convention (kebab-case is the shadcn/most-common RN-lib convention: `dropdown-menu.tsx`, `floating-action-button.tsx`, `list-item.tsx`, `radio-group.tsx`, `alert-dialog.tsx`, `input-otp.tsx`) and rename everything to match before publishing — inconsistent file naming is one of the fastest ways a component library reads as "not actually maintained by a team."

---

## 4. Suggested fix order

1. **Decide Section 1** (real-brutalism token overhaul vs. keep neo-brutalist look vs. dual theme) — everything downstream depends on this.
2. **Fix the crash-level and logic-level bugs in Section 2** (2.1, 2.2, 2.3, 2.4, 2.5, 2.6) — these are correctness, not taste.
3. **Build the shared primitives** (2.9): one `HardShadowSurface`/`useBrutalistSurface` primitive, one theme/context layer (2.8/2.14), one semantic color set including warning/success (2.13). Rewrite the 17 duplicated components to consume the primitive instead of hand-copying styles.
4. **Standardize style-merging API** (2.11) and fix `metrics.ts`'s static-dimensions problem (2.12).
5. **Clean up dead code** (2.10), delete `test.tsx`, fix `carousel.tsx`'s bad accessibility role (2.7).
6. **Package it** (Section 3): decide npm-package vs. shadcn-style-registry distribution, add `package.json`/`index.ts`/`tsconfig.json`/build tooling, rename files to a consistent convention, add smoke tests per component.

Nothing in this document has been changed yet — this is the read-and-diagnose pass only, per your request.
