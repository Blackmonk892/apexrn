# ApexRN — Modification Plan: Rewrite the Lib, One Component + Demo Page at a Time

> **Status:** plan of record. Supersedes the "what's next" parts of `design/REFACTOR.md`.
> **Approach (agreed):** rewrite the UI lib component by component. Each component is paired with its own demo page in `demo/`. We test it there, fix it, lock it, then move to the next — repeating until the whole library is error-free.
> **Ground rule (agreed):** `packages/ui` is **source code only**. No `node_modules`, no lockfile, no installs. Every dependency lives in `demo/`.

Evidence labels used below: **[verified]** = I ran it / read it in this repo · **[inferred]** = follows from config or code, not yet reproduced at runtime.

---

## 0. TL;DR

1. The rendering problems are **not primarily in individual components**. The biggest cause is environmental: `packages/ui` had its own full `node_modules` (a second copy of `react`, `react-native`, `react-native-reanimated`, `react-native-svg`, `react-native-gesture-handler`), so the lib and the demo were running on **two different React/Reanimated/RN instances**. That alone produces "Invalid hook call", "Tried to register two views with the same name", broken Reanimated shared values, and themes that silently don't propagate.
2. **I deleted `packages/ui/node_modules`** (331 packages). Source untouched (38 component files, git status unchanged). **But it will come back** the next time `npm install` runs in `demo/`, because of `"@apexrn/ui": "file:../packages/ui"` (see §2.1). Phase 0 fixes that permanently — do it before anything else.
3. Deleting it exposed a second problem: `tsc` now fails (206 errors) because TypeScript can't resolve `react-native` types from files in `packages/ui`. Metro still bundles fine. A `paths` mapping fixes it (**validated: 0 errors**) — see §2.2.
4. There are several other config/architecture problems (§2.3–2.8) and a short list of real component-level risks (§2.9), most notably `Sheet` using gestures inside a `Modal` with no `GestureHandlerRootView` (breaks Select and DatePicker on Android).
5. The demo is built in a way that hides failures: 33 screens eagerly imported into one app, deep-importing files instead of the public barrel, hardcoded colors, no error boundaries. Section 4 redesigns it as a per-component **Component Lab**.
6. The loop (§5): Phase 0 foundation → Wave 1 primitives → Wave 2–5 components in dependency order. Every component must pass the same Definition of Done before the next starts.

> **I could not see the actual runtime errors you are hitting** (no stack traces were provided and I did not run a device). Everything under §2 is from reading the config and code plus the tsc/bundle runs I did. **Paste the first red-screen/console error you see and I'll map it to a cause in §2 — or add it to the table in Appendix A.**

---

## 1. What I did in this pass

| Action | Result |
|---|---|
| Read `apexrn-docs.md`, `design/AUDIT.md`, `design/REFACTOR.md` | Docs describe a finished, validated lib; real-world behavior disagrees (see §2.7 for where the docs overclaim). |
| Removed `packages/ui/node_modules` | Done **[verified]**. The folder contained a self-referencing symlink (`node_modules/@apexrn/ui → packages/ui`); I unlinked that first so the delete could not recurse into source. `packages/ui` now contains only `components/`, `lib/`, `index.ts`, `package.json`, `tsconfig.json`. |
| `tsc --noEmit` in `demo/` after cleanup | **206 errors** — all TS module-resolution fallout (see §2.2) **[verified]**. |
| `npx expo export --platform web` after cleanup | Bundles clean, 861 modules **[verified]** — Metro resolves deps through `nodeModulesPaths`, TS does not. |
| Tested a `paths` fix in a throwaway tsconfig (deleted afterwards) | **0 errors [verified]**. Not yet applied to the repo — it is a Phase 0 task. |
| `npx expo-doctor` / `npx expo install --check` | 3 failed checks (see §2.6) **[verified]**. |
| Read the composite/animated components in full | `dialog`, `sheet`, `dropdown_menu`, `select`, `datepicker`, `slider`, `input_otp`, `tabs`, `accordion`, `toast`, `input`, `skeleton`, `marquee`, plus `button`/`carousel` (top half), `brutal_surface`, `theme`, `usePressPhysics`, `colors`, `metrics`, `utils`. Simple components (badge, avatar, alert, progress, separator, label, textarea, checkbox, switch, radiogroup, listitem, fab, card, alertdialog) were **not** re-read line by line — they are covered by the rewrite loop. |

---

## 2. Research: why the components render badly

### 2.1 Duplicate dependency trees — the root cause **[verified: existed · inferred: exact runtime symptoms]**

**What existed:** `packages/ui/node_modules` with 331 entries, including `react` 19.2.3, `react-native` 0.86.3, `react-native-reanimated` 4.5.1, `react-native-svg`, `react-native-gesture-handler`, `babel-preset-expo`, a `.package-lock.json`, and a self-symlink. Identical versions to `demo/node_modules`, but physically separate copies.

**Why that breaks rendering:** Metro resolves an import by walking *up* from the importing file. A file at `packages/ui/components/button.tsx` importing `react-native` finds `packages/ui/node_modules/react-native` first. A file in `demo/src/...` finds `demo/node_modules/react-native`. Result: the demo renders with copy A, the library components with copy B.

| Symptom you may have seen | Why |
|---|---|
| `Invalid hook call` / `Cannot read properties of null (reading 'useContext')` | Two Reacts: hooks in lib components use a different dispatcher than the renderer. |
| `Invariant Violation: Tried to register two views with the same name RNSVGSvgView` (or `RNGestureHandlerRootView`) | Two copies of a native-component package both register with the same native view manager. |
| Reanimated: shared values not updating, "non-worklet function called on UI thread", `_WORKLET` mismatch | Two Reanimated JS runtimes talking to one native module. |
| Dark mode "does nothing" for some components | Two copies of any module that holds a `createContext` → provider and consumers don't match, `useTheme()` returns the light fallback silently. |
| Works on web, crashes on device (or vice versa) | Duplicate native modules only matter where there are native modules. |

**How it got there (mechanism):** `demo/package.json` has `"@apexrn/ui": "file:../packages/ui"`. npm ≥ 7 treats that as a linked package and installs the linked package's `peerDependencies` **inside the link target**. Evidence: `demo/node_modules/@apexrn/ui` (the link) and `packages/ui/node_modules/.package-lock.json` have the same creation minute (Sep 28 19:46), and the target folder contained the npm-artifact self-link. **So deleting the folder is not a fix — the next `npm install` in `demo/` recreates it.**

**Permanent fix (Phase 0, task 0.1):** stop using `file:` for the workspace lib. Resolve the lib through Metro + TS path aliases only (details in §6). Add a Metro `blockList` for `packages/ui/node_modules` and a `doctor` script that fails loudly if the folder ever reappears or if two copies of `react` resolve.

### 2.2 Metro and TypeScript resolve differently **[verified]**

With no `packages/ui/node_modules`, TS walks up from `packages/ui/components/*.tsx` and never reaches `demo/node_modules`, so `react`/`react-native` become unresolved (`any`). Consequences: `Property 'children' does not exist on type AccordionProps`, `Property 'style' does not exist on SkeletonProps` (props that extend `ViewProps` lose their base). Metro doesn't have this problem because `metro.config.js` sets `nodeModulesPaths` to include `demo/node_modules`.

Validated fix (temp config, then deleted): in `demo/tsconfig.json`

```json
"paths": {
  "@ui/*": ["../packages/ui/*"],
  "*": ["./node_modules/@types/*", "./node_modules/*"]
}
```

Order matters: `@types/*` **must come first** — with `node_modules/*` first, `react` resolves to the JS package (no `.d.ts`) and you get 182 `TS7016` errors instead **[verified]**.

Also: `packages/ui`'s own `"typecheck": "tsc --noEmit"` script no longer works standalone (no deps there, by design). Typechecking the lib is done **from `demo/`** (task 0.3).

### 2.3 Three overlapping alias systems, and the public API is never tested **[verified]**

- `babel.config.js`: module-resolver alias `@ui → ../packages/ui`
- `metro.config.js`: `extraNodeModules['@ui']`
- `tsconfig.json`: `paths['@ui/*']`
- plus the `file:` link exposing `@apexrn/ui`

All 33 demo screens import via deep paths (`@ui/components/button`, `@ui/lib/theme`, …). **Nothing in the demo imports `@apexrn/ui`**, so the barrel (`index.ts`) — the thing consumers actually use — is never exercised. Barrel mistakes (wrong file, wrong export, alias drift) are invisible. Also, `@ui/components/datepicker` vs `date-picker` are two module IDs for the same file; mixing them is a duplicate-module footgun.

**Fix:** one alias, one entry point. The demo imports **only** from `@apexrn/ui` (the barrel). Configure that one name in Metro + TS; delete the babel alias and the `file:` dependency.

### 2.4 Worklets Babel plugin registered twice **[verified: preset auto-adds · inferred: impact]**

`babel-preset-expo` auto-adds `react-native-worklets/plugin` when the package is installed (`configs/expo.js:96-100`). `demo/babel.config.js` also lists `"react-native-worklets/plugin"` manually. Result: the worklet transform can run twice over every file containing worklets (all animated components). Symptoms, when it bites, are odd Reanimated errors that vary by file. Remove the manual entry.

### 2.5 `Sheet` uses gestures inside a `Modal` with no `GestureHandlerRootView` **[inferred — high confidence]**

`sheet.tsx` renders `<GestureDetector>` (pan-to-dismiss) *inside* a React Native `<Modal>`. On Android a `Modal` is a separate native window, so the app-level `GestureHandlerRootView` in `App.tsx` does not cover it. RNGH requires a root view inside each Modal. Effect: sheet drag doesn't work and/or RNGH throws that the detector is not under a root view. **`Select` and `DatePicker` are built on `Sheet`, so they inherit the bug.** Fix in the Sheet rewrite: wrap the Modal content in `GestureHandlerRootView` (library-owned, so consumers don't need to know).

Related: `Slider` also needs an ancestor `GestureHandlerRootView`. That is a consumer requirement and must be documented + surfaced with a friendly dev warning, not a cryptic crash.

### 2.6 Expo/app config drift **[verified via expo-doctor]**

| Finding | Fix |
|---|---|
| `app.json` has properties invalid for SDK 57: `newArchEnabled`, `splash`, `android.edgeToEdgeEnabled` | Remove; migrate splash to the `expo-splash-screen` plugin if wanted. |
| `expo-modules-core` is installed directly (also listed as a lib peer) | Remove from `demo/package.json` **and** from the lib's `peerDependencies` (use APIs re-exported by `expo`). |
| `react-native-svg` 15.15.5 vs SDK-expected 15.15.4 | `npx expo install react-native-svg` |
| `app.json` → `"userInterfaceStyle": "light"` | On native this pins the OS scheme to light, so `ApexRNProvider defaultMode="system"` **never sees dark**. Set to `"automatic"` (or drive mode yourself). |
| `demo/AGENTS.md` says "read v54 docs" but the project is SDK 57 | Update, or agents/humans follow stale APIs. |

### 2.7 The docs overclaim in places **[verified]**

- `apexrn-docs.md` §7 says `spacing`/`typography` are "live getters" that are rotation-safe. True *at the getter*, but **24 of the component files read them inside a module-level `StyleSheet.create(...)`** (and `Button` in a module-level `SIZES` map), which runs **once at import**. So the values are still frozen for most of the library. The "live" claim is only true for inline usage.
- §13/§17 present the demo as "the integration testbed exercising every feature". It exercises deep imports, not the package surface (§2.3), and has no error isolation (§2.8).
- The "Validation" section is `tsc` + `expo export` only. Neither catches a runtime render error. There are no tests.

Decision for the rewrite: tokens that must react to window size are read **at render time** (via a `useTokens()`/`useTheme()` hook or `useWindowDimensions`), not in module-level `StyleSheet.create`. Static tokens (border widths, offsets) can stay static.

### 2.8 The demo hides failures **[verified]**

- `App.tsx` statically imports all 33 screens. Any import-time error in one component's module crashes the whole app before Home renders — you can't tell *which* component is broken.
- No `ErrorBoundary` anywhere: a render error in one specimen red-screens everything.
- `Layout.tsx` and screens hardcode `#FFF/#000/#1A1A1A`, duplicating theme tokens instead of consuming them — the demo can look "themed" while the library isn't.
- Screens are ad hoc: no fixed structure (variants/sizes/states/edge cases), so gaps aren't visible.
- 7 "batch" screens duplicate the per-component screens.
- Router is a `useState` string switch — fine, but no per-screen lazy loading.

### 2.9 Component-level risks found by reading the code **[inferred — confirm at runtime in each component's loop]**

| Component | Risk | Confidence |
|---|---|---|
| `Sheet` (→ `Select`, `DatePicker`) | Gesture inside Modal without root view (§2.5). | High |
| `Select` / `DatePicker` | Slot detection by `child.type === X \|\| displayName \|\| name`. Wrapped/HOC'd content silently becomes a "trigger child" and renders inline, outside the sheet. Fragile API. | Medium |
| `Select` / `DatePicker` trigger | `pointerEvents="none"` passed as a *prop* on `Input`/`TextInput` — deprecated in RN; also `Input` then applies its own wrapper. | Medium |
| `InputOTP`, `Input` | `borderWidth` is animated on the UI thread (layout prop). Works on Reanimated 4 but forces a layout commit per frame; opacity/transform-only animation is safer and cheaper. | Medium |
| `Accordion` | Initially-open items measure at height 0 then *animate open on mount* (flash). Trigger `style` typed as Pressable style but spread into an array (function styles break). | Medium |
| `Toast` | Dismiss notifies parent via a 260ms timer *after* starting the slide-out, not on animation completion; rapid `visible` flips can double-fire `onDismiss`. | Medium |
| `Dialog` | `useEffect` deps intentionally `[open]` (lint-suppressed): stale closure risk if `isVisible` logic changes. `Modal` + `zIndex/elevation` on positioner is unnecessary. | Low |
| `Slider` | Requires `GestureHandlerRootView` ancestor (§2.5). `onValueChange` only fires on gesture *end* — no live value while dragging (a surprising contract for a "controlled" slider). | Medium |
| `Carousel` | `accessibilityRole="adjustable"` on a container that exposes no increment/decrement actions. | Low |
| `Marquee` | `text.length` in effect deps + repeated Text nodes; fine, but measure/loop logic should be verified with font scaling. | Low |
| All animated components | Reanimated 4 + New Architecture: any `style` function/array mistakes surface as native-only errors, not on web. **Web passing ≠ device passing.** | High |
| 8 kebab-case alias files | Pure duplicates of the snake_case modules (`alert-dialog.tsx` → `alertdialog.tsx`, …). Two spellings = two module IDs. | High |

---

## 3. What a brutalist component should be (the spec)

This is the contract every rewritten component must follow. It is deliberately narrow — brutalism is constraint.

> **Open design decision (needs your call, defaulted below).** `AUDIT.md §1` argued the current look (red/blue/yellow, hard offset shadows, uppercase heavy type) is *neo*-brutalism, and recommended raw brutalism (monochrome, no decorative shadows) or a dual theme. The refactor kept the neo look. **Default assumption in this plan: keep the current neo-brutalist look, but centralise it entirely in tokens + `BrutalSurface` so a later "raw" theme is a token swap, not a rewrite.** Tell me if you want to choose differently before Wave 1.

### 3.1 Visual rules (already in tokens — keep)

1. Thick borders (`2/3/4`px), radius `0`.
2. Hard offset shadow as a solid block; never blur, gradient, or opacity-glass.
3. Flat, high-contrast fills from the theme palette only. **No hex literals in components.**
4. Heavy, mostly uppercase type; a small fixed type scale.
5. Tactile press: surface sinks into its shadow, haptic tick.
6. Every state is visible and *loud*: disabled is muted + shadowless; focus thickens the border; error changes the border color (not just a message).

### 3.2 Anatomy rules

- **One primitive.** Anything blocky renders through `BrutalSurface`. No component hand-rolls a shadow.
- **One theme source.** Colors come from `useTheme()`; static tokens from `lib/colors`. Nothing reads `colors.light/dark` directly.
- **Render-time metrics** for anything size-dependent (§2.7).
- **Animation:** transform/opacity only. No animated layout props (`width/height/borderWidth/left/top`) unless there is no alternative — and then say why in a comment.
- **No `any`, no unused code, no "template compliance" leftovers.**

### 3.3 API rules

- Props extend the right RN base (`PressableProps`, `ViewProps`, `TextInputProps`) and `style` is `StyleProp<…>` for the **outer wrapper**; inner targets get named props (`inputStyle`, `surfaceStyle`).
- Controlled/uncontrolled follows one convention (docs §8.5): `value`/`defaultValue`/`onValueChange` for values; `open`/`defaultOpen`/`onOpenChange` for overlays. **Every stateful component supports both** (currently Sheet/Dropdown/Select/Tabs are controlled-only).
- Compound components use React context and **throw a clear error** outside their parent; no children-type sniffing (`displayName`/`name` matching) — slots are explicit (`<Select.Trigger/>`/context), not inferred.
- One public spelling per component, one file naming convention (kebab-case), no alias files.
- Deprecated aliases (`PointHeight`, `PressPhysicsConfig`, label-only Badge) are kept **only** if you still need backward compatibility; a rewrite is the right time to drop them. Default: drop, since the lib is unpublished.

### 3.4 Accessibility rules

- Role + state on every interactive node (`disabled/checked/selected/expanded/busy`).
- ≥ 44px hit target (via `hitSlop` where visuals are smaller).
- Decorative subtrees hidden from assistive tech.
- Overlays: `accessibilityViewIsModal`, focus lands inside, Android back closes, dismiss is reachable without a gesture.
- Respects OS font scale (capped) — verified in the Lab with a font-scale toggle.

### 3.5 Per-component "states matrix"

Each component declares which of these apply and the Lab renders all of them: `default · pressed · focused · disabled · loading · error · empty/long-content · dark`.

---

## 4. How we demo components: the Component Lab

The demo stops being a menu of screens and becomes a **lab** where every component is proven under the same conditions.

### 4.1 Principles

1. **Public API only.** Specimens import from `@apexrn/ui` (the barrel). If the barrel is wrong, the demo breaks — good.
2. **Isolation.** One component per specimen; each wrapped in an `ErrorBoundary` that shows the error, the component name and a "copy error" button. A broken component never takes down Home or other specimens.
3. **Lazy.** Specimens load with `require()`/`React.lazy` on open. An import-time crash is scoped to that specimen.
4. **Registry-driven.** `demo/src/lab/registry.ts` lists `{ id, title, group, status, load }`. Home is generated from it and shows status chips: `TODO · WIP · VERIFIED`. Only `VERIFIED`/`WIP` are exported from the barrel.
5. **Theme-true.** The Lab chrome itself uses `useTheme()` — no hardcoded colors, so if the library's theme is broken the Lab *looks* broken.
6. **Same layout every time**, so gaps are obvious.

### 4.2 Fixed specimen layout (`ComponentLab`)

| # | Section | Content |
|---|---|---|
| 1 | **Header** | Name, one-line purpose, status chip, light/dark toggle, font-scale toggle (1× / 1.3× / 2×), RTL toggle. |
| 2 | **Preview** | Default usage exactly as in the docs. |
| 3 | **Variants** | Every variant side by side. |
| 4 | **Sizes** | Every size. |
| 5 | **States matrix** | default / pressed (forced) / focused / disabled / loading / error, as applicable. |
| 6 | **Theme split** | Same component rendered **light and dark simultaneously** (two nested `ApexRNProvider`s). |
| 7 | **Playground** | Live controls for the main props (variant, size, disabled, text length…). |
| 8 | **Stress cases** | Very long text, empty text, 320px-wide container, huge font scale, many items, rapid toggling. |
| 9 | **Composition** | The component inside its real-world parents (Card, Sheet, ScrollView, Form row). |
| 10 | **Usage** | Copyable snippet + props table generated from the type where cheap. |
| 11 | **A11y notes** | Role, states, hit targets, screen-reader label the component exposes. |
| 12 | **Event log** | Every callback (`onPress`, `onValueChange`, `onOpenChange`…) prints to an on-screen log so interactions are provable without a debugger. |

Overlay components (Dialog, Sheet, Dropdown, Select, DatePicker, Toast) additionally get: open/close from code, open-while-keyboard-visible, open-inside-ScrollView, and rapid open/close/open.

### 4.3 Demo file layout

```
demo/
├── App.tsx                      # providers + Lab shell only
├── metro.config.js / babel.config.js / tsconfig.json   # Phase 0
└── src/lab/
    ├── registry.ts              # id, title, group, status, load()
    ├── LabShell.tsx             # header, router (state switch), lazy load, ErrorBoundary
    ├── Home.tsx                 # generated from registry, status chips
    ├── ErrorBoundary.tsx
    ├── ComponentLab.tsx         # the fixed layout in 4.2
    ├── parts/                   # Section, StateCell, ThemeSplit, Playground, EventLog, Toggle
    └── specimens/
        ├── button.tsx           # export const meta; export default function Specimen()
        ├── badge.tsx
        └── …                    # one file per component, nothing shared between them
```

Old `demo/src/screens/*` is deleted screen-by-screen as its replacement is verified (§5.4).

### 4.4 Testing layers (cheap → expensive)

| Layer | What | When |
|---|---|---|
| L1 Types | `tsc` from `demo/` covering `packages/ui` and the Lab | every change |
| L2 Bundle | `expo export --platform web` | every component |
| L3 Web render | run the specimen in the browser, console must be clean (no red errors, no yellow warnings from our code) | every component |
| L4 Device | Android **and** iOS (Expo Go or dev build): interactions, gestures, keyboard, back button | every component that has gestures/overlays/inputs; all components before Wave-end |
| L5 Smoke test (new) | Jest + `@testing-library/react-native`: render each component light+dark, assert no throw and role/state present. Introduced in Wave 1, extended per component. | from Wave 1 on |

---

## 5. The rebuild loop

### 5.1 Definition of Done (a component is VERIFIED only when all are true)

- [ ] Spec written (props table, states, a11y contract) — 10–20 lines at the top of the specimen.
- [ ] Component rewritten to §3 rules; no `any`, no unused symbols, no hex literals, no module-level metric reads.
- [ ] Exported from the barrel; **specimen imports from `@apexrn/ui`**.
- [ ] Specimen implements the §4.2 layout (or documents why a section is N/A).
- [ ] L1–L3 clean. L4 done on Android + iOS where applicable.
- [ ] Light and dark both checked (Theme split section).
- [ ] Stress cases pass at 320px and 2× font scale.
- [ ] Accessibility: role/state/labels verified with a screen reader once (TalkBack or VoiceOver) for input/overlay components.
- [ ] Smoke test added and green.
- [ ] Registry status → `VERIFIED`; old screen deleted; one commit: `feat(ui): <component> — rewrite + lab specimen`.

### 5.2 The loop, per component

```
1. SPEC      write the contract (props, states, a11y) in the specimen header
2. REWRITE   new component file; old version stays in _legacy/ as reference only
3. SPECIMEN  build the Lab page (all §4.2 sections)
4. RUN       web first → fix → device → fix
5. LOCK      DoD checklist, smoke test, commit
6. NEXT      never start N+1 while N is not VERIFIED
```

Rules of engagement:
- **One component per loop.** Do not "fix a neighbor" mid-loop. If a dependency (e.g. `BrutalSurface`) is wrong, stop, reopen *that* item, fix it, re-verify everything that depends on it.
- **If a bug's cause is unclear, first run `npm run doctor`** (§6, task 0.5) — it rules out the environment (duplicate deps) in seconds before we suspect the component.
- **Regression rule:** a change to a Wave-1 primitive re-runs the smoke tests for all VERIFIED components.

### 5.3 Order (dependency-driven)

| Wave | Components | Why here |
|---|---|---|
| **0 — Foundation** | env, Metro/TS/Babel config, Lab shell, `doctor`, Jest | Nothing else is trustworthy until the environment is. |
| **1 — Primitives** | tokens (`colors`, `metrics`), `theme`, `cn`, `usePressPhysics`, `BrutalSurface` (+ new optional `Text` primitive for the type scale) | Everything depends on these; bugs here multiply. |
| **2 — Atoms** | Button, Label, Separator, Badge, Avatar, Skeleton, Progress, Alert, Card, ListItem, FAB | Mostly static/pressable, few dependencies, fast wins. |
| **3 — Inputs** | Input, Textarea, Checkbox, Switch, RadioGroup, Slider, InputOTP | Introduces focus, keyboard, gestures. Input is needed by Select/DatePicker. |
| **4 — Motion & navigation** | Marquee, Carousel, Accordion, Tabs, Toast | Layout-driven animation; layout measuring bugs live here. |
| **5 — Overlays** | Sheet, Dialog, AlertDialog, DropdownMenu, Select, DatePicker | Hardest: Modals, gestures-in-Modal, positioning, slot API. Built on verified Waves 1–3. |

### 5.4 Tracker (update as we go)

`TODO` → `WIP` → `VERIFIED`

| Wave | Item | Status | Notes |
|---|---|---|---|
| 0 | Remove `packages/ui/node_modules` | **DONE** | Recurs on `npm install` until 0.1 lands. |
| 0 | 0.1 Kill `file:` link, lib stubs | **DONE** | `npm install` in demo no longer recreates `packages/ui/node_modules` (tested). `@ui/*` kept as a transitional alias for old screens. |
| 0 | 0.2 Metro: `blockList` + `nodeModulesPaths` + aliases | **DONE** | export clean, 861 modules |
| 0 | 0.3 TS `paths`, typecheck from `demo/` | **DONE** | 0 errors; lib stub tsconfig also 0 |
| 0 | 0.4 Babel: drop manual worklets + alias | **DONE** | |
| 0 | 0.5 `doctor` script | **DONE** | `npm run doctor` in demo |
| 0 | 0.6 Expo config drift (§2.6) | TODO | |
| 0 | 0.7 Lab shell + ErrorBoundary + registry | TODO | |
| 0 | 0.8 Jest + RNTL smoke harness | TODO | |
| 0 | 0.9 Move unverified components to `_legacy/` | TODO | |
| 1 | tokens + metrics | TODO | render-time reads |
| 1 | theme | TODO | |
| 1 | cn / usePressPhysics | TODO | |
| 1 | BrutalSurface | TODO | |
| 2 | Button · Label · Separator · Badge · Avatar · Skeleton · Progress · Alert · Card · ListItem · FAB | TODO | one row each when started |
| 3 | Input · Textarea · Checkbox · Switch · RadioGroup · Slider · InputOTP | TODO | |
| 4 | Marquee · Carousel · Accordion · Tabs · Toast | TODO | |
| 5 | Sheet · Dialog · AlertDialog · DropdownMenu · Select · DatePicker | TODO | Sheet first (GHRV-in-Modal). |

---

## 6. Wave 0 in detail (do this first)

> Snippets are the intended end state. Items marked **(validated)** were run in this pass; the rest are **to be verified when applied**.

### 0.1 Stop `npm` from installing into `packages/ui`

- Remove `"@apexrn/ui": "file:../packages/ui"` from `demo/package.json`; delete `demo/node_modules/@apexrn`.
- Delete `packages/ui/tsconfig.json`'s implied standalone role (or keep only as an editor hint) and remove its `typecheck` script.
- Strip `packages/ui/package.json` down to what a *source-only* package needs; keep `peerDependencies` (documentation for consumers) but remove `expo-modules-core` (§2.6). Never run `npm install` inside `packages/ui`.
- Add `packages/ui/.npmrc` containing `package-lock=false` and `packages/ui/.gitignore` with `node_modules/` as defence in depth.

### 0.2 Metro (`demo/metro.config.js`) — resolve `@apexrn/ui` and block strays

```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const uiRoot = path.resolve(projectRoot, '../packages/ui');
const config = getDefaultConfig(projectRoot);

config.watchFolders = [uiRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// extraNodeModules can't map scoped subpaths (@ui/lib/theme is read as package "@ui/lib"),
// so aliases go through resolveRequest.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@apexrn/ui') return context.resolveRequest(context, path.join(uiRoot, 'index.ts'), platform);
  if (moduleName.startsWith('@ui/')) return context.resolveRequest(context, path.join(uiRoot, moduleName.slice(4)), platform);
  return context.resolveRequest(context, moduleName, platform);
};

// If a node_modules ever reappears in the lib, Metro must not see it:
config.resolver.blockList = [new RegExp(`${uiRoot.replace(/[\/]/g, '[\\/]')}[\\/]node_modules[\\/].*`)];

module.exports = config;
```

### 0.3 TypeScript (`demo/tsconfig.json`)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@apexrn/ui": ["../packages/ui/index.ts"],
      "*": ["./node_modules/@types/*", "./node_modules/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", "../packages/ui/**/*.ts", "../packages/ui/**/*.tsx"],
  "exclude": ["node_modules", "dist", "../packages/ui/_legacy"]
}
```

The `"*"` mapping with `@types` first is **(validated: 0 errors)**. **Gotcha (found while applying):** Expo feeds tsconfig `paths` into Metro, so the `"*"` mapping made Metro resolve `react` to `@types/react` and the bundle failed. `app.json` therefore needs `"experiments": { "tsconfigPaths": false }`; aliases are handled only in `metro.config.js`. The `include`/`exclude` and the `@apexrn/ui` path entry are to be verified. `demo` script: `"typecheck": "tsc --noEmit"`. This one command typechecks both the lib and the Lab.

### 0.4 Babel (`demo/babel.config.js`)

```js
module.exports = function (api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };   // preset auto-adds the worklets plugin
};
```

Remove `module-resolver` and the manual `react-native-worklets/plugin`, and remove `babel-plugin-module-resolver` from devDependencies.

### 0.5 `doctor` script (`demo/scripts/doctor.mjs`, wired as `npm run doctor`)

Fails (non-zero) if any of these is true:
- `../packages/ui/node_modules` exists;
- `../packages/ui/package-lock.json` exists;
- `require.resolve('react-native/package.json', { paths: [<packages/ui/components>] })` ≠ the same path resolved from `demo/`, and the same check for `react`, `react-native-reanimated`, `react-native-svg`, `react-native-gesture-handler`;
- `expo-doctor` reports failures (optional, slower flag).

Run it at the start of every loop and in CI.

### 0.6 Expo config drift

Apply the §2.6 table: clean `app.json`, `userInterfaceStyle: "automatic"`, `npx expo install react-native-svg`, drop `expo-modules-core`, fix `AGENTS.md`.

### 0.7 Lab shell

Build `registry.ts`, `LabShell`, `Home`, `ErrorBoundary`, `ComponentLab` and `parts/*` per §4. **Ship the shell with zero library components** to prove the isolation + theme plumbing before Wave 1 begins.

### 0.8 Jest + RNTL

`jest-expo` preset, `@testing-library/react-native`, one test file per component under `demo/__tests__/` (or `packages/ui/__tests__` executed *from* demo's Jest config so the lib keeps zero deps). Mock `expo-haptics`; use Reanimated's Jest mock.

### 0.9 Quarantine

`git mv` every not-yet-verified file in `packages/ui/components/` to `packages/ui/_legacy/components/` (excluded from tsconfig and from the barrel). Reduce `index.ts` to what is verified. As each component is rewritten, its legacy file is deleted in the same commit. The 8 kebab alias files are deleted outright; the final naming convention is kebab-case (`dropdown-menu.tsx`, …).

### Phase 0 exit criteria

`npm run doctor` green · `npm run typecheck` 0 errors · `npx expo export --platform web` clean · Lab opens on web and device with an empty registry and working light/dark toggle · `npm install` in `demo/` does **not** recreate `packages/ui/node_modules` (test this explicitly).

---

## 7. Decisions I need from you (with the default I'll use if you don't answer)

| # | Decision | Default |
|---|---|---|
| 1 | Design direction: keep neo-brutalist look, go raw brutalism, or dual theme (`AUDIT §1`) | Keep neo look, isolate it in tokens so raw is a later token swap. |
| 2 | Keep deprecated aliases (`PointHeight`, `PressPhysicsConfig`, label-only Badge)? | Drop — nothing is published yet. |
| 3 | Distribution: npm package (source-only, as now) vs shadcn-style copy CLI | Source-only npm package; CLI is out of scope for this rewrite. |
| 4 | Platform targets: Android + iOS + web, or native-only? | All three; web is used for fast iteration, device is the source of truth. |
| 5 | Add the optional typographic `Text` primitive in Wave 1? | Yes — brutalism is type-led and every component hand-rolls the same uppercase/heavy text style today. |

---

## Appendix A — Symptom → likely cause (triage table)

Use before touching component code. Add rows as we meet new errors.

| You see | Check first | Then |
|---|---|---|
| `Invalid hook call` / `useContext of null` | `npm run doctor` (duplicate React) | Only then inspect the component. |
| `Tried to register two views with the same name …` | `doctor` (duplicate `react-native-svg` / gesture-handler) | — |
| Dark mode doesn't apply to some/all components | Is the provider above the component (Modal content is fine; separate `createRoot` is not)? `userInterfaceStyle` in `app.json`? Two copies of `lib/theme`? | Check imports go through `@apexrn/ui` only. |
| Gesture does nothing in a Sheet/Select/DatePicker on Android | `GestureHandlerRootView` inside the `Modal` (§2.5) | Fix in Sheet. |
| Slider crashes with "GestureDetector must be used as a descendant of GestureHandlerRootView" | App root missing `GestureHandlerRootView` | Consumer setup; add dev warning. |
| Reanimated warning: "Reading from `value` during component render" | Someone read `sv.value` in render | Use `useDerivedValue`/animated style. |
| Works on web, red screen on device | New Architecture strictness, native-only props, style function/array mistakes | Reproduce on device before "fixing". |
| Everything is the wrong size after rotate | Module-level `StyleSheet.create` using `spacing`/`typography` (§2.7) | Move to render-time. |
| `tsc`: `Property 'children'/'style' does not exist on …Props` | TS can't resolve `react-native` from `packages/ui` | Apply the `paths` mapping (0.3). |
| `tsc`: `TS7016 Could not find a declaration file for module 'react'` | `paths` order wrong (`node_modules/*` before `@types/*`) | Put `@types/*` first. |

## Appendix B — Commands

```bash
# from demo/
npm run doctor                          # env sanity (Phase 0.5)
npm run typecheck                       # lib + lab, one command
npx expo export --platform web          # bundle check
npx expo start --web                    # fast iteration
npx expo start                          # device (Expo Go / dev build)
npx expo install --check                # SDK version alignment
npx expo-doctor                         # config sanity

# never:
cd packages/ui && npm install           # recreates the duplicate tree
```

---

*Next step on your go-ahead: execute Phase 0 (§6), then start Wave 1 with the first loop.*
