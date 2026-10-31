# ApexRN: full project context pack

> **For Claude:** this file is the full briefing on the ApexRN repo, as of 2026-10-31 (branch `main`, HEAD `8265c48`). Treat it as ground truth about the codebase and its state. Where it says "unverified", don't assume either way. When I ask "what can I do next", use §2 (status) and §3 (blocker) first, then the plan in Part A. If I attach any of the files listed in §4, prefer their contents over the summaries here.

The file was assembled from four research passes over the repo: plan/docs, code, website/preview, and a crash diagnosis. Every claim was checked against the source files and a few read-only commands. The full root `CLAUDE.md` is included verbatim in Appendix Z.

---

## 1. One-paragraph summary

**ApexRN (`@apexrn/ui`) is a brutalist UI component library for React Native / Expo (SDK 57) that works like shadcn/ui:** a CLI (`npx apexrn add button`) copies readable, self-contained component source into your app from a static registry. Its components are compound and context-based, use variant maps resolved from theme tokens, and render everything blocky through one `BrutalSurface` primitive. It is a monorepo with these folders:

- `packages/ui`: 36 components and 6 lib files, source only.
- `packages/cli`: init, add, diff and list commands; zero deps; 18 tests passing.
- `registry/`: `build.mjs`, `meta.json` and a contrast checker; 42 items.
- `demo/`: an Expo showcase app that holds **all** the dependencies.
- `preview/`: a headless Expo web runtime that renders one component.
- `website/`: a Next.js 16 static docs site and landing page.

## 2. Where it stands right now (TL;DR status)

| Area | State |
|---|---|
| Components | All 36 reworked (2026-09-29). **None VERIFIED.** The tracker in `apexrn-modify.md` §5.4 says WIP for every row. Checked on web (headless Chrome); hand-tested in Expo Go once on an unrecorded OS. |
| Static checks | `npm run doctor` OK · `npm run typecheck` clean · `expo export` web + android both bundle · `npm run cli:test` 18/18 pass (all run 2026-10-31). |
| Demo app on device | **Broken: red screen on launch** (see §3). Web still works. |
| Plan Wave 0 | 0.6 Expo config drift, 0.7 Component Lab shell, 0.8 Jest smoke tests, 0.9 `_legacy` quarantine are all **TODO**. The "Component Lab" does not exist yet: `demo/App.tsx` is a flat state router over ~48 eagerly-imported screens, with no ErrorBoundary. |
| Website | Docs pages good, landing page "a mess" (owner's words), with a button issue on it. Previews iframe the **demo** web export (`/lab/index.html?embed=1#...`). The owner wants them to use **`preview/`** instead, which needs protocol work (Part C §3). The `public/lab/` build step is missing. |
| Release | "Ready to test for release, not ready to ship." No device passes, no screen-reader, reduced-motion or large-font pass, CI never ran on GitHub, registry not hosted, nothing published to npm. |
| Git | Working tree clean except the deleted `brag-output-2026-10-02-230903/` folder (a generated launch video committed in `8265c48`). |
| Expo drift | `npx expo install --check` reports minor drift: expo 57.0.25 vs ~57.0.31, expo-asset, expo-modules-core, react-native-svg 15.15.5 vs 15.15.4. |

## 3. Current blocker: demo crashes with "Cannot read property 'search' of undefined"

**Symptom:** `cd demo && npx expo start`, open in Expo Go (Android/iOS), and you get a red screen as soon as the app launches. Web is fine.

**Root cause (definite; two independent investigations agree and the line was re-read):** `demo/src/components/Layout.tsx:17`

```tsx
const isEmbed = typeof window !== 'undefined' && (window.location.search.includes('embed=1') || window.location.search.includes('frame=0'));
```

React Native sets `global.window = global` (`react-native/Libraries/Core/setUpGlobals.js`) but never defines `window.location`, so the `typeof window` guard passes and `.search` throws during render. `HomeScreen` renders `<Layout>`, so the crash happens on the first frame. It was introduced in commit `a230fa0` (the website/embed work). `tsc` can't catch it because the DOM types say `location` always exists. `App.tsx` and `ThemeContext.tsx` read the hash safely because they check `Platform.OS === 'web'` first.

**Fix (not yet applied):**

```tsx
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// ...
const search = Platform.OS === 'web' ? window.location?.search ?? '' : '';
const isEmbed = search.includes('embed=1') || search.includes('frame=0');
```

**Related native-unsafe code:**
- `demo/src/screens/PlaygroundScreen.tsx:27` calls `window.addEventListener` without a platform guard.
- In `preview/`, `App.tsx:42/44` uses `window.addEventListener` / `removeEventListener` without a guard, and `src/protocol.ts:45` uses `window.parent.postMessage`. This only matters if `preview/` is ever run on a device; its scripts are web-only.

**To verify the fix:**
1. Run `npx expo start` from `demo/` and open the app in Expo Go on Android and iOS.
2. On web, check that `?embed=1` still hides the demo header.

## 4. Files to attach to a Claude chat (if it needs more than this pack)

This pack summarises them. Attach the originals when the conversation goes deep on that topic.

**Tier 1: project brain (attach these first)**

| File | Why |
|---|---|
| `CLAUDE.md` | Project rules and conventions (already verbatim in Appendix Z). |
| `apexrn-modify.md` | THE master plan: spec per component, Definition of Done, tracker, Wave 0, triage table. |
| `shipping.md` | Release checklist and what's done vs TODO. |
| `website.md` | The website plan. |
| `website/bugs.md` | Open website bugs. |
| `design/AUDIT.md` | Original diagnosis (pre-refactor). |

**Tier 2: code that matters most**

| File | Why |
|---|---|
| `packages/ui/lib/theme.tsx`, `colors.ts`, `metrics.ts`, `utils.ts`, `use-press-physics.ts` | Tokens, provider, `cn`, press physics. |
| `packages/ui/components/brutal-surface.tsx`, `button.tsx`, `dialog.tsx`, `sheet.tsx` | The primitive, a reference atom, and a reference overlay. |
| `packages/ui/index.ts`, `packages/ui/package.json` | Public surface, peers. |
| `demo/App.tsx`, `demo/src/components/Layout.tsx`, `demo/metro.config.js`, `demo/tsconfig.json`, `demo/app.json`, `demo/package.json` | Demo wiring and the crash site. |
| `registry/meta.json`, `registry/build.mjs`, `packages/cli/` (src) | Registry and CLI. |
| `preview/App.tsx`, `preview/src/protocol.ts` | Preview runtime protocol. |
| `website/src/components/PhoneFrame.tsx`, `docs/ComponentPreview.tsx`, `playground/PlaygroundPreview.tsx`, `ThemeContext.tsx`, `website/scripts/generate-docs.mjs`, `playground-config.ts` | Where the website embeds the demo (to switch it to `preview/`). |

**Tier 3: history and reference (only if asked)**

| File | Why |
|---|---|
| `design/REFACTOR.md`, `CHANGELOG.md`, `docs/releasing.md`, `docs/components.md`, `README.md`, `CONTRIBUTING.md` | History, release process, public docs. |
| `website_prompts/instructions.md` and `prompt1–9.md`, `prompt.md` | The prompts that built the website and the lib. |
| `apexrn-docs.md` | ⚠ Stale pre-rewrite docs that overclaim. Don't trust them over code. |
| `.github/workflows/ci.yml`, `registry.yml` | CI (never run on GitHub). |

**Never attach:** `node_modules/`, `demo/dist`, `preview/dist`, `website/out`, `registry/public` (generated), lockfiles, or `brag-output-*`.

## 5. Discrepancies to be aware of

- The commit `bb8df90` says "completely tested on expo go", but the tracker and `shipping.md` say only one hand test on an unrecorded OS. **Treat everything as device-unverified.** The current red screen shows it can't have been tested on a device since `a230fa0`.
- `CLAUDE.md` still mentions transitional `@ui/*` aliases and a Component Lab. In the code, `@ui/*` is gone (Metro only aliases `@apexrn/ui`) and the Lab hasn't been built.
- An old note listed an `Input.tsx` vs `input.tsx` casing bug. It is **fixed**: git tracks `input.tsx`.
- `docs/releasing.md` says "nothing is committed". That is outdated; the work is committed.
- The tracker was never updated for AppBar, Drawer, BottomNav, SearchBar, Chip or Toaster.
- `lucide-react-native` is in `demo/package.json` but unused.

## 6. Good next moves (for discussion)

1. Apply the §3 fix, then run the demo in Expo Go on Android and iOS, and go through the device-risk list: Sheet, Slider, Carousel snapping, Toast offset, Dropdown positioning on Android.
2. Decide the preview strategy: extend `preview/`'s `apexrn:render` protocol to cover theme, reduced motion and playground props, then point the website iframes at it and add a build step that produces `website/public/...`.
3. Fix the landing page button and layout.
4. Wave 0 leftovers: Jest smoke tests, a Lab shell with an ErrorBoundary and lazy loading, Expo version alignment.
5. Get CI green on GitHub. Host the registry (default URL `blackmonk892.github.io/apexrn`, not confirmed live). Test the CLI on a fresh `create-expo-app`.
6. Open decisions: neo vs raw brutalist palette, whether to publish `@apexrn/ui` to npm, the registry domain, adding a lint config, `Sheet`/`Toast` being controlled-only.

---

**Layout of the rest of this file:**
- **Part A:** vision, rules, plan, tracker, shipping, decisions, doc map.
- **Part B:** code map (library, tokens, CLI/registry, demo wiring, issues list).
- **Part C:** website, preview runtime, CI, recent work.
- **Part D:** crash investigation log.
- **Appendix Z:** root `CLAUDE.md`, verbatim.


---

# Part A: Vision, plan, rules, status

## Section: Vision, plan, rules, and status

Source of truth: CLAUDE.md, apexrn-modify.md ("the plan"), shipping.md, docs/releasing.md, CHANGELOG.md, design/*. Snapshot date 2026-10-31. Facts checked against the repo where noted ("[checked]").

---

### 1. What ApexRN is

- **ApexRN (`@apexrn/ui`)**: a brutalist UI component library for React Native / Expo (SDK 57), inspired by shadcn/ui and meant to work the same way, for native apps rather than web.
- **Distribution model (decided, "like shadcn")**: a CLI (`npx apexrn init`, `add`, `diff`, `list`) copies component source into the user's Expo app, backed by a static JSON registry. Users own and edit the code. No runtime package to depend on. An npm publish of `@apexrn/ui` is only an undecided optional second path (shipping.md Phase 7; apexrn-modify.md §7 #3 defaulted to "source-only npm package, CLI out of scope", which was later overtaken by the CLI/registry work).
- **Monorepo**: `packages/ui` (source only), `packages/cli` (zero deps, node --test), `registry/` (build.mjs + meta.json -> registry/public, generated, gitignored; also check-contrast.mjs), `demo/` (Expo app, ALL deps live here, hosts the "Component Lab"), `preview/` (second Expo runtime for the website phone-frame), `website/` (Next.js static export docs site), `docs/`, `design/`, `.claude/skills/` (vendored `frontend-design`, `ui-ux-pro-max`), `.github/workflows/` (`ci.yml`, `registry.yml`).
- Other root files: `website.md` + `website_prompts/` (website plan and prompts), `brag-output-*` (launch video artefacts, currently showing as deleted in git status).

#### shadcn mental model (applies to every decision)
- **Own-the-code**: each component is a small readable self-contained file; minimal cross-file coupling so the CLI can copy one component + few deps.
- **Composition over configuration**: compound components (`Dialog` -> `DialogTrigger`, `DialogContent`, `DialogTitle`...) share state via React context; prefer `asChild` and explicit slots over long prop lists or children-type sniffing.
- **Variants as data**: a small variant/size map (like `cva`) resolved from theme tokens; never scattered conditionals or raw hex.
- **Tokens + primitives**: one theme, one surface primitive (`BrutalSurface`), one style-merge helper (`cn`).
- **Unstyled-enough**: `style` targets the outer wrapper; named props (`inputStyle`, `surfaceStyle`) target inner parts; consumers change theme, not internals.
- **Controlled and uncontrolled**: `value/defaultValue/onValueChange`, `open/defaultOpen/onOpenChange`.
- **No runtime deps beyond peers**: react, react-native, reanimated, gesture-handler, svg, expo-haptics, worklets.

#### Visual language (brutalist; lives in tokens + BrutalSurface so it can be swapped by tokens)
Thick borders (2/3/4 px), zero radius, hard offset solid shadows (no blur/gradient/glass), flat high-contrast fills, heavy mostly-uppercase type, tactile press physics (surface sinks into its shadow + haptic tick, spring `{damping 15, stiffness 400, mass 0.5}`), loud states (disabled = muted + shadowless; focus thickens border; error changes border colour). Current look = "neo-brutalist" (primary `#FF5252` red, secondary `#3D5AFE` indigo, accent `#FFD600` yellow on light; later contrast fixes changed some tokens, see CHANGELOG).

---

### 2. Hard rules and code conventions (CLAUDE.md, every rule)

#### Hard rules (never break)
1. `packages/ui` is **source only**: no `node_modules`, no lockfile, never `npm install` there. All deps are installed in `demo/`. A second install duplicates react/reanimated/svg -> "Invalid hook call", duplicate native view registration, dead themes. `cd demo && npm run doctor` must stay green.
2. Do **not** add `"@apexrn/ui": "file:../packages/ui"` to any package.json (it made npm install peers inside `packages/ui`).
3. Metro/TS/Babel wiring is deliberate, do not "clean it up":
   - Aliases (`@apexrn/ui`, transitional `@ui/*`) live in `demo/metro.config.js` via `resolveRequest` (`extraNodeModules` cannot map scoped subpaths).
   - `demo/tsconfig.json` has a `"*"` path mapping so TS resolves deps for files in `packages/ui`; `@types/*` must come FIRST.
   - `demo/app.json` has `experiments.tsconfigPaths: false`, else Expo feeds the `"*"` mapping to Metro and `react` resolves to `@types/react`.
   - `babel.config.js` is preset-only; `babel-preset-expo` already adds the worklets plugin (do not list it again).
4. Import the library only through `@apexrn/ui` in new demo code. `@ui/*` deep imports exist only for old screens and disappear as they are rebuilt.
5. **One component per loop.** Never start the next until the current is VERIFIED (plan §5). If a primitive is wrong, reopen it and re-verify its dependents.
6. **Web passing != device passing.** Reanimated 4 + New Architecture errors often appear only on Android/iOS. Test gestures, overlays, keyboard, back button on device.
7. Do not change `package.json` dependency versions casually; use `npx expo install <pkg>` (Expo SDK 57).

#### Code conventions
- TypeScript strict, `noUnusedLocals`/`noUnusedParameters`, no `any` in public APIs.
- Colours only from `useTheme().colors`; no hex literals in components; never read `colors.light`/`colors.dark` directly.
- Anything blocky renders through `BrutalSurface`; do not hand-roll shadow/border stacks.
- Size-dependent tokens (`spacing`, `typography`, window size) read at **render time**, not in module-level `StyleSheet.create`. Static values (border widths, offsets) may stay static.
- Animate `transform`/`opacity` only (Reanimated, UI thread). Avoid animating layout props (width/height/borderWidth/left/top) unless unavoidable, and comment why.
- Merge styles with `cn(base, themeOverrides, conditional, consumerStyle)`; consumer style last. Do not pass animated styles through `cn`; use arrays.
- A11y is part of the component: role + state on interactive nodes, >=44px hit targets (`hitSlop`), decorative subtrees hidden from AT, overlays use `accessibilityViewIsModal` and close on Android back.
- Any `GestureDetector` inside an RN `Modal` needs its own `GestureHandlerRootView` inside that Modal (Android renders Modals in a separate window).
- Compound components throw a clear error outside their parent; no `displayName`/`name` sniffing to detect slots.
- Registry: components import shared code as `../lib/x` and siblings as `./x` (CLI rewrites `../lib`). Every new component needs an entry in `registry/meta.json`; `node registry/build.mjs` fails otherwise.
- Exports: every component is a **named** export (`export function Button`); single-component files also keep `export default`. Names unique across components (CLI barrel does `export *`). Value controls: `value/defaultValue/onValueChange`; overlays `open/defaultOpen/onOpenChange`; status variants `destructive | success | warning`.
- Contrast: every foreground/background token pair >= 4.5:1 in both themes; `node registry/check-contrast.mjs` (`npm run tokens:check`) enforces.
- File naming: kebab-case, one spelling per component, no alias re-export files. Comments explain why, not what; no "template compliance" leftovers or dead constants.
- Keep files focused: component + sub-parts in one file unless > ~300 lines.

#### Design workflow (vendored skills, offline, use for every component's design pass BEFORE code)
- `frontend-design` (aesthetic direction; plan -> self-review -> build -> critique; restraint, "spend boldness in one place").
- `ui-ux-pro-max` (searchable local data). From repo root: `python .claude/skills/ui-ux-pro-max/scripts/search.py "<q>" --domain style|ux|typography -n N` or `--stack react-native`. Never use `--persist` unless asked.
- Per-component pass: (1) stack react-native + domain ux searches; (2) frontend-design plan (job, states, one memorable brutalist detail; critique vs "generic default"); (3) build to plan §3 spec.
- Reconciliation: the brief wins (brutalist vocabulary is a decision, apply the skill's anti-habit warnings to *how* it is used: hierarchy, restraint, purposeful labels). `ui-ux-pro-max` is web-flavoured: ignore Tailwind/CSS/GSAP/Google Fonts; take touch targets, 4.5:1 contrast, feedback timing, reduced motion, dark-mode contrast, safe areas. Its "brutalism = instant transitions" is overridden: keep short purposeful press physics (spring + haptic), respect reduced motion. Neo vs raw palette is open; default is current neo look isolated in tokens.

#### Commands (from `demo/`)
`npm run doctor` · `npm run typecheck` (covers packages/ui AND demo) · `npx expo export --platform web` · `npx expo start --web` · `npx expo start` (device) · `npx expo install --check` · `npx expo-doctor`. Before a PR (CONTRIBUTING.md / releasing.md): `cd demo && npm run doctor && npm run typecheck && npx expo export --platform web` then `node registry/check-contrast.mjs && node registry/build.mjs && (cd packages/cli && npm test)`.

#### Things to never do
`npm install` in `packages/ui`; add lockfile/node_modules there; hex colours / hand-rolled shadows / module-level metric reads in components; expand scope mid-loop; publish to npm, run destructive git commands, or delete `_legacy` files before replacement is VERIFIED without being asked; trust `demo/AGENTS.md`'s version-pinned docs link over installed SDK 57.

#### When something renders wrong (triage order)
1. `npm run doctor`. 2. Provider above component; everything imported via one module path? 3. Gesture inside a Modal without root view? 4. Web-only or device-only? reproduce on failing platform first. 5. Only then read the component.

---

### 3. The plan (apexrn-modify.md)

Status line: "plan of record; supersedes the what's-next parts of design/REFACTOR.md". Agreed approach: rewrite lib component by component, each paired with a demo page; test, fix, lock, next. `packages/ui` source-only. Evidence labels [verified]/[inferred].

#### 3.1 Diagnosis summary (§0, §2)
- **Root cause of render problems = environment**: `packages/ui/node_modules` (331 pkgs incl. a second react 19.2.3, react-native 0.86.3, reanimated 4.5.1, svg, gesture-handler) -> lib and demo ran on two React/RN/Reanimated instances. Symptoms: Invalid hook call, "Tried to register two views with same name RNSVGSvgView/RNGestureHandlerRootView", Reanimated shared values dead, theme context mismatch (useTheme returns light fallback), works-on-web/crashes-on-device. Cause: `"@apexrn/ui": "file:../packages/ui"` in demo made npm install peers in the link target. Fix: drop `file:` link; resolve via Metro + TS aliases only; Metro `blockList` for `packages/ui/node_modules`; `doctor` script.
- §2.2 Metro vs TS resolve differently: after removing node_modules, `tsc` gave 206 errors (TS cannot find react-native from packages/ui); fix = tsconfig `paths` `"*": ["./node_modules/@types/*","./node_modules/*"]` with `@types` first (wrong order -> 182 TS7016). Gotcha: Expo feeds `paths` to Metro -> need `experiments.tsconfigPaths:false`.
- §2.3 three overlapping alias systems (babel module-resolver, metro extraNodeModules, tsconfig paths) + file: link; demo never imported `@apexrn/ui`, so barrel untested; `datepicker` vs `date-picker` two module IDs.
- §2.4 worklets Babel plugin registered twice (preset already adds it).
- §2.5 Sheet used GestureDetector inside Modal with no GestureHandlerRootView (Android separate window) -> Select and DatePicker (built on Sheet) inherit. Slider needs ancestor GestureHandlerRootView (consumer requirement, needs friendly dev warning).
- §2.6 Expo config drift (expo-doctor, 3 fails): `app.json` has invalid-for-SDK57 `newArchEnabled`, `splash`, `android.edgeToEdgeEnabled`; `expo-modules-core` direct dep + lib peer; `react-native-svg` 15.15.5 vs expected 15.15.4; `userInterfaceStyle:"light"` pins OS scheme so `defaultMode="system"` never sees dark (fixed later, see commit f2ac692 below); `demo/AGENTS.md` says v54 docs.
- §2.7 docs overclaim (see §6 below).
- §2.8 demo hides failures: 33 screens eagerly imported, no ErrorBoundary, hard-coded `#FFF/#000/#1A1A1A`, ad hoc screens, 7 "batch" screens duplicating per-component ones.
- §2.9 component-level risks table (inferred): Sheet gesture-in-Modal (High); Select/DatePicker slot detection via `child.type/displayName/name` (Med); `pointerEvents` as prop on Input (Med); InputOTP/Input animate `borderWidth` (Med); Accordion open-on-mount flash (Med); Toast dismiss via 260 ms timer (Med); Dialog `[open]` deps (Low); Slider `onValueChange` only on gesture end (Med); Carousel `adjustable` role w/o actions (Low); Marquee font-scale (Low); all animated components Reanimated4+NewArch native-only errors (High); 8 kebab alias files duplicating snake_case modules (High).

#### 3.2 Spec for every component (§3)
- Visual rules §3.1 (above). Anatomy §3.2: one primitive (BrutalSurface), one theme source, render-time metrics, transform/opacity animation, no any/unused code.
- API §3.3: props extend right RN base; `style` = StyleProp for outer wrapper, inner named props; one controlled/uncontrolled convention, every stateful component supports both (Sheet/Dropdown/Select/Tabs were controlled-only); compound components use context and throw outside parent, no type sniffing; one public spelling + kebab-case, no alias files; deprecated aliases (`PointHeight`, `PressPhysicsConfig`, label-only Badge) dropped by default since unpublished.
- A11y §3.4: role+state on every interactive node; >=44 px target; decorative hidden; overlays `accessibilityViewIsModal`, focus inside, Android back closes, dismiss reachable without gesture; honour OS font scale (capped), verified via Lab font-scale toggle.
- States matrix §3.5: `default · pressed · focused · disabled · loading · error · empty/long-content · dark` (declare which apply).

#### 3.3 Component Lab design (§4) - PLANNED
Lab replaces the menu-of-screens demo. Principles: public API only (`@apexrn/ui`), isolation (per-specimen ErrorBoundary with copy-error button), lazy load (`require`/`React.lazy`), registry-driven (`demo/src/lab/registry.ts` `{id,title,group,status,load}`, Home generated with TODO/WIP/VERIFIED chips), theme-true Lab chrome, same layout every time.
Fixed specimen layout (12 sections): Header (name, purpose, status chip, light/dark, font-scale 1x/1.3x/2x, RTL) · Preview · Variants · Sizes · States matrix · Theme split (two nested providers) · Playground · Stress cases (long/empty text, 320 px, huge font, many items, rapid toggling) · Composition · Usage snippet + props table · A11y notes · Event log. Overlays additionally: open/close from code, open with keyboard visible, inside ScrollView, rapid open/close/open.
Planned layout: `demo/App.tsx` (providers + shell), `demo/src/lab/{registry.ts,LabShell.tsx,Home.tsx,ErrorBoundary.tsx,ComponentLab.tsx,parts/,specimens/<component>.tsx}`.
Test layers: L1 tsc from demo; L2 `expo export --platform web`; L3 web render console clean; L4 device Android AND iOS; L5 Jest + RNTL smoke (render light+dark, no throw, role/state), from Wave 1.
**Reality [checked]: `demo/src/lab/` does NOT exist.** The demo still uses `demo/src/screens/*Screen.tsx` (42 files incl. combined Forms/Feedback/Display/Overlay/Navigation/Showcase/Playground screens), `demo/src/playground/registry.tsx`, `demo/src/components`, `demo/src/context`. Lab shell (tracker 0.7) is TODO. (website.md §6 plans a Lab "embed mode" with web deep links `?r=<n>#<screenId>:<light|dark>`, driven by HomeScreen GROUPS ids; and a separate `preview/` runtime exists.)

#### 3.4 Definition of Done (§5.1) - a component is VERIFIED only when ALL true
- [ ] Spec written (props table, states, a11y contract), 10-20 lines at top of specimen.
- [ ] Rewritten to §3 rules; no any, no unused symbols, no hex, no module-level metric reads.
- [ ] Exported from barrel; specimen imports from `@apexrn/ui`.
- [ ] Specimen implements §4.2 layout (or documents N/A).
- [ ] L1-L3 clean; L4 on Android + iOS where applicable.
- [ ] Light and dark checked (Theme split).
- [ ] Stress cases pass at 320 px and 2x font scale.
- [ ] Screen-reader verification (TalkBack or VoiceOver) once for input/overlay components.
- [ ] Smoke test added and green.
- [ ] Registry status -> VERIFIED; old screen deleted; one commit `feat(ui): <component> - rewrite + lab specimen`.

#### 3.5 Rebuild loop (§5.2) and rules of engagement
`1 SPEC -> 2 REWRITE (old version in _legacy/ as reference only) -> 3 SPECIMEN -> 4 RUN (web, fix, device, fix) -> 5 LOCK (DoD, smoke test, commit) -> 6 NEXT (never start N+1 while N not VERIFIED)`.
Rules: one component per loop, do not fix a neighbour; if a dependency (e.g. BrutalSurface) is wrong, stop, reopen, fix, re-verify dependents; run `npm run doctor` first when cause unclear; regression rule: change to a Wave-1 primitive re-runs smoke tests of all VERIFIED components.

#### 3.6 Order / waves (§5.3)
| Wave | Components | Why |
|---|---|---|
| 0 Foundation | env, Metro/TS/Babel config, Lab shell, `doctor`, Jest | environment must be trustworthy first |
| 1 Primitives | tokens (`colors`,`metrics`), `theme`, `cn`, `usePressPhysics`, `BrutalSurface` (+ optional `Text` primitive for type scale) | everything depends on them |
| 2 Atoms | Button, Label, Separator, Badge, Avatar, Skeleton, Progress, Alert, Card, ListItem, FAB | static/pressable, few deps |
| 3 Inputs | Input, Textarea, Checkbox, Switch, RadioGroup, Slider, InputOTP | focus, keyboard, gestures; Input needed by Select/DatePicker |
| 4 Motion & nav | Marquee, Carousel, Accordion, Tabs, Toast | layout-driven animation |
| 5 Overlays | Sheet, Dialog, AlertDialog, DropdownMenu, Select, DatePicker | Modals, gestures-in-Modal, positioning, slot API |

#### 3.7 Tracker (§5.4) - reproduced as-is (`TODO -> WIP -> VERIFIED`)
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
| 1 | tokens + metrics | WIP | Added `touchTarget`, `controlHeight`, `opacity`, `motion`, `scrim`. Web-checked only. |
| 1 | theme | WIP | Unchanged. |
| 1 | cn / usePressPhysics | WIP | `usePressPhysics` now honours reduced motion. |
| 1 | BrutalSurface | WIP | Dropped the `void _x` hack; unchanged behaviour. |
| 2 | Button · Label · Separator · Badge · Avatar · Skeleton · Progress · Alert · Card · ListItem · FAB | WIP | Reworked + demo screens. Web-verified in headless Chrome (light + dark); not run on a device. |
| 3 | Input · Textarea · Checkbox · Switch · RadioGroup · Slider · InputOTP | WIP | Reworked + demos. Real mouse drag/tap/typing tested on web; keyboard/IME behaviour untested on device. |
| 4 | Marquee · Carousel · Accordion · Tabs · Toast | WIP | Reworked + demos. Carousel swipe/snap **not** exercised (web export only). |
| 5 | Sheet · Dialog · AlertDialog · DropdownMenu · Select · DatePicker | WIP | Reworked + demos. Sheet now has its own `GestureHandlerRootView` in the Modal and a handle-only dismiss pan; **Android Modal/gesture behaviour is unverified**. |

Tracker footnote (verbatim intent): "Not done for any row above (so none is VERIFIED): device run (Android + iOS), screen-reader pass, Jest smoke tests (Wave 0.8 not built), per-component commit. Web checks were scripted with headless Chrome over CDP (mouse events, DOM/aria assertions, console-error capture); the scripts are not in the repo."
Tracker gaps: it was NOT updated for the 5 newer components (AppBar, Drawer, BottomNav, SearchBar, Chip) or Toaster/`lib/icons` (shipping.md Phase 0 has this as an open box). Status count: **0 components VERIFIED**; Wave-0 items 0.6-0.9 open. "Total components": 36 shipped = 31 reworked + 5 new; docs list 36 incl. BrutalSurface (README), registry has 42 items.

#### 3.8 Wave 0 detail (§6) - intended end state
0.1 remove `file:` link, `.npmrc package-lock=false` + `.gitignore node_modules/` in packages/ui, strip packages/ui/package.json (drop `expo-modules-core` peer). 0.2 Metro: `watchFolders=[uiRoot]`, `nodeModulesPaths=[demo/node_modules]`, `resolveRequest` for `@apexrn/ui` and `@ui/*`, `blockList` on `packages/ui/node_modules`. 0.3 tsconfig extends `expo/tsconfig.base`, strict, paths `@apexrn/ui` + `"*"` (@types first), include lib sources, exclude `_legacy`. 0.4 babel preset-only. 0.5 `demo/scripts/doctor.mjs`: fails if `packages/ui/node_modules` or package-lock exists, or if react / react-native / reanimated / svg / gesture-handler resolve to different paths from lib vs demo. 0.6 apply §2.6 table. 0.7 Lab shell with zero components first. 0.8 `jest-expo` + RNTL, tests in `demo/__tests__/` (or lib `__tests__` run from demo), mock expo-haptics, reanimated jest mock. 0.9 quarantine: `git mv` unverified components to `packages/ui/_legacy/components/` (excluded from tsconfig and barrel), delete the legacy file in the commit that verifies its rewrite; delete 8 kebab alias files; kebab-case final.
Phase 0 exit criteria: doctor green · typecheck 0 errors · web export clean · Lab opens on web+device with empty registry and working light/dark toggle · `npm install` in demo does not recreate `packages/ui/node_modules`.

#### 3.9 Decisions table (§7), with plan defaults
1 design direction: keep neo, isolate in tokens (raw = later token swap). 2 deprecated aliases: drop (did drop: `PointHeight`, `DatePicker onChange` renamed `onValueChange`; see CHANGELOG). 3 distribution: source-only npm vs copy CLI (plan default: npm; reality: CLI + registry built). 4 platforms: Android + iOS + web; web for iteration, device is truth. 5 optional `Text` primitive in Wave 1: default yes (status unknown, not verified in this pass).

#### 3.10 Appendix A triage table (symptom -> check first)
| You see | Check first |
|---|---|
| `Invalid hook call` / `useContext of null` | `npm run doctor` (duplicate React) |
| `Tried to register two views with the same name ...` | doctor (duplicate svg / gesture-handler) |
| Dark mode doesn't apply | provider above component (Modal content ok; separate `createRoot` not)? `userInterfaceStyle` in app.json? two copies of lib/theme? imports via `@apexrn/ui` only |
| Gesture dead in Sheet/Select/DatePicker on Android | `GestureHandlerRootView` inside the Modal |
| Slider "GestureDetector must be used as descendant of GestureHandlerRootView" | app root missing GHRV (consumer setup) |
| Reanimated "Reading from `value` during render" | someone read `sv.value` in render; use `useDerivedValue`/animated style |
| Works on web, red screen on device | New Arch strictness, native-only props, style function/array mistakes; reproduce on device |
| Wrong size after rotate | module-level `StyleSheet.create` using spacing/typography |
| tsc `Property 'children'/'style' does not exist on ...Props` | TS can't resolve react-native from packages/ui; apply paths mapping |
| tsc `TS7016` for `react` | paths order wrong; `@types/*` first |

---

### 4. Audit findings (design/AUDIT.md) and refactor history (design/REFACTOR.md)

#### AUDIT.md (diagnosis only, pre-refactor, 29 components)
- **Verdict**: two problems. (1) It was neo-brutalism, not raw Brutalism (raw = monochrome, no decorative shadows, typography-led, "undesigned"). Decision options: **A** raw brutalism (strip to grays + one ink colour, drop/thin shadow), **B** keep neo and market it honestly, **C** dual theme via tokens. Auditor recommended A or C. (2) Real bugs; plus no packaging.
- **Bugs (§2)**: 2.1 FAB used `Text` without import (crash). 2.2 AlertDialog/DatePicker passed `label=` to Button (prop is `title`) and `variant="destructive"` didn't exist. 2.3 Alert used `colors.light.warning/success` that didn't exist (TS error; inline hex fallbacks in alert/badge/toast). 2.4 InputOTP double `.value` bug + hooks inside loops (Rules of Hooks). 2.5 DropdownMenu measured the wrong element (menu content instead of trigger). 2.6 Select rendered `children` twice. 2.7 Carousel `accessibilityRole="adjustments"` invalid (should be `adjustable`). 2.8 every component hardcoded `colors.light.*`; dark palette never used. 2.9 same ~15-line shadow/border pattern copy-pasted in 17 components. 2.10 dead code / "strict template compliance" comments (generated-by-Antigravity feel). 2.11 inconsistent style-merge API (`cn` = Object.assign vs arrays). 2.12 `metrics.ts` froze dimensions at module load. 2.13 no warning/success tokens. 2.14 no theme provider/context.
- **Packaging gaps (§3)**: no package.json/index barrel/tsconfig/build; no shadcn-style CLI/registry (distribution decision needed); no tests; leftover `components/test.tsx`; inconsistent naming (`Input.tsx` capitalised, snake/mashed names) -> choose kebab-case.
- **Suggested fix order (§4)**: decide §1 -> fix crash bugs -> shared primitives (BrutalSurface, theme, semantic colours) -> style-merge + metrics -> dead code -> package.

#### REFACTOR.md (history / handoff; all items marked done)
Steps 1-5 DONE: (1) 6 crash/logic bugs fixed (FAB import, label->title + destructive variant, warning/success tokens, OTPBlock extraction, dropdown measurement, select double-mount); (2) `usePressPhysics` hook + `BrutalSurface` primitive, migrated Button, Card, Checkbox, FAB, Switch, Badge, Avatar, Input, Dialog, Toast, Progress, Slider, Tabs, InputOTP; (3) `ApexRNProvider` + `useTheme()` in `lib/theme.tsx`, wired through all 29 components and demo ThemeContext; (4) "real-brutalism token pass" = standardised `ColorScheme` + high-contrast light/dark semantic tokens (NOTE: this kept the neo palette; it did not do AUDIT option A); (5) package.json/tsconfig/index barrel, kebab-case aliases, 0 tsc errors.
Step 6 production hardening DONE (commit 2de01e1 message): strict tsc 0 errors in lib+demo, web export 861 modules, `@apexrn/ui` resolved via exports map. Fixes: tsconfig bundler resolution, `UsePressPhysicsOptions`, typed `cn` (no any), memoised theme + toggle-from-system fix, lazy window metrics + font-scale-aware `normalize`, dark shadow token `#000 -> #FFF` (only visual change), BrutalSurface rewrite (forwards a11y/testID, animated styles, Android elevation); many per-component fixes (asChild chaining in Dialog/Dropdown, ref-free dropdown measuring, Select/DatePicker slot splitting + scrolling, UTC->local date bug + `formatLocalDate`, NaN guards in Slider/Progress, stuck focus in Input/OTP, OTP autofill, marquee/skeleton perf, carousel snap, switch travel math); packaging (`exports` map, `files`, versioned peers incl. worklets/expo-modules-core, `file:../packages/ui` link, declared react-native-svg); demo (safe-area shell, back button, keyboardShouldPersistTaps, themed screens). Kept deprecated aliases (PressPhysicsConfig, PointHeight, label-only Badge) which the plan later decided to drop.
REFACTOR.md does NOT cover the 2026-09-29 rewrite pass, registry/CLI work, or the 5 new components; the plan (apexrn-modify.md) and shipping.md supersede it.

---

### 5. Shipping / release plan (shipping.md, docs/releasing.md, CHANGELOG.md)

Goal: ship like shadcn (CLI copies source, static registry); npm package optional. Verdict (releasing.md, 2026-09-30): **"ready to test for release, not ready to ship."** Ship-prep update line: phases 2 (renames), 4 (registry), 5 (CLI, tested locally) and the docs/licence files of 7 done. Scope as of 2026-09-29: 36 components (31 reworked + AppBar, Drawer, BottomNav, SearchBar, Chip) plus `lib/icons`; "tested by hand in Expo Go (OS not recorded)", new variants checked on web, Android + iOS not both verified.

| Phase | Item | State |
|---|---|---|
| 0 Commit | commit 5 new components + icons + demos; commit 31-component rework | DONE (git history confirms commits; releasing.md still says "Nothing is committed", stale) |
| 0 | update plan tracker §5.4 for new components | TODO |
| 1 Device verification (BLOCKS EVERYTHING) | run demo on real Android + real iOS; Drawer (swipe-close both sides, scrim, hardware back, GHRV in Modal, insets), AppBar (topInset, hit targets, truncation), BottomNav (bottomInset, block, badges, disabled), SearchBar (keyboard, clear, Cancel, search key), Chip (toggle, removable, disabled); re-check Sheet, Slider, Carousel snapping, Toast top offset, Dropdown on Android; screen reader pass (TalkBack+VoiceOver); reduced-motion; dark mode for 5 new components; largest font scale; record per-component verified/not in tracker | ALL TODO |
| 2 Leftovers | filename case `Input.tsx` -> `input.tsx` | DONE (checked: git tracks `input.tsx`) |
| 2 | kebab-case everywhere (`brutal-surface`, `radio-group`, `use-press-physics`...) | DONE |
| 2 | migrate 5 combined demo screens off hardcoded colours and `@ui/*`, remove alias | DONE per shipping.md (carousel swatch colours stay as demo content); CLAUDE.md still describes `@ui/*` as transitional - verify |
| 2 | `Card` child text tint -> `CardText` reads variant foreground from context | DONE |
| 2 | plan 0.6 Expo drift + 0.9 `_legacy` quarantine | TODO ([checked] no `_legacy` dir exists in repo) |
| 2 | correct `apexrn-docs.md` overclaims (base for docs site) | TODO |
| 2 | optional: collapsing large title AppBar; Drawer edge swipe | TODO |
| 3 Tests/gates | Jest + RNTL in `demo/` (never packages/ui); smoke per component | TODO (no component unit tests) |
| 3 | CI workflow `.github/workflows/ci.yml` (jobs: `demo` = doctor/typecheck/web export; `registry-and-cli` = contrast, registry build, CLI tests) | WRITTEN, never run on GitHub |
| 3 | lint config (none; rely on noUnused or add) | TODO |
| 3 | Linux CI to catch filename-case regressions | configured, not run |
| 4 Registry | schema (`name`,`type` component/lib/theme,`files[]`,`registryDependencies[]`,`peerDependencies[]`,`description`), dependency mapping, build script (`registry/build.mjs` -> `registry.json` + `<name>.json`; deps derived from real imports; fails on unresolved import, missing description, duplicate export name; output identical on Win/Linux), `theme` item (colors.ts), isolated-install verification (`add --all` into scratch app typechecks) | DONE (42 items) |
| 4 | host registry (workflow `registry.yml` manual-only, publish-registry; default URL `https://blackmonk892.github.io/apexrn` returns 404 until Pages enabled; `DEFAULT_REGISTRY` in `packages/cli/src/registry.mjs`) | TODO |
| 5 CLI | zero-dep Node package `packages/cli` (`bin/apexrn.mjs`): `init` (detect Expo, write `apexrn.json`, copy theme/tokens/lib/brutal-surface, `expo install` peers, reminders for ApexRNProvider + GHRV), `add` (recursive registryDependencies, rewrite imports, skip/overwrite, never overwrites shared files as a side effect, generates `components/apexrn/index.ts` barrel unless you edited it), `diff`, `--overwrite`, `list`, pkg-manager handling; 18 `node:test` tests against fake Expo-shaped projects | DONE (`"private": true` still set) |
| 5 | E2E against fresh `npx create-expo-app` on Windows/macOS/Linux | TODO (most likely to surface surprises) |
| 6 Docs/examples | `docs/components.md` per-component snippets (29 snippets typechecked against real components) | DONE-ish; |
| 6 | docs site, getting-started guide, example app, screenshots/GIFs, document GHRV/ApexRNProvider/safe-area insets, customisation docs | TODO in shipping.md; website/ Next.js site now being built (see website.md; commits "docs website is pure gold", landing page "a mess") |
| 7 Release | LICENSE (MIT), README, CONTRIBUTING, CHANGELOG | DONE |
| 7 | tag `v0.1.0` when ship gate passes; decide on npm publish of `@apexrn/ui` (needs explicit go-ahead); publish CLI (remove `private:true`, check name `apexrn` free, `npm pack --dry-run` ships only bin/, src/, package.json); deploy registry (enable Pages Source: GitHub Actions); smoke `npx apexrn init && npx apexrn add button` from clean machine; announce | ALL TODO, nothing published |
| 8 Backlog | Popover/Tooltip, Segmented, Empty state, Stepper, Number input, Time picker, Rating, Toggle group; Screen/Stack/Row helpers; pull-to-refresh, collapsing AppBar, Drawer edge-swipe; raw-brutalist theme preset; issue templates | post-launch |

**Release steps (releasing.md)**: 1 commit in reviewable splits (renames / registry+CLI / DX+contrast+docs); 2 test CLI on real Expo app (`npx create-expo-app@latest test-app`; `node ../apexrn/packages/cli/bin/apexrn.mjs init --registry ../apexrn/registry/public`; `... add button card dialog toaster`; run `node registry/build.mjs` first); 3 push branch + PR, both CI jobs green; 4 device verification (shipping Phase 1); 5 publish only when decided (registry Pages, CLI npm, changelog Unreleased -> 0.1.0 + `git tag v0.1.0`, clean-machine smoke test). Publishing is not cleanly undoable.

**Ship gate for v0.1.0 (all must be true)**: every shipped component VERIFIED on Android and iOS with honest tracker; CI green on Linux; `npx apexrn init` + `add` works on fresh Expo app on Win/macOS/Linux; docs cover install, theming, every component (docs/components.md done); LICENSE/README/CHANGELOG present (done). Currently only the last two bullets are satisfied.

**Verified (releasing.md "Done")**: typecheck + web export + doctor green for 36 components; registry builds (42 items); CLI 18 tests; `add --all` into scratch app typechecks; docs snippets typecheck; `npm run tokens:check` 4.5:1 for all pairs both themes; release files present; Badge/Button/Toast new variants checked in headless Chrome (web only).
**Not blocking but known**: no component unit tests; text on `primary` now black in both themes (was white at 3.2:1 light / 2.8:1 dark; edit `primaryForeground` to revert, `tokens:check` will fail by design); `Sheet` is controlled-only (its Modal owns children, no place for a trigger).

**CHANGELOG [Unreleased] 0.1.0 highlights**: CLI + registry builder; 36 components; theme + tokens; DX: `<Button>Save</Button>` children label (title still works), `Toaster` + `useToast()` (`toast`, `.success/.error/.warning`, queued one at a time), Toast success/warning variants, Badge destructive/success/warning, named exports everywhere + generated barrel, docs/components.md, check-contrast. Breaking pre-release: `DatePicker onChange -> onValueChange`; `Sheet` no `PointHeight` (use `sheetHeight`); contrast token changes (primaryForeground black; dark destructiveForeground black; dark secondary `#4D5FF5`; light mutedForeground `#6B6B6B`). Fixed: registry CRLF normalisation; `Card` text tint via `CardText` (throws outside Card). Changed: all files kebab-case incl. `input.tsx`. Known gaps: iOS + screen readers unverified; no component unit tests.

---

### 6. Open decisions and contradictions (with citations)

#### Open decisions
1. **Neo vs raw brutalist palette**: AUDIT.md §1 (options A/B/C, recommends A or C); apexrn-modify.md §3 note + §7 #1 (default: keep neo, isolate in tokens); REFACTOR.md Step 4 titled "real-brutalism token pass" but kept neo; CLAUDE.md "open; default current neo look"; shipping.md Phase 4 (`theme` item "including neo vs raw palette choice") and Phase 8 (optional raw preset); README Roadmap ("Raw-brutalist theme preset"). Status: still undecided, neo shipped.
2. **Distribution**: apexrn-modify.md §7 #3 default = source-only npm, CLI out of scope; AUDIT.md §3 says decide; reality = CLI + registry primary (shipping.md header, README Installation); npm publish of `@apexrn/ui` still undecided (shipping.md Phase 7). apexrn-docs.md §4.1 still says `npm install apexrn`.
3. **Registry host + domain**: website.md §3 "Domain: Open, choose before publishing the CLI"; releasing.md default `https://blackmonk892.github.io/apexrn` 404 until Pages enabled; Lab under `/lab/` vs subdomain open (website.md §10 Phase 0).
4. **Lint**: shipping.md Phase 3 (add config or rely on noUnused*).
5. **`Text` primitive** (plan §7 #5) and **Sheet controlled-only** (releasing.md; conflicts with plan §3.3 "every stateful component supports both").
6. Platform scope (plan §7 #4): Android + iOS + web; web = iteration only.

#### Contradictions and stale claims
- **"completely tested on expo go" vs WIP tracker**: commit `bb8df90` message says "completely tested on expo go its awesome and works well ... will run a check for the cross platform compatibility and then i can ship it". But apexrn-modify.md §5.4 has every component WIP (none VERIFIED) with device unverified; shipping.md header says "tested by hand in Expo Go (OS not recorded)... Android + iOS are not both verified"; commit `67fc647` message says "Not verified / not done: Android, iOS, screen readers, reduced motion and large-font passes; component unit tests; CI has not run; nothing published". README Status says "Components are verified in Expo Go". Treat as: user hand-tested in Expo Go (one platform, undocumented, no checklist); by the plan's Definition of Done nothing is VERIFIED.
- **Tracker staleness**: §5.4 never updated for AppBar/Drawer/BottomNav/SearchBar/Chip/Toaster (shipping.md Phase 0 open item); lists Wave 0 items 0.6-0.9 as TODO yet shipping.md Phase 2 marks kebab rename and demo-screen migration done (these were plan items 0.9/alias removal in spirit).
- **`@ui/*` alias**: tracker 0.1 says kept transitional; shipping.md Phase 2 says old screens migrated and alias removal listed as done; CLAUDE.md rules 3-4 still describe `@ui/*` as present. Verify in `demo/metro.config.js` before relying on it.
- **docs/releasing.md "Nothing is committed"** (item 1, and step 1 "Commit") vs git log: d72e4cc "feat: shadcn-style registry + CLI, kebab-case rename, release docs", 998c09b, etc. are committed. Stale text. shipping.md Phase 0 boxes are ticked.
- **Component counts**: apexrn-docs.md says 30 components, 29 in AUDIT, 31 reworked, README/CHANGELOG/releasing 36, registry 42 items (components + lib + theme items).
- **apexrn-docs.md overclaims** (cited by apexrn-modify.md §2.7): (a) "live getters rotation-safe" for `spacing`/`typography`, but 24 component files read them inside module-level `StyleSheet.create` (and Button in a module-level `SIZES` map) so they were frozen at import; (b) §13/§17 present demo as integration testbed exercising every feature but it used deep imports (not `@apexrn/ui`) and had no error isolation; (c) "Validation" is only tsc + export, no runtime checks, no tests. Additional stale content in apexrn-docs.md (verified against current repo): v1.0.0 label, `npm install apexrn`, "no shadcn-style registry/CLI" (§18, now exists), `file:../packages/ui` link (forbidden by CLAUDE.md rule 2), snake_case + 8 re-export alias files (§2, §12; gone), `expo-modules-core` peer (to be dropped), "30 components", `Button title` as the API (children now supported), `PointHeight`/`onChange` deprecated APIs (removed), `pointerEvents` etc. Shipping.md Phase 2 lists "Correct apexrn-docs.md" as TODO.
- **apexrn-modify.md §0-§2 reflect pre-rewrite state** ("I deleted node_modules", "tsc fails with 206 errors", Phase 0 "to be done") while the tracker says those are DONE; read §5.4 for current state.
- **REFACTOR.md Step 6** says `file:../packages/ui` linked in demo (the thing apexrn-modify.md §2.1 identified as root cause and CLAUDE.md rule 2 forbids). REFACTOR.md Step 4 "real-brutalism" name vs neo reality.
- **Dark mode on device**: commit f2ac692 (message is a long explanation) states demo `app.json` had `"userInterfaceStyle":"light"` pinning OS scheme to light so `defaultMode="system"` never saw dark; fixed. Plan §2.6/0.6 still lists Expo config drift TODO (other drift items `newArchEnabled`, `splash`, `edgeToEdgeEnabled`, `expo-modules-core`, svg version, AGENTS.md may or may not be fixed; not verified in this pass).
- **Plan vs reality on Lab**: plan §4 Lab (src/lab, per-component specimens, status chips, ErrorBoundary) is not built [checked]; actual demo = per-component `*Screen.tsx` + `playground/registry.tsx`; website.md plans an "embed mode" for it.
- **README.md** has stray non-product lines (a pasted "https://www.ilovemd.online/pdf-to-md (imp design)" note, a malformed `width="220 alt=` img tag, stray `</td>`), and marketing claims "Works with Expo and bare React Native" / "Expo, Expo Router, React Native CLI, Android, iOS" while the CLI and tests target Expo only (SDK 57) and Android+iOS are unverified.

#### Other known leftovers (memory + checked)
- `_legacy` quarantine (0.9) not done [checked: no `_legacy` in git]; Jest smoke tests not built; CI never run; nothing published to npm or Pages; web verification scripts (headless Chrome over CDP) not stored in repo (see memory web-verification-recipe); git casing issue for `Input.tsx` is FIXED (git tracks `packages/ui/components/input.tsx`) despite being in older memory notes.
- Git status at session start: many `brag-output-2026-10-02-230903/*` files deleted in the working tree (unrelated launch-video artefacts; commit 8265c48 "video - via brag").
- Latest history intent: website work (Next.js `website/`, `preview/` runtime). Commit d113d35: landing page button issue; the preview currently uses `demo` and the user wants it to use the `preview/` folder instead ("will change later").

#### Git history (`git log --oneline -30`, newest first, condensed)
8265c48 video via brag · d113d35 landing page modified (button issue; preview should use `preview/` not `demo`) · 958dfcc further website dev · a230fa0 started website ("landing page is a mess but the docs website is pure gold") · 33ee435 website + preview folders added to monorepo · 1e625fb all instructions for the website build · f2ac692 fix `userInterfaceStyle` light -> dark mode never reached system scheme · 598fe91 added website plan · 998c09b fixed bugs in alert component + wrote shipping docs · 67fc647 honest "not verified" list (Android, iOS, screen readers, reduced motion, large-font, unit tests, CI, nothing published) · d72e4cc shadcn-style registry + CLI, kebab-case rename, release docs · bb8df90 "completely tested on expo go... wrote the todo's in shipping.md" · 4569884 refactored everything · 8e0866d export fix · 1467384 installed skills · 8a4d785 comprehensive component docs (apexrn-docs.md) · 2de01e1 production hardening (long summary) · f20d31d "complete production-grade overhaul" · d386dac refactored lib, removed bugs, updated Expo to SDK 57 · e7d8a84..057e210 README work · 0f91b4a "ui works... errors in sheet and complex components, dark theme needs improvement" · 199f259 showcase screens · f20e587 made brutalist components · 1a678b8 · a7fefb4 responsive typography/sizes.
Note: the 2026-09-29 "rewrite 31 components" is not a single commit; it landed across 4569884/bb8df90/d72e4cc.

---

### 7. Doc map

| File | Purpose | Current? |
|---|---|---|
| `CLAUDE.md` | Project brief, hard rules, conventions, design workflow, loop, commands, triage. Auto-loaded by Claude Code | Current (minor: still mentions `@ui/*` as transitional) |
| `apexrn-modify.md` | Master plan: diagnosis §2, spec §3, Lab §4, loop + DoD + tracker §5, Wave 0 §6, decisions §7, triage App. A | Partly stale: §0-§2, §6 written before Phase 0 was done; §5.4 tracker is the live part but not updated for 5 newer components; Lab (§4) unbuilt |
| `apexrn-docs.md` | Pre-rewrite full library docs (v1.0.0, 30 components) | **Stale / overclaims** (see §6); do not trust for API, install, or file layout |
| `docs/components.md` | Copy-paste usage per component (29 snippets typechecked), rules, setup | Current; best API reference; base for website docs |
| `design/AUDIT.md` | Original diagnosis of 29 components (bugs, neo vs raw, packaging) | Historical; bugs fixed, but §1 decision still open |
| `design/REFACTOR.md` | Refactor step log (Steps 1-6 done) | Historical; superseded by apexrn-modify.md and shipping.md; mentions forbidden `file:` link |
| `shipping.md` | Phased release TODO + ship gate | Current (living checklist); Phase 0 tracker box and Phase 1 device checks open |
| `docs/releasing.md` | Release readiness summary and exact release steps (dated 2026-09-30) | Mostly current; "Nothing is committed" is stale |
| `CHANGELOG.md` | Keep-a-Changelog, [Unreleased] 0.1.0 | Current |
| `CONTRIBUTING.md` | Setup, add-a-component flow, PR checks, CLI/registry notes | Current |
| `README.md` | Public overview, install via CLI, usage, theming, status, roadmap | Mostly current; stray note + malformed tags; broad platform claims |
| `prompt.md` | Generic long prompt ("lead design-system engineer") that kicked off the component-by-component brutalist refactor | Historical input prompt, not a spec; superseded by CLAUDE.md + plan |
| `website.md` | Website plan (goals, decisions: Next.js static export, iframe of Lab web export in phone frame, registry hosting, phases, risks, DoD) written 2026-09-30 | Current plan; website partly built (other section) |
| `website_prompts/instructions.md`, `prompt1..9.md` | Persistent instructions + sequential prompts for building the website | Current for website work |
| `website/CLAUDE.md`, `website/AGENTS.md`, `website/README.md`, `website/bugs.md` | Website-local agent instructions / bug list | Website section (not reviewed here) |
| `demo/AGENTS.md` | Expo agent note with version-pinned docs link (v54) | Stale vs SDK 57; CLAUDE.md says do not trust |
| Memory `MEMORY.md` -> `refactor-status-2026-09.md`, `web-verification-recipe.md` | Cross-session notes (31 components reworked, web-only, leftovers; headless-Chrome CDP verification recipe) | Mostly current; its "Input.tsx casing", "Card tint", "old demo screens" leftovers are since FIXED per shipping.md Phase 2 |

---

# Part B: Code map

## Code map: library, CLI, registry, demo app structure

Snapshot 2026-10-31, branch `main`. Read-only investigation. All facts below were read from the repo; "not verified" is stated where it applies.

### 1. Directory tree (tracked files only; website/, preview/, brag-output-*, docs/ omitted)

```
apexrn/
├── CLAUDE.md, apexrn-modify.md, apexrn-docs.md, design/   # rules + plan (other sections cover these)
├── README.md CHANGELOG.md CONTRIBUTING.md LICENSE prompt.md shipping.md website.md website_prompts/  # root docs, not library code
├── package.json            # private monorepo root, NO workspaces; scripts: registry:build, cli:test, tokens:check
├── .claude/skills/         # vendored frontend-design + ui-ux-pro-max (offline)
├── packages/
│   ├── ui/                 # @apexrn/ui, SOURCE ONLY (no node_modules / lockfile; .npmrc + .gitignore guard it)
│   │   ├── index.ts        # barrel: theme, tokens, metrics, usePressPhysics, cn, 8 icons, `export * from './components'`
│   │   ├── package.json    # main: index.ts, private, v1.0.0, peerDependencies only (no `exports` map, no deps)
│   │   ├── tsconfig.json   # just `extends ../../demo/tsconfig.json`
│   │   ├── lib/            # colors.ts theme.tsx metrics.ts utils.ts use-press-physics.ts icons.tsx  (6 files)
│   │   └── components/     # 36 kebab-case .tsx + index.ts barrel (all lowercase in git: no casing mismatches)
│   └── cli/                # `apexrn` CLI, zero deps, node >=18, ESM
│       ├── bin/apexrn.mjs  # 7-line shim -> src/cli.mjs main()
│       ├── src/cli.mjs     # parseArgs, init/add/diff/list, barrel writer, peer install
│       ├── src/registry.mjs  # reads index.json / r/<name>.json from URL or local dir; closure resolver; path validation
│       ├── src/project.mjs   # apexrn.json read/write, package.json read, default dirs
│       ├── src/files.mjs     # destFor, rewriteImports (../lib -> libDir), LCS diffLines
│       ├── test/cli.test.mjs # 13 node:test cases (see §6)
│       └── package.json    # name apexrn, v0.1.0, private: true, bin
├── registry/
│   ├── build.mjs           # packages/ui -> registry/public/{index.json, r/*.json}  (public/ is gitignored)
│   ├── meta.json           # descriptions for all 42 items + impliedDependencies + themeItems
│   └── check-contrast.mjs  # WCAG 4.5:1 for 9 fg/bg token pairs x light/dark, parses colors.ts by regex
└── demo/                   # Expo SDK 57 app; ALL deps live here (322 top-level node_modules)
    ├── index.ts            # registerRootComponent(App)
    ├── App.tsx             # GestureHandlerRootView > SafeAreaProvider > ThemeProvider > AppShell (state router, 48 routes)
    ├── metro.config.js babel.config.js tsconfig.json app.json package.json
    ├── scripts/doctor.js   # duplicate-dependency guard
    ├── AGENTS.md CLAUDE.md .claude/settings.json   # demo-local agent docs (CLAUDE.md warns AGENTS.md docs link is unreliable)
    ├── dist/               # local web export, gitignored
    └── src/
        ├── context/ThemeContext.tsx   # thin wrapper: ApexRNProvider(defaultMode from URL hash) + useShowcaseTheme()
        ├── components/Layout.tsx      # screen chrome (SafeAreaView, header, BACK chip, theme toggle, embed mode)
        ├── components/Section.tsx     # titled block used by 35 screens
        ├── playground/registry.tsx    # 8 renderers for the website's live playground
        └── screens/                   # 48 files, ~3.2k lines total (see §7)
```

Name-wise there is no `demo/src/lab/`, no navigation library, no lazy loading, no ErrorBoundary: the "Component Lab" described in CLAUDE.md / plan does not exist as such; the demo is a flat `switch` router of per-component "states matrix" screens.

### 2. packages/ui: public surface

#### 2.1 `index.ts` exports
- Theme: `ApexRNProvider`, `useTheme`, types `ThemeMode`, `ThemeContextType`.
- Tokens (from `lib/colors`): `colors, spacing, typography, borderWidths, shadowOffset, touchTarget, controlHeight, opacity, motion`, type `ColorScheme`.
- Metrics: `scale, verticalScale, moderateScale, normalize, screenWidth, screenHeight`.
- `usePressPhysics` + types `UsePressPhysicsOptions`, deprecated alias `PressPhysicsConfig`.
- `cn`.
- Icons: `MenuIcon BackIcon CloseIcon SearchIcon CheckIcon HomeIcon BellIcon UserIcon`, `IconProps` (react-native-svg, `lib/icons.tsx`).
- `export * from './components'` -> every component (all named; most also keep `export default`, barrel re-exports defaults as named via `default as X`).

#### 2.2 Component inventory (36 files)
Legend: C = controlled/uncontrolled pair present. "reg-deps" = other registry items imported (derived from real imports by build.mjs; `colors`,`theme`,`utils` omitted unless notable). Every component imports `../lib/colors` and `../lib/theme` except where noted.

| file | exports | sub-parts | key props (variants/sizes/control) | deps (components / lib / npm) |
|---|---|---|---|---|
| brutal-surface | BrutalSurface (+default) | none | THE primitive. `offset`=4, `borderWidth` 'standard'/'heavy'(default)/'extraHeavy', `pressable`, `hasShadow`, `haptics`, `disabled`, `backgroundColor/borderColor/shadowColor` (theme fallbacks), `borderRadius`=0, `style` (outer), `surfaceStyle`, `shadowStyle`; extends PressableProps minus style/children | lib: use-press-physics, theme; reanimated |
| button | Button | none | `variant` default/primary/outline/destructive; `size` sm/md/lg (controlHeight 40/48/56); `title` or children, `loading`, `icon`+`iconPosition`, `disabled`; variants/sizes are data maps built at render; disabled = muted + dashed border; hitSlop tops up to touchTarget | brutal-surface, utils |
| card | Card, CardHeader, CardFooter, CardText | 3 | `variant` default/primary/accent; pressable if `onPress`; `CardText tone` title/body/muted reads fg from a private context (throws outside Card) | brutal-surface |
| badge | Badge | none | `variant` default/primary/outline/accent/destructive/success/warning; `label` or children; `withShadow` | brutal-surface |
| avatar | Avatar | none | `src` or `initials`; `size` sm/md/lg; `withShadow` | brutal-surface; uses `shadowOffset` token |
| alert | Alert | none | `variant` default/destructive/warning/success; `title` (required), `description`, `icon` | brutal-surface |
| toast | Toast | none | CONTROLLED only: `visible`, `title`, `description`, `variant` default/primary/destructive/success/warning, `duration`, `onDismiss`; reanimated, reduced-motion aware | brutal-surface |
| toaster | Toaster, useToast, types ToastApi/ToastOptions/ToasterProps | provider + hook | `<Toaster topInset>`; `useToast()` returns callable `toast(title, desc?)` with `.success/.error/.warning`; queues one at a time; throws outside Toaster | toast |
| label | Label | none | `disabled`, children, extends TextProps | utils |
| input | Input | none | extends TextInputProps; `leadingIcon`, `trailingIcon`, `onTrailingIconPress`, `trailingIconLabel`, `error`, `disabled`, `inputStyle`, `surfaceStyle`; heights from controlHeight; focus animation | brutal-surface, reanimated |
| textarea | Textarea | none | Input wrapper: `error`, `disabled`, `inputStyle`, `surfaceStyle`, multiline | input only |
| input-otp | InputOTP | none | `length`, `value/defaultValue/onChangeText` (NOT onValueChange: deviates from convention), `error`, `disabled`, `blockSize`; per-digit cells, hidden TextInput | brutal-surface, reanimated |
| search-bar | SearchBar | none | `value/defaultValue/onValueChange`, `onSubmit`, `onCancel`, `cancelLabel`, `clearLabel`; extends Input props | input, icons (SearchIcon, CloseIcon) |
| checkbox | Checkbox | none | `checked/defaultChecked/onCheckedChange`, `disabled`, `hitSlop`; svg check path animates | brutal-surface; svg, reanimated |
| switch | Switch | none | `checked/defaultChecked/onCheckedChange`, `disabled` | brutal-surface; reanimated |
| radio-group | RadioGroup, RadioGroupItem | 1 | `value/defaultValue/onValueChange`, `disabled`; item `value`, `hitSlop`; throws outside group | brutal-surface; reanimated |
| slider | Slider | none | `value/defaultValue/onValueChange`, `onSlidingComplete`, `min/max/step`, `disabled`; Gesture.Pan (no Modal, so no own root view) | brutal-surface; gesture-handler, reanimated |
| progress | Progress | none | `value`, `max`, `withShadow`; animated fill (note: uses `theme` + brutal-surface, not `colors` import) | brutal-surface; reanimated |
| skeleton | Skeleton | none | `paused`, style; shimmer/pulse | utils; reanimated |
| separator | Separator | none | `orientation` horizontal/vertical | utils |
| chip | Chip | none | `label`; `selected/defaultSelected/onSelectedChange`; `onPress`; `onRemove`+`removeLabel`; `icon` (node or fn(color)); `disabled` | brutal-surface, icons (CheckIcon, CloseIcon) |
| list-item | ListItem | none | `title`, `description`, `leading`, `trailing`, `disabled`; uses `usePressPhysics` directly (not BrutalSurface) | lib: use-press-physics; reanimated |
| floating-action-button | FAB (file default) | none | `label`, children, `size` (number), `disabled`; uses `shadowOffset` token | brutal-surface |
| marquee | Marquee | none | `text`, `speed`, `divider`, `disabled`; translateX loop | utils; reanimated |
| carousel | Carousel<T> | none | `data`, `renderItem`, `keyExtractor`, `itemWidth`, `gap`, `showIndicators`, `onActiveIndexChange`; `useWindowDimensions` | utils |
| accordion | Accordion, AccordionItem, AccordionTrigger, AccordionContent | 3 | `type` single/multiple; `value/defaultValue/onValueChange` (string or string[]); item `value`; trigger `disabled`; throws outside parent; animated chevron (svg) | utils; svg, reanimated |
| tabs | Tabs, TabsList, TabsTrigger, TabsContent | 3 | `value/defaultValue/onValueChange`; trigger `value`,`disabled`; content `keepMounted`; sliding indicator via `registerLayout` | brutal-surface, utils; reanimated |
| bottom-nav | BottomNav, BottomNavItem | 1 | `value/defaultValue/onValueChange`, `bottomInset`; item `value,label,icon(node|fn),badge,disabled`; sliding block | utils; reanimated |
| app-bar | AppBar, AppBarAction | 1 | `title,subtitle,onBack,backLabel,leading,trailing`; `variant` default/primary/accent/inverse; `size` compact/large; `topInset`; action `icon,label,onPress,active,disabled` | brutal-surface, icons (BackIcon) |
| dialog | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter | 6 | `open/defaultOpen/onOpenChange`; trigger `asChild`; content `onInteractOutside`; RN Modal, `onRequestClose`, `accessibilityViewIsModal` | brutal-surface; reanimated |
| alert-dialog | AlertDialog (+default) | wraps Dialog parts | NOT compound: `open/defaultOpen/onOpenChange`, `title`, `description`, `cancelText`, `actionText`, `destructive`, `onCancel`, `onAction`, children (trigger, `asChild`) | dialog, button |
| sheet | Sheet, SheetContent | 1 | CONTROLLED only: `open`, `onOpenChange`; children may be fn({open, handleDismiss}); content `sheetHeight` (capped 90% window); drag-to-dismiss; own GestureHandlerRootView inside Modal | gesture-handler, reanimated |
| drawer | Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerItem | 4 | `open/defaultOpen/onOpenChange`; content `side` left/right, `width`, `topInset`, `bottomInset`, `swipeToClose`, `dismissLabel`; item `label,icon,badge,active,closeOnPress`; own GestureHandlerRootView in Modal | badge; gesture-handler, reanimated |
| dropdown-menu | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem | 3 | `open/defaultOpen/onOpenChange`; trigger `asChild`; item `label,description,leading,trailing`; anchored via measured trigger layout, Modal | brutal-surface, list-item; reanimated |
| select | Select, SelectTrigger, SelectContent, SelectItem | 3 | `value/defaultValue/onValueChange`, `open/defaultOpen/onOpenChange`; trigger `placeholder`; content `sheetHeight`=350; item `label,value` (registers label in context); trigger is a read-only Input | input, list-item, sheet; svg |
| date-picker | DatePicker, DatePickerTrigger, DatePickerContent, `formatLocalDate()` | 2 | `value/defaultValue/onValueChange` (Date), `open/defaultOpen/onOpenChange`; trigger `placeholder`; calendar grid in a Sheet | button, input, sheet |

Totals: 36 component files; registry has 42 items = 36 components + 6 lib (colors, theme, metrics, utils, icons, use-press-physics). Compound components that throw a clear error outside parent: Accordion, BottomNavItem, CardText, DatePicker, Dialog, Drawer, DropdownMenu, RadioGroupItem, Select, Sheet, Tabs(+TabsTrigger), useToast. `asChild` exists only on Dialog/AlertDialog/Drawer/DropdownMenu triggers.

Inter-component coupling (registry closure matters): drawer->badge; dropdown-menu->list-item; select->input,list-item,sheet; date-picker->button,input,sheet; search-bar/textarea->input; alert-dialog->dialog,button; toaster->toast. Everything else touches only lib + brutal-surface.

Modal + gesture rule: Sheet and Drawer include their own `GestureHandlerRootView`; Dialog and DropdownMenu use Modal but have no gestures; Slider is not in a Modal.

Checks that came back clean: no hex/rgb literals in components or lib (only `lib/colors.ts`); no `: any` / `as any`; no `spacing/typography/scale()` inside any module-level `StyleSheet.create` (36 StyleSheet.create blocks, none read size tokens); size reads of window use `useWindowDimensions` (carousel, drawer, dropdown-menu, sheet).

### 3. Tokens / theme reference (`lib/colors.ts`, `lib/theme.tsx`, `lib/metrics.ts`)

#### 3.1 Provider and hook
- `<ApexRNProvider defaultMode?: 'light'|'dark'|'system' = 'system'>`; state is `mode`; resolved scheme from `useColorScheme()` when `system`.
- `useTheme()` returns `{ mode, colorScheme: 'light'|'dark', colors: ColorScheme (active), setMode, toggleTheme, isDark }`. `toggleTheme` flips the effective scheme (works from `system`).
- Outside a provider `useTheme()` does NOT throw; it returns a light-theme fallback with no-op setters (theme.tsx, bottom of file). Components never read `colors.light/dark` directly; they use `useTheme().colors`.
- No ThemeProvider-level persistence, no token override prop: restyle by editing `lib/colors.ts`.

#### 3.2 Color tokens (`ColorScheme`, 19 keys, light / dark)
background `#FFFFFF`/`#1A1A1A`; foreground `#000000`/`#FFFFFF`; primary `#FF5252`/`#FF6B6B` (fg black both); secondary `#3D5AFE`/`#4D5FF5` (fg white); accent `#FFD600`/`#FFEA00` (fg black); muted `#F5F5F5`/`#2A2A2A`; mutedForeground `#6B6B6B`/`#9E9E9E`; destructive `#D32F2F`/`#EF5350` (fg white / black); warning `#F59E0B`/`#FFB300` (fg black); success `#2E7D32`/`#66BB6A` (fg white / black); border `#000000`/`#FFFFFF`; shadow `#000000`/`#FFFFFF`; scrim `#000000` both.
Pairs: `<x>Foreground` for primary, secondary, accent, destructive, warning, success; plus muted/mutedForeground. `registry/check-contrast.mjs` tests 9 pairs (foreground/background, 6 x Foreground/x, mutedForeground on muted and on background) in both themes. NOT checked: border/shadow vs background, scrim.
Look = neo-brutalist (saturated primary/secondary/accent), isolated in this file; raw-brutalist palette question is open in plan.

#### 3.3 Scalar tokens
| token | value | notes |
|---|---|---|
| `spacing` xs/sm/md/lg/xl/2xl/3xl | moderateScale(4/8/12/16/24/32/48) | live getters; re-evaluated on every access |
| `typography` xs..4xl | normalize(12/14/16/18/20/24/32/40) | live getters; honours font scale (cap 1.3x), clamp 1.6x |
| `borderWidths` | standard 2, heavy 3, extraHeavy 4 | static; BrutalSurface prop takes the key |
| `shadowOffset` | subtle 2, standard 4, elevated 6 (width=height) | static objects; BrutalSurface actually takes a plain number `offset` (default 4), so this token is used only by Avatar and FAB |
| `touchTarget` | 48 Android / 44 else | evaluated once at import via Platform.OS |
| `controlHeight` | sm 40, md 48, lg 56 | Button, Input, Drawer item |
| `opacity` | disabled 0.6, subtle 0.75 | |
| `motion` | `spring {damping 15, stiffness 400, mass 0.5}`, `squash 0.03` | used by usePressPhysics |
| scrim | `colors.scrim` (black, both themes) | opacity applied by overlays; no `scrim` opacity token |
No radius token: BrutalSurface `borderRadius` default 0. No `fontWeight`/font-family tokens (heavy type set per component).

#### 3.4 metrics.ts
Baseline 375x812. `screenWidth()/screenHeight()` read `Dimensions.get('window')` lazily; `scale`, `verticalScale`, `moderateScale(size, 0.5)`, `normalize` (font scale aware, `PixelRatio.roundToNearestPixel`).

#### 3.5 BrutalSurface mechanics
Outer `View` (style) -> optional absolutely positioned shadow `Animated.View` (offset by `offset` top/left, margin reserves room: `marginBottom/marginRight = offset`) -> `AnimatedPressable` surface with border + bg. Press physics: surface translates `pressed*offset` X/Y, scale squash (0.97/1.03), shadow moves 40% and fades 15%; spring from `motion.spring`; haptic Light impact on press-in (`expo-haptics`); under `useReducedMotion()` the sink is instant and squash dropped. Non-interactive when `pressable=false` or `disabled`. Press-only props (`onPress` etc.) are not forwarded when non-pressable (`PRESS_ONLY_PROPS`).

#### 3.6 `cn`
`cn(...styles)` -> `StyleSheet.flatten` of non-falsy styles, typed as `StyleProp<ViewStyle> & StyleProp<TextStyle>`. Flattening kills Reanimated animated styles, hence the "use arrays, not cn, for animated styles" rule.

### 4. CLI + registry: how it works

#### 4.1 Build (`node registry/build.mjs`, also `npm run registry:build` at root)
1. Scans `packages/ui/lib/*.{ts,tsx}` and `components/*.{ts,tsx}` except `index.ts`. Item name = file basename; names must be unique across lib+components (Error otherwise).
2. Type: `component` for components; `lib` for lib, except `meta.themeItems = ["colors","theme"]` -> type `theme`.
3. Dependencies derived from real `import`/`export ... from` statements: relative specs (`./x`, `../lib/x`) -> `registryDependencies`; bare specs -> `dependencies` except `react`, `react-native`. `meta.impliedDependencies` adds `react-native-worklets` wherever `react-native-reanimated` appears.
4. Fails if: a relative import matches no item; an item lacks a `meta.descriptions` entry; meta describes a non-existent item; two components export the same symbol name (CLI barrel does `export *`); a lib/theme item depends on a component.
5. Output `registry/public/index.json` (name `apexrn`, version from `packages/cli/package.json` = 0.1.0, items w/o contents, file paths only) and `registry/public/r/<name>.json` (item + file contents, LF-normalised). `registry/public/` is gitignored (currently present locally: 42 items).
Dependency graph facts: `colors -> metrics`; `theme -> colors`; `use-press-physics -> colors`; `brutal-surface -> colors, theme, use-press-physics`; `icons` has only svg.

#### 4.2 CLI (`packages/cli`, `npx apexrn ...`; `private: true`, not published)
- `init [--components-dir --lib-dir --registry --force]`: requires `expo` in package.json (unless --force) and no existing `apexrn.json`; writes `apexrn.json` `{componentsDir, libDir, registry}` (defaults `src/components/apexrn` + `src/lib/apexrn` if `src/` exists, else `components/apexrn`, `lib/apexrn`; registry default `https://blackmonk892.github.io/apexrn`), then runs `add theme` (= theme + colors + metrics) and prints wiring steps (GestureHandlerRootView + ApexRNProvider, add components, edit colors.ts, pass safe-area insets).
- `add <names...> [--all] [--overwrite] [--dry-run] [--no-install]`: `resolveClosure` does DFS over `registryDependencies` (cycle + unknown-name detection with "did you mean"), writes files dependencies-first. Existing files are never overwritten unless `--overwrite` AND the item was named explicitly (dependencies are always kept). `rewriteImports` rewrites only `from '../lib/x'` in component files to the relative path from componentsDir to libDir. Regenerates `<componentsDir>/index.ts` barrel (`export * from './x'`) if absent or starting with the generated header (delete header line to take ownership). Missing npm peers are installed with `npx expo install <pkgs>` (spawnSync, `shell: true` on win32) or just printed with `--dry-run/--no-install`.
- `diff <names...>`: compares local file (CRLF-normalised) with import-rewritten upstream; LCS line diff with 2 lines context; suggests `add --overwrite`.
- `list`: works before init; groups component/theme/lib with `*` for installed.
- Registry transport: `http(s)` URL via `fetch`, or a local directory / `file:` URL (tests, offline). Registry JSON is treated as untrusted: file paths must match `^(components|lib)/[a-z0-9-]+\.tsx?$`.
- Flags: `--cwd`, `--help/-h`, `--version/-v`, `-o` = overwrite.

#### 4.3 Tests (`npm run cli:test` at root = build registry then `node --test`)
`packages/cli/test/cli.test.mjs`, 13 tests: rewriteImports (flat + nested libDir + lib untouched), diffLines, parseArgs, init (config + theme closure; root-level dirs; refuses non-Expo and second run), add (closure + rewrite; barrel; no clobber / --overwrite scope; --dry-run; unknown name suggestion; add before init message), diff (up to date -> differs), custom dirs, list before/after init, path-traversal registry refused. Not run by me (task said read-only; they need registry build which writes registry/public).

#### 4.4 Root `package.json` scripts
`registry:build`, `cli:test`, `tokens:check` (= `node registry/check-contrast.mjs`). No workspaces, no lint, no root typecheck (typecheck lives in demo/).

### 5. Demo wiring: why each odd config exists

| file | setting | why |
|---|---|---|
| `packages/ui` | no node_modules / lockfile / `.npmrc` + `.gitignore` guards | a second install duplicates react/reanimated/svg -> "Invalid hook call", duplicate native view registration, dead themes |
| `demo/metro.config.js` | `watchFolders = [packages/ui]` | Metro must watch the out-of-root library source |
| | `resolver.nodeModulesPaths = [demo/node_modules]` | the lib has no node_modules; bare imports from `packages/ui/**` resolve to demo's single copy |
| | `resolveRequest` maps `@apexrn/ui` -> `packages/ui/index.ts` | `extraNodeModules` cannot map a scoped name subpath; this is the ONLY alias. The `@ui/*` alias mentioned in CLAUDE.md is no longer in this file |
| | `blockList` for `packages/ui/node_modules/**` | if a node_modules reappears there Metro must never see it |
| `demo/tsconfig.json` | extends `expo/tsconfig.base`, strict, `ignoreDeprecations: "6.0"` (TypeScript ~6.0.3) | |
| | `paths`: `@apexrn/ui` -> `../packages/ui/index.ts`; `"*"` -> `["./node_modules/@types/*", "./node_modules/*"]` (@types first) | TS needs a way to resolve `react`, `react-native`, etc. for files that live in `packages/ui`; @types must come first or react resolves to untyped JS |
| | `include` also `../packages/ui/**/*.ts(x)` | typecheck covers library + demo |
| `demo/app.json` | `experiments.tsconfigPaths: false` | otherwise Expo feeds the `"*"` mapping to Metro and `react` resolves to `@types/react` |
| | `experiments.baseUrl: "/lab"` | web export is served under `/lab` (website embeds it as an iframe) |
| | `newArchEnabled: true`, `edgeToEdgeEnabled: true`, `predictiveBackGestureEnabled: false`, `userInterfaceStyle: automatic` | New Arch is the Reanimated 4 target; predictive back off so `BackHandler` / modal `onRequestClose` behave |
| `demo/babel.config.js` | preset only (`babel-preset-expo`) | the preset already injects the worklets plugin; listing it again breaks |
| `demo/scripts/doctor.js` | fails if `packages/ui/node_modules` or `package-lock.json` exist; for react, react-native, reanimated, svg, gesture-handler, worklets compares `require.resolve` from demo vs from `packages/ui/components` (must be null or identical) | cheap guard for hard rule #1 |
| `demo/package.json` | expo ^57, react 19.2.3, react-native 0.86.3, reanimated 4.5.1, worklets 0.10.1, gesture-handler ~2.32, svg ~15.15.5, haptics ~57.0.3, safe-area-context ~5.7, screens ~4.26, react-native-web ^0.21.2, react-dom 19.2.3, typescript ~6.0.3 | peers of the lib; `lucide-react-native ^1.7.0` is listed but unused (see issues) |
| `packages/ui/package.json` | peers: expo-haptics *, react >=18, react-native >=0.73, gesture-handler >=2, reanimated >=3, svg >=13, worklets >=0.2 | declared very loosely vs the real tested stack (Reanimated 4 / RN 0.86 / React 19) |

Runtime structure of the app:
- `index.ts` -> `App` -> `GestureHandlerRootView(flex 1)` -> `SafeAreaProvider` -> `ThemeProvider` (`src/context/ThemeContext.tsx`: `ApexRNProvider` whose `defaultMode` is read from the URL hash's last segment `light|dark` on web, else `system`) -> `AppShell`.
- `AppShell` = `useState` router. `currentScreen` initialised from `location.hash` on web (`#button`, `#button:light`, `#playground:button:dark`); `hashchange` listener on web; `window.postMessage` protocol with the website iframe: child->parent `apexrn:ready`; parent->child `apexrn:theme {mode}` and `apexrn:playgroundProps {component, props}`. Android `BackHandler` returns to `home` from any other screen.
- Routes (switch cases, 48 screens): `home`, `showcase` and `hero` (same screen), aggregate pages `button card forms feedback display overlay navigation`, one page per component: `input checkbox radiogroup switch slider badge progress skeleton alert toast avatar accordion carousel marquee listitem dialog alertdialog sheet dropdown select datepicker tabs separator fab label input_otp textarea appbar drawer bottomnav searchbar chip`, and `playground`. Route ids are NOT the library file names (`radiogroup`, `listitem`, `dropdown`, `fab`, `input_otp`, `appbar`, `bottomnav`, `searchbar`, `datepicker`, `alertdialog`).
- `Layout` = SafeAreaView + header (BACK chip, title, theme toggle) + ScrollView; when `?embed=1` or `?frame=0` is in the URL it drops the header (used by the website iframe). `Section` = title/note wrapper. All chrome colours come from `useTheme()`.
- Playground: `src/playground/registry.tsx` has 8 renderers (button, badge, chip, switch, checkbox, progress, avatar, alert) mirroring `website/src/lib/playground-config.ts` (must be kept in sync by hand). Screens are ~40-100 lines each except Home 123, Showcase 254.
- Imports: all 46 screen files + Layout import the library only via `@apexrn/ui`. There are zero `@ui/*` imports anywhere in demo/src or App.tsx (grep confirmed), so that transitional alias is dead.
- Hard-coded colours in the demo: only `src/screens/DisplayScreen.tsx` (lines 11-13 `#FF5733 #33FF57 #3357FF` carousel swatches; line 66 `#FFF`/`#000` text shadow). Everything else themed.

### 6. Git hygiene
- `git ls-files packages/ui/components`: all 36 + `index.ts` lowercase kebab-case; no uppercase path anywhere under packages/ui; no case-colliding duplicates. No `_legacy` folder exists.
- `git status --short | grep -v brag-output`: EMPTY. No uncommitted code work; the only dirty state is the deleted `brag-output-2026-10-02-230903/` tree (unstaged deletions, as expected).
- `demo/dist` and `registry/public` exist locally and are gitignored; `demo/package-lock.json` is the only lockfile tracked.
- Recent commits are about website/preview/brag video; last library-touching work predates them.

### 7. Sanity checks (run from `demo/`, read-only)
- `npm run doctor` -> `doctor: OK (no duplicate dependency trees)`.
- `npm run typecheck` (`tsc --noEmit`) -> exit clean, no diagnostics (covers packages/ui + demo).
- Not run: expo start/export, `npm run cli:test`, `npm run tokens:check` (not requested / a runtime-crash agent is debugging the demo).
- Web-vs-device: nothing here verifies device behaviour; see issue 1 for a likely device-only failure.

### 8. Concrete issues and smells (file:line)

Likely bugs
1. `demo/src/components/Layout.tsx:17`: `typeof window !== 'undefined' && window.location.search...`. On React Native `window` exists (global) but `window.location` is undefined, so `Layout` (used by every screen) should throw `TypeError: Cannot read property 'search' of undefined` on iOS/Android. Passes on web (why web checks are green). Guard with `Platform.OS === 'web'`. Strong candidate for a device-only crash; NOT reproduced by me (no device run).
2. `demo/src/screens/PlaygroundScreen.tsx:27-28`: `window.addEventListener/removeEventListener` with no Platform guard; web-only route, but it is reachable by `setCurrentScreen('playground')` state on native and would also crash there. Same fix.
3. `demo/src/screens/PlaygroundScreen.tsx` / `App.tsx:80-95`: `window.parent.postMessage(..., '*')` posts to any parent origin; acceptable for embed handshake, but messages from any origin are also accepted (`handleMessage` does not check `e.origin`) at App.tsx ~line 76 and PlaygroundScreen.tsx:22-24.

Spec / convention deviations in the library
4. `packages/ui/components/sheet.tsx:44-57`: `Sheet` is controlled-only (`open` + `onOpenChange` required; no `defaultOpen`, no trigger). Documented in-file, but breaks the "controlled and uncontrolled" rule; Select/DatePicker work around it with their own state.
5. `packages/ui/components/toast.tsx:20-38`: `Toast` is controlled-only (`visible`/`onDismiss`); the uncontrolled path is the Toaster provider.
6. `packages/ui/components/input-otp.tsx:27`: value control is `onChangeText`, not `onValueChange` (rule: value controls use `value/defaultValue/onValueChange`). SearchBar already uses `onValueChange`, so it is inconsistent within the library.
7. `packages/ui/components/alert-dialog.tsx:20-35`: AlertDialog is a prop-driven wrapper (`title`, `description`, `cancelText`, `actionText`), not compound parts; fine as a convenience, but against "composition over configuration".
8. Status-variant coverage is uneven: Button has only `destructive` (button.tsx:19); Badge/Toast have success+warning; Alert has all three; Chip/Card/AppBar have none; Toast and Badge also have `primary`, Card/AppBar `accent`/`inverse`. Rule says status variants are `destructive | success | warning`.
9. `packages/ui/lib/use-press-physics.ts:27` and `packages/ui/index.ts:6`: `PressPhysicsConfig` is a `@deprecated` alias that is still exported from the public barrel (dead code in a library that has no legacy consumers).
10. `packages/ui/lib/use-press-physics.ts` (the `handlePressIn/Out` callbacks): `useCallback` deps list `reduceMotion` but call the inline `animate` closure; works but not exhaustive-deps clean.
11. `packages/ui/lib/theme.tsx` (`useTheme` fallback, end of file): outside a provider it silently returns the light theme. This hides a missing-provider bug (CLAUDE.md triage step 2) and makes dead-theme symptoms (no dark mode) look like a styling bug instead of an error. Compound parts throw clearly; the theme hook does not.
12. `packages/ui/lib/colors.ts`: `shadowOffset` token (objects `{width,height}`) is not what BrutalSurface consumes (a numeric `offset`); Button hard-codes `SHADOW_OFFSET = 4` (button.tsx ~line 55). Two competing sources of truth for shadow depth; only Avatar/FAB use the token.
13. `packages/ui/lib/colors.ts`: `touchTarget` is computed once at import (`Platform.OS`), fine; but `border`/`shadow`/`scrim` pairs are not covered by `check-contrast.mjs` PAIRS (`registry/check-contrast.mjs:12-22`).
14. `packages/ui/components/progress.tsx` imports only `../lib/theme` and BrutalSurface; since it reads no spacing/typography this is fine, but its registry entry does not list `colors` (visible in index: `progress -> brutal-surface, theme`), unlike siblings. No functional impact.
15. Registry/CLI comment drift: `packages/cli/src/cli.mjs` (init, comment before `add(cwd, ['theme'])`) says theme pulls "colors, metrics and utils", but the real closure is theme + colors + metrics (utils is a separate lib item, installed only when some component needs it).
16. `registry/check-contrast.mjs:31`: parses colors.ts with a regex `\b${scheme}: \{([^}]*)\}`; breaks if a token value ever contains `}` or tokens switch to non-`#RRGGBB` (rgba, named, 3-digit hex).
17. `packages/ui/package.json` peers (`react-native-reanimated >=3`, `react-native-worklets >=0.2`, `react >=18`, `react-native >=0.73`) claim far wider support than the stack the library is built/tested on (Reanimated 4.5, RN 0.86, React 19, Expo 57); also `version 1.0.0`/`private` vs CLI `0.1.0`/`private`. `expo-haptics` is required by every pressable via use-press-physics, but is a hard peer with `*`.
18. CLI `DEFAULT_REGISTRY` = `https://blackmonk892.github.io/apexrn` (`packages/cli/src/registry.mjs:10`) and the CLI is `private: true`: `npx apexrn init` cannot work for outsiders until the registry is deployed and the CLI published (not verified whether the Pages site exists).

Demo / docs drift
19. `demo/package.json`: `lucide-react-native ^1.7.0` is a dependency but is imported nowhere in demo/src or App.tsx (grep). Dead dependency; also an extra tree for doctor to ignore. (`react-native-screens` is also unused by app code; it may be a transitive peer.)
20. `CLAUDE.md` (repo root) still describes a `@ui/*` Metro alias and a lazy-loaded, ErrorBoundary-wrapped Component Lab. Reality: only the `@apexrn/ui` alias exists (`demo/metro.config.js:17-22`), no `@ui/*` imports remain, and `App.tsx` eagerly imports all 48 screens with no ErrorBoundary and no Lab structure. `demo/app.json:36` still sets `baseUrl: "/lab"`.
21. `demo/App.tsx:104-105`: `showcase` and `hero` render the same screen (alias); `App.tsx` lines ~100-155 are a 48-case switch with the same `onBack` lambda repeated; adding a screen needs edits in 2 places plus HomeScreen's list. A route map would remove the repetition.
22. `demo/src/playground/registry.tsx`: 8 hand-synced renderers vs `website/src/lib/playground-config.ts`; no compile-time link between them (drift risk).
23. `demo/src/screens/DisplayScreen.tsx:11-13,66`: hex literals (the only ones in the demo); acceptable as arbitrary carousel swatch data but contradicts "colours only from theme" if applied strictly.
24. Route id naming inconsistent (`input_otp` snake case vs `radiogroup`, `listitem`, etc.) and does not match library file names; any website deep link must use the demo's ids.
25. Registry build is not wired into any CI or root `typecheck`; `npm run cli:test` is the only automated check and it does not test any component rendering (no component tests anywhere in the repo).

### 9. Quick commands (all verified to exist)
- From `demo/`: `npm run doctor`, `npm run typecheck`, `npx expo start [--web]`, `npx expo export --platform web`.
- From repo root: `node registry/build.mjs`, `node registry/check-contrast.mjs`, `npm run cli:test`.

---

# Part C: Website, preview runtime, recent work

## Website, preview runtime, and recent work

### 1. What the website is

- `website/` is the official ApexRN site: marketing landing page + shadcn-style docs + a prop playground. It lives in the same monorepo as the library so a component change and its docs ship in one PR.
- Stack: **Next.js 16.3.7** (App Router, `output: 'export'` in `website/next.config.ts` = fully static, no server/API routes), React 19.2.8, Tailwind CSS 4.3 (`@tailwindcss/postcss`), framer-motion 13, lucide-react, clsx. Dev deps: eslint 9, typescript 5, **pagefind** (static search). No react-native / expo / reanimated deps in `website/package.json` (a hard architectural rule).
- Scripts (`website/package.json`): `predev`/`prebuild` = `node scripts/generate-docs.mjs`; `dev` = `next dev`; `build` = `next build`; `postbuild` = `node scripts/build-search-index.mjs` (Pagefind); `start`; `lint` = `eslint`. No `typecheck` script (use `tsc --noEmit`).
- `website/CLAUDE.md` is just `@AGENTS.md`. `website/AGENTS.md` is the auto-generated Next block: "This is NOT the Next.js you know" - read `node_modules/next/dist/docs/` before writing Next code. `website/README.md` is the untouched create-next-app boilerplate (stale/not project-specific).
- Brutalist visual identity on the site itself: CSS vars `--fg --bg --surface --hairline --edge --coral --coral-ink --fg-muted`, utility classes `edge-block`, `edge-block-sm`, `press-block`, `bg-grid`, `font-display`, `font-mono`. Dark theme default; theme toggle via `ThemeContext` which also forwards the theme to iframes.
- Static data pipeline: `website/scripts/generate-docs.mjs` (~560 lines) parses `packages/ui/components/*.tsx` with the TS AST, reads `registry/meta.json`/registry and `docs/components.md`, and emits `website/src/generated/docs-data.json` (keys: generatedAt, registryVersion, groups, components [36], setup, tokens) plus `website/public/docs/components/*` (per-component markdown / llms mirrors) and `website/public/llms.txt`. It self-validates: its `LAB_SCREEN` slug->Lab-route map must match real `case` labels in **`demo/App.tsx`** (scripts/generate-docs.mjs:20 `DEMO_APP = join(ROOT,"demo","App.tsx")`, lines 26-46 and 435-446), and every registry component must be mapped or flagged as having no live preview. `scripts/build-search-index.mjs` runs Pagefind over the build output.

### 2. Route map (all statically prerendered; build reports 56 pages)

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing. Sections in order: `Navbar`, `HeroSection` (headline "Every rounded corner is a decision you didn't make.", copyable `npx apexrn init`, `ContrastDemo`), `ComponentTicker`, `ExploreSection` (tabbed code specimens + `PhoneFrame` iframe, `id="explore"`), `PhilosophySection`, `InstallationSection`, `FinalCTA`, `Footer`. Wrapped in `ThemeProvider`. |
| `/docs` | `src/app/docs/page.tsx` | Docs index; layout `docs/layout.tsx` (sidebar, header, search) |
| `/docs/introduction`, `/docs/installation`, `/docs/theming` | `docs/*/page.tsx` | Prose pages |
| `/docs/components` | `docs/components/page.tsx` | Grouped component index |
| `/docs/components/[component]` | `docs/components/[component]/page.tsx` | One per registry component (36 in docs-data). Static: description, props table, usage code, variants, a11y notes, related, prev/next, TOC, plus iframe `ComponentPreview` |
| `/playground`, `/playground/[component]` | `src/app/playground/*` | Prop-controls + live iframe + generated code tab; only a subset of single-instance components (see `lib/playground-config.ts`) |
| `/sitemap.xml`, `/robots.txt` | `app/sitemap.ts`, `app/robots.ts` | Driven by `NEXT_PUBLIC_SITE_URL` (placeholder fallback, warns at build; **must be set before deploy**) |
| 404 | `app/not-found.tsx` | Themed, self-contained header |

Docs components in `src/components/docs/`: Breadcrumbs, CodeBlock, ComponentPreview, DocsHeader, DocsSidebar, PrevNextNav, PropsTable, RelatedComponents, SearchDialog (Cmd+K), TableOfContents. Playground: PlaygroundClient/Controls/Header/Preview/Sidebar. Lib: `docs-data.ts`, `highlight.tsx`, `playground-codegen.ts`, `playground-config.ts`, `use-dismissable-overlay.ts`, `use-query-state.ts` (query-string state for deep links). Install/CLI commands shown use the copy-paste model (`npx apexrn init/add`, import from `@/components/apexrn`).

### 3. How live previews work NOW (and the gap vs the intended design)

**Current (what the code does): every preview is an `<iframe>` into the `demo/` Lab web export copied to `website/public/lab/`.**

- `website/public/lab/` is **gitignored** (`website/.gitignore:19 /public/lab/`) and there is **no script in `website/` that builds/copies it** (no copy step in `package.json` scripts or `generate-docs.mjs`). It was populated manually from `demo` export output (website.md §4 intended a CI step: `cd demo && npx expo export --platform web` -> copy `demo/dist` to `website/public/lab/`). A copy currently exists locally (`_expo`, `favicon.ico`, `index.html`).
- Three embedders, each building the URL `/lab/index.html?embed=1#<screen>:<theme>` (playground: `#playground:<slug>:<theme>`):
  - `website/src/components/PhoneFrame.tsx:70` (landing `ExploreSection.tsx:160`, `<PhoneFrame screen={active.screen} maxWidth={260} />`; iframe title at :123 "...web build of the demo Lab")
  - `website/src/components/docs/ComponentPreview.tsx:71` (title at :124)
  - `website/src/components/playground/PlaygroundPreview.tsx:70` (title at :134)
- Other "demo" coupling in the website: `website/scripts/generate-docs.mjs:20,26,38-40,439` (reads `demo/App.tsx` switch labels to know which Lab hash routes exist); `website/src/lib/playground-config.ts:8` (comment: every playground entry needs a renderer in `demo/src/playground/registry.tsx`); both docs data and CLAUDE rules (`website_prompts/instructions.md`) literally say "embed the `demo/` Lab".
- postMessage protocol actually in use (parent -> iframe, always `targetOrigin = window.location.origin`): `{type:'apexrn:theme', mode}` (PhoneFrame, ComponentPreview, PlaygroundPreview, ThemeContext), `{type:'apexrn:reducedMotion', value}` (PhoneFrame:55, ComponentPreview:64), `{type:'apexrn:playgroundProps', component, props}` (PlaygroundPreview:63, debounced). Iframe -> parent: `{type:'apexrn:ready'}`. Components show a skeleton ("ApexRN Lab - booting") until ready, lazy-mount via visibility, with a timeout fallback in the playground, plus a "Known limits" note (web render; haptics/native Modal/gestures differ on device).
- Demo side of that protocol: `demo/App.tsx:98` handles `apexrn:theme` and posts `apexrn:ready` (:109); `demo/src/screens/PlaygroundScreen.tsx:23` handles `apexrn:playgroundProps`. **I found no `apexrn:reducedMotion` listener in `demo/`**, so the reduced-motion forwarding that website prompt8 required is sent but appears to be received by nothing (verify before claiming it works).

**Intended design (what the user wants next): the `preview/` workspace.**

- `preview/` is a *dedicated, iframe-embeddable runtime* ("Not the demo app", per its `package.json` description). It is its own Expo SDK 57 web app (expo ^57, RN 0.86.3, react 19.2.3, reanimated 4.5.1, worklets 0.10.1, gesture-handler ~2.32, svg ~15.15, react-native-web ^0.21.2, safe-area-context, haptics; TS ~6.0.3). Scripts: `start`, `web`, `build:web` (`expo export --platform web`), `typecheck`, `doctor`.
- Files (tracked in git): `App.tsx` (104 lines), `index.ts`, `app.json` (slug apexrn-preview, `experiments.tsconfigPaths:false`, web bundler metro), `babel.config.js`, `metro.config.js`, `tsconfig.json`, `scripts/doctor.js`, `src/{error-boundary.tsx, protocol.ts, registry.ts}`, `package-lock.json`. Untracked/ignored build output: `preview/dist` (root `.gitignore:12 dist/`) containing a built `index.html`/`_expo`/`metadata.json`; `node_modules` is installed in `preview/` (as designed: all deps in the consumer app, none in `packages/ui`).
- `metro.config.js` mirrors demo's wiring: `watchFolders=[../packages/ui]`, `nodeModulesPaths=[preview/node_modules]`, `resolveRequest` alias `@apexrn/ui -> ../packages/ui/index.ts`, blockList for any `packages/ui/node_modules`. `scripts/doctor.js` is a copy of the demo doctor (fails if packages/ui has node_modules/lockfile or if core packages resolve to different copies).
- Behaviour: it renders **one named `@apexrn/ui` export** on demand, instead of the Lab's navigation shell. `App.tsx` wraps in `GestureHandlerRootView > SafeAreaProvider > ApexRNProvider(defaultMode=theme)`, `PreviewErrorBoundary`, transparent background in embed mode (`?embed=1`). Accepts either URL params (`?component=Button&theme=dark`, standalone-testable) or a parent `postMessage`. `registry.ts` `resolveComponent(name)` does `ApexUI[name]` and accepts plain function components or objects with `$$typeof` (forwardRef/memo, e.g. Input, Textarea, InputOTP); hooks/tokens/types not resolvable. Unknown name throws -> error boundary.
- **Protocol in `preview/src/protocol.ts` (different from what the website sends):** parent->preview `{type:'apexrn:render', component, props?, theme?:'light'|'dark'|'system'}`; preview->parent `apexrn:ready`, `apexrn:resize {height}` (parent can size the iframe from the root `onLayout`), `apexrn:error {message}`. Optional `EXPO_PUBLIC_PARENT_ORIGIN` allowlist at build time, default `'*'`. `isRenderMessage` validates shape. There is **no** `apexrn:theme`, `apexrn:reducedMotion` or `apexrn:playgroundProps` handler in `preview/`, and no multi-part/compound specimens, no hash routing (`#button:dark`), so it cannot be dropped in for the Lab as-is.
- Key differences demo vs preview: demo = full Component Lab app with screens, nav, HomeScreen groups, specimens matrix, hash routes, ShowcaseScreen/PlaygroundScreen; preview = headless "render this component with these props" runtime with typed protocol + resize + error reporting. Preview is what the user wants the website to consume; at the moment **nothing in `website/` references `preview/`** (grep for `preview/` in website src/scripts is empty; the iframe URLs all point at `/lab/index.html`).

**Exact places the website still points at demo instead of preview (to repoint):**

1. `website/src/components/PhoneFrame.tsx:70` iframe `src` `/lab/index.html?embed=1#<screen>:<theme>` (+ title :123, listener :45, reducedMotion :55, theme :67)
2. `website/src/components/docs/ComponentPreview.tsx:71` (+ title :124, ready :49, theme :57, reducedMotion :64)
3. `website/src/components/playground/PlaygroundPreview.tsx:70` (+ title :134, ready :43, theme :55, props :62-63)
4. `website/src/context/ThemeContext.tsx:27` posts `apexrn:theme` to `iframe[data-apexrn-lab]` elements
5. `website/scripts/generate-docs.mjs:20-46,435-446` validates against `demo/App.tsx` `case` labels (`LAB_SCREEN` map); would need to validate against `preview`'s resolvable exports instead
6. `website/src/lib/playground-config.ts:8` (comment/contract: renderer in `demo/src/playground/registry.tsx`; `demo/src/screens/PlaygroundScreen.tsx` is the actual consumer)
7. `website/.gitignore:19` ignores `/public/lab/` and no build step produces it (a `public/preview/` copy step from `preview/dist` is the natural replacement); iframe title strings and the "Known limits" copy say "demo Lab"
8. Docs: `website_prompts/instructions.md`, `prompt2/3/6/9.md`, and `website.md` §4/§6 all prescribe the demo Lab iframe, so they conflict with the new intent and should be updated alongside the code.

### 4. Open bugs and the user's stated pain points

From `website/bugs.md` ("prompt9 production audit, 2026-10-01"):

**Open (2):**
1. **Local `next build` EBUSY on the final `out/` swap** - compile, typecheck and all 56 static pages succeed, but the final rmdir/swap into `out/` fails with `EBUSY: resource busy or locked` (reproduced 3x in bash and PowerShell; suspected Windows Defender `MsMpEng` lock). Never confirmed to complete end-to-end on this machine. Action: run one real build on the deploy runner (Linux) before trusting the static export. (A `website/out/` dir with `_expo`, `index.html` etc. does exist locally, so some earlier export landed.)
2. **No physical-device verification** - everything verified in headless Chromium (desktop + mobile emulation); haptics, native Modal, gestures not tested. Accepted gap, disclosed on every preview.

**Fixed in the audit (5):** missing custom 404 (now `not-found.tsx`); broken `#phone` anchor (id moved to a `display:contents` wrapper in HeroSection); playground code samples imported `@apexrn/ui` instead of `@/components/apexrn`; added `sitemap.ts` + `robots.ts` (needs `NEXT_PUBLIC_SITE_URL`); deleted stale `.eslintignore` and an unused `UI_BARREL` const.

**Verified clean per bugs.md:** all previews are real iframes (no fake HTML); website has no RN deps; deep links reproduce state (theme in query + hash; playground controls mirrored to query and replayed via postMessage); docs generated from source with no drift; unique titles/meta; llms.txt mirrors; mobile nav, Cmd+K search, Esc, focus trap, theme toggle tested; eslint and `tsc --noEmit` clean.

**User's stated pain points (from commit messages, not bugs.md):**
- Commit d113d35 (verbatim intent): "modified the landing page - issue in the button on landing page - have to modify also the current preview stuff - i hate it will have to change also it uses demo i dont want that i want the preview folder to be in use --will change later". The specific landing-page button issue is **not itemised anywhere** (bugs.md doesn't list it; candidates are the hero buttons in `HeroSection.tsx`, e.g. the copy-install control and the "See it running" `#explore` link styled with `press-block`). Treat as unknown/unreproduced.
- Commit a230fa0: "the landing page is a mess but the docs website is pure gold - really good". So docs/playground are the strong part; landing page needs rework (d113d35 already removed `PhoneStorySection`, `ComponentShowcase`, `CodeSection` -> `ExploreSection`, simplified Hero, added `ComponentTicker` and `ContrastDemo`; the original hero-phone-scroll-scale concept from website_prompts was dropped from the landing hero: the phone now appears only in `ExploreSection`).
- Previews should come from `preview/`, not `demo/` (see section 3).

### 5. website_prompts status (folder: `website_prompts/`)

`instructions.md` = persistent rules (decided architecture: Next App Router static export, `website/` workspace with own lockfile, **hybrid iframe of the demo Lab** in `?embed=1` hash-routed mode, postMessage `apexrn:theme/tokens/ready` with origin checks, static HTML for SEO/AEO + per-component `llms.txt` mirrors generated from the same source, static Pagefind search, free static hosting; never invent APIs; repo wins on conflicts; no RN deps in website; don't claim device behavior from web; run typecheck/lint/tests and inspect render after changes). Status "done" below is inferred from code/commit evidence, not from a run.

| Prompt | Asked for | Status (evidence) |
|---|---|---|
| 1 | Foundation: read instructions + website.md, scaffold `website/`, tokens/layout, design-reference HTML = inspiration only | Done (a230fa0: package.json, layout, globals.css, Next 16 scaffold) |
| 2 | Marketing landing page: hero, phone enters/grows during scroll revealing real UI (iframe), component showcase, code section, install, philosophy, CTA | Mostly done but user judged it "a mess"; d113d35 restructured it and dropped the scroll-scaled phone hero (`PhoneFrame` now only in ExploreSection). Needs rework. |
| 3 | Design refinement pass: hierarchy, motion, iframe loading states (no blank flash before `apexrn:ready`), phone sequence polish | Partial: ready-gated fade-in + skeleton implemented in PhoneFrame/ComponentPreview; scroll-phone sequence no longer in hero |
| 4 | Docs experience: routes `/docs`, installation, introduction, theming, components, `[component]`; sidebar from real registry; props, usage, `generateStaticParams` from registry | Done (a230fa0; "pure gold") |
| 5 | Connect docs to real library: authoritative inventory (props, variants, deps, a11y, specimens/hash routes), no invented info, flag components lacking a specimen | Done via `generate-docs.mjs` + `docs-data.json` (36 comps) with self-validation against registry and Lab routes |
| 6 | Interactive playground: live iframe + controls from real API, debounced postMessage, code sync, copy, error/timeout handling | Done (playground routes, `playground-config/codegen`, `PlaygroundScreen` in demo; 958dfcc added query-state sync) |
| 7 | DX pass: static search, keyboard nav, copy, highlighting, active sidebar, breadcrumbs, prev/next, mobile nav, deep links, back/forward | Done (SearchDialog + Pagefind, `use-query-state`, `use-dismissable-overlay`, CodeBlock, Breadcrumbs, PrevNextNav; d113d35 overlay fixes) |
| 8 | Responsive + a11y audit 1440->360px, mobile phone simplification, lazy iframes, reduced-motion forwarded to iframes (`apexrn:reducedMotion`) | Partly: audited in headless Chromium per bugs.md; website sends reducedMotion but no receiver found in demo (and none in preview) |
| 9 | Final production audit: functional, real-component, API, SEO; no redesign | Done -> produced `website/bugs.md` (5 fixed, 2 open) |

### 6. CI (`.github/workflows/`)

- `ci.yml` (on push to main and every PR), Node 22, ubuntu-latest (chosen to catch filename-case bugs). Job `demo`: `npm ci` -> `npm run doctor` -> `npm run typecheck` -> `npx expo export --platform web` (all in `demo/`, npm cache keyed on `demo/package-lock.json`). Job `registry-and-cli`: `node registry/check-contrast.mjs`, `node registry/build.mjs`, `npm test` in `packages/cli`.
- `registry.yml` (`publish-registry`, **manual** `workflow_dispatch` only): `node registry/build.mjs` then uploads `registry/public` to GitHub Pages (requires Pages source = GitHub Actions).
- **Gaps:** no CI job builds or lints `website/` or `preview/`; nothing builds the Lab/preview into `website/public/`; no deploy workflow for the website; website.md's planned `check-no-rn` guard (safety rule 7) was not found in CI. The registry workflow publishes only the registry, not the site.

### 7. Recent-work timeline (git log, newest first; branch main; 5 commits are the site/video era)

| Commit | Date (2026) | Scope |
|---|---|---|
| 8265c48 "video - via brag" | Oct 2 | Added `brag-output-2026-10-02-230903/` (41 files, 4.5k lines): launch video from the /brag skill (`brag.mp4`, `brag.jpg`, `brag-plan.md`, `composition-brief.md`, a Hyperframes `composition/` with index.html, captures PNGs of button/checkbox/chip/progress/switch/showcase matrices, a copy of the Lab web export under `assets/lab/`, music mp3 + cues JSON, sfx ogg, snapshots, `share-copy.txt`). |
| d113d35 (long message above) | Oct 1 17:32 | Landing rework: HeroSection simplified (-150/+), replaced ComponentShowcase/CodeSection/PhoneStorySection with ComponentTicker, ContrastDemo, ExploreSection; added `not-found.tsx`, `robots.ts`, `sitemap.ts`, `use-dismissable-overlay.ts`, `bugs.md`; overlay dismiss behavior in DocsHeader/SearchDialog/PlaygroundHeader; removed `.eslintignore`. |
| 958dfcc "further dev on website" | Oct 1 16:10 | Component page + ComponentPreview tweaks, `use-query-state.ts` (deep-link state), PlaygroundClient/Preview prop-sync. |
| a230fa0 "started making the website..." | Oct 1 03:13 | The big one: whole `website/` app (docs routes, playground, landing, generators, package-lock +811) and the demo-side hooks: `demo/App.tsx` embed mode + theme/ready messaging, `demo/src/playground/registry.tsx`, `PlaygroundScreen.tsx`, `ShowcaseScreen.tsx`, `Layout.tsx`, `ThemeContext.tsx`, `app.json`. |
| 33ee435 "made the website and preview runtime folders in the monorepo..." | earlier | Created `website/` and `preview/` skeletons. |

Working tree: `git status --short` excluding brag-output shows **nothing** (clean). The only dirty state is the **deletion of every tracked file under `brag-output-2026-10-02-230903/`** (D in the index/worktree: brag-plan.md, brag.jpg, brag.mp4, composition/** incl. captures, lab export, music, sfx, snapshots, etc.), i.e. the committed launch video was removed from disk but the removal is not committed. Total commits in repo: 32. Local untracked/ignored artefacts present: `website/out/`, `website/public/lab/`, `preview/dist/`, `website/tsconfig.tsbuildinfo`.

### 8. Suggested next steps implied by the above (for a fresh chat)

1. Decide the protocol for preview: either extend `preview/` to handle `apexrn:theme`, `apexrn:reducedMotion`, hash/query routing and prop updates, or change the website embedders to speak `apexrn:render`/`resize`/`error`.
2. Add a build step (website predev/prebuild or CI) that runs `cd preview && npx expo export --platform web` and copies `preview/dist` to `website/public/preview/` (gitignore it); repoint the 3 iframe components + ThemeContext; change `generate-docs.mjs` validation from `demo/App.tsx` case labels to `preview` resolvable exports; update instructions/prompts/website.md.
3. Rework landing page (user-flagged mess + unidentified hero button bug) and restore the phone-reveal concept if still wanted.
4. Add CI for `website/` (lint, tsc, build) and `preview/` (doctor, typecheck, export); set `NEXT_PUBLIC_SITE_URL`; confirm a Linux `next build` finishes (EBUSY issue).
5. Commit or restore the deletion of `brag-output-*` (do not run destructive git commands without being asked).

---

# Part D: Crash investigation log

## Demo startup crash: "Cannot read property 'search' of undefined"

### Symptom
Demo app on Android/iOS (Expo Go / dev build) shows a red-screen Render Error right away:
`TypeError: Cannot read property 'search' of undefined`. Web works.

### Commands run (from demo/) with trimmed output
- `npm run doctor`: `doctor: OK (no duplicate dependency trees)`
- `npm run typecheck`: clean, no errors (TS types `window.location` as always defined, so it can't catch this)
- `npx expo install --check`: minor drift, unrelated to this crash:
  expo 57.0.25 (want ~57.0.31), expo-asset 57.0.18 (~57.0.20), expo-modules-core 57.0.19 (~57.0.24), react-native-svg 15.15.5 (want 15.15.4)
- `npx expo export --platform web --output-dir <scratchpad>/web-dist`: OK
- `npx expo export --platform android --output-dir <scratchpad>/android-dist`: OK, `Android Bundled ... index.ts (1241 modules)`, 3.1MB hbc.
  The bundle builds, so this is a runtime error, not a bundling or version problem.
- Grep across demo/, packages/ui/ and preview/ for `.search` / `location.` / `URLSearchParams`: the only unguarded read is in demo Layout.tsx (below). packages/ui has no hits.
- `node_modules/react-native/Libraries/Core/setUpGlobals.js:18-20`: `if (global.window === undefined) { global.window = global; }`
  On native, `window` therefore exists but `window.location` is `undefined`. Neither expo nor @expo/metro-runtime polyfills `location` (no expo-router in this app).

### Root cause (definite)
`demo/src/components/Layout.tsx:17` (added in commit a230fa0, "started making the website"):
```tsx
const isEmbed = typeof window !== 'undefined' && (window.location.search.includes('embed=1') || window.location.search.includes('frame=0'));
```
On native, the `typeof window !== 'undefined'` guard passes because RN aliases `window` to `global`. Then `window.location.search` reads `.search` of `undefined` and throws during render. `HomeScreen` (the initial screen) renders `<Layout title="APEXRN">`, so the app crashes on launch. Every other screen uses Layout too.
The other hash readers (App.tsx:57/62/86, ThemeContext.tsx:6) are safe because they also check `Platform.OS === 'web'`.

Platforms: **Android + iOS affected; web not affected.**

### Proposed fix (not applied)
```diff
--- a/demo/src/components/Layout.tsx
+++ b/demo/src/components/Layout.tsx
@@
-import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
+import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
@@
-  const isEmbed = typeof window !== 'undefined' && (window.location.search.includes('embed=1') || window.location.search.includes('frame=0'));
+  // Native aliases `window` to `global` with no `location`, so gate on the platform, not on `typeof window`.
+  const search = Platform.OS === 'web' ? window.location?.search ?? '' : '';
+  const isEmbed = search.includes('embed=1') || search.includes('frame=0');
```

### preview/ app
It does not have this crash. Its `location.search` reads (App.tsx:13, :20) are gated on `Platform.OS !== 'web'`.
It has a related latent native problem, though: `preview/App.tsx:42/44` calls `window.addEventListener`/`removeEventListener` in a useEffect with no platform guard. Those methods don't exist on native window/global, so the call would throw "is not a function". Also, `preview/src/protocol.ts:44-45` calls `window.parent.postMessage`, and on native `window.parent` is undefined, so it would throw "Cannot read property 'postMessage' of undefined".
This only matters if preview is ever run on a device. Its scripts are web-oriented (`web`, `build:web`), so it is likely web-only by design. If so, guard the effect with `if (Platform.OS !== 'web') return;`.

### How to verify
1. Apply the diff, then from demo/ run `npm run typecheck` and `npx expo export --platform web` (both should stay green).
2. `npx expo start` and open in Expo Go on Android and iOS: Home should render, with no red screen.
3. On web, `/lab/?embed=1#button` should still show the embed layout (no header). `/lab/#button` should show the header.

---

# Appendix Z: root CLAUDE.md (verbatim, headings demoted one level)

## CLAUDE.md — ApexRN

### What we are building

**ApexRN (`@apexrn/ui`) is a brutalist UI component library for React Native, inspired by shadcn/ui and designed to work the same way — but for React Native / Expo apps, not the web.**

What "works like shadcn" means here (this is the mental model for every decision):

- **Own-the-code components.** Each component is a small, readable, self-contained file a developer could copy into their app and edit. Keep cross-file coupling minimal so a future registry/CLI (`npx apexrn add button`) can copy one component and its few dependencies.
- **Composition over configuration.** Compound components (`Dialog` → `DialogTrigger`, `DialogContent`, `DialogTitle`…) share state through React context. Prefer `asChild`-style composition and explicit slots over long prop lists or children-type sniffing.
- **Variants as data.** A component's look is a small variant/size map (like shadcn's `cva`), resolved from theme tokens — never scattered conditionals or raw hex values.
- **Tokens + primitives, not copy-paste styles.** One theme, one surface primitive (`BrutalSurface`), one style-merge helper (`cn`). Every component is a thin composition of these.
- **Unstyled-enough to customise.** `style` targets the outer wrapper; named props (`inputStyle`, `surfaceStyle`) target inner parts. Consumers change the theme, not the component internals.
- **Controlled *and* uncontrolled.** `value`/`defaultValue`/`onValueChange`, `open`/`defaultOpen`/`onOpenChange`.
- **No runtime dependencies beyond peers** (react, react-native, reanimated, gesture-handler, svg, expo-haptics, worklets).

The visual language is **brutalist**: thick borders, zero radius, hard offset shadows, flat high-contrast fills, heavy type, tactile press physics, no gradients/blur/glassmorphism. All of that lives in tokens + `BrutalSurface`, so the look can change by swapping tokens, not by rewriting components.

### Repo layout

```
apexrn/
├── CLAUDE.md               # this file
├── apexrn-modify.md        # THE PLAN: rewrite loop, spec, Lab design, tracker, triage table
├── apexrn-docs.md          # docs of the current (pre-rewrite) lib — partly overclaims, see plan §2.7
├── design/                 # AUDIT.md (diagnosis), REFACTOR.md (history)
├── packages/ui/            # @apexrn/ui — SOURCE ONLY (components/, lib/, index.ts)
├── packages/cli/           # `apexrn` CLI (init/add/diff/list), zero deps, node --test
├── registry/               # build.mjs + meta.json -> registry/public (generated, gitignored)
├── demo/                   # Expo app: ALL dependencies live here; hosts the Component Lab
└── .claude/skills/         # vendored design skills (offline): frontend-design, ui-ux-pro-max
```

Read `apexrn-modify.md` before doing library work. It is the source of truth for scope, order, the Definition of Done, and the tracker.

### Hard rules (do not break)

1. **`packages/ui` is source code only.** No `node_modules`, no lockfile, never run `npm install` there. All dependencies are installed in `demo/`. A second install creates duplicate copies of react/reanimated/svg → "Invalid hook call", duplicate native view registration, dead themes. `cd demo && npm run doctor` must stay green.
2. **Do not add `"@apexrn/ui": "file:../packages/ui"` to any package.json.** That link is what made npm install peer deps inside `packages/ui`.
3. **Metro/TS/Babel wiring is deliberate — don't "clean it up":**
   - Aliases (`@apexrn/ui`, transitional `@ui/*`) are in `demo/metro.config.js` via `resolveRequest` (`extraNodeModules` can't map scoped subpaths).
   - `demo/tsconfig.json` has a `"*"` path mapping so TS can resolve deps for files in `packages/ui`; `@types/*` must come **first**.
   - `demo/app.json` has `experiments.tsconfigPaths: false`, otherwise Expo feeds that `"*"` mapping to Metro and `react` resolves to `@types/react`.
   - `babel.config.js` is preset-only; `babel-preset-expo` already adds the worklets plugin (don't list it again).
4. **Import the library only through `@apexrn/ui`** in new demo code. `@ui/*` deep imports exist only for old screens and disappear as they are rebuilt.
5. **One component per loop.** Never start the next component until the current one is VERIFIED (plan §5). If a primitive is wrong, reopen it and re-verify its dependents.
6. **Web passing ≠ device passing.** Reanimated 4 + New Architecture errors often appear only on Android/iOS. Test gestures, overlays, keyboard and back-button on device.
7. Do not change `package.json` dependency versions casually; use `npx expo install <pkg>` to stay aligned with the Expo SDK (currently 57).

### Code conventions

- **TypeScript strict**, `noUnusedLocals`/`noUnusedParameters`. No `any` in public APIs.
- **Colors only from `useTheme().colors`.** No hex literals in components. Never read `colors.light`/`colors.dark` directly.
- **Anything blocky renders through `BrutalSurface`.** Don't hand-roll shadow/border stacks.
- **Size-dependent tokens (`spacing`, `typography`, window size) are read at render time**, not in module-level `StyleSheet.create` (which freezes them at import). Static values (border widths, offsets) may stay static.
- **Animate `transform`/`opacity` only** (Reanimated, UI thread). Avoid animating layout props (`width/height/borderWidth/left/top`) unless there's no alternative, and comment why.
- **Merge styles with `cn(base, themeOverrides, conditional, consumerStyle)`** — consumer style last. Don't pass animated styles through `cn`; use arrays.
- **Accessibility is part of the component:** role + state on interactive nodes, ≥44px hit targets (`hitSlop`), decorative subtrees hidden from assistive tech, overlays use `accessibilityViewIsModal` and close on Android back.
- **Modals + gestures:** any `GestureDetector` rendered inside a React Native `Modal` needs its own `GestureHandlerRootView` inside that Modal (Android renders Modals in a separate window).
- **Compound components throw a clear error** when used outside their parent; no `displayName`/`name` sniffing to detect slots.
- **Registry:** components import shared code as `../lib/x` and siblings as `./x` (the CLI rewrites `../lib`). Every new component needs an entry in `registry/meta.json`; `node registry/build.mjs` fails otherwise.
- **Exports:** every component is a *named* export (`export function Button`); single-component files also keep `export default`. Names must be unique across components (the CLI barrel does `export *`). Value controls use `value`/`defaultValue`/`onValueChange`; overlays `open`/`defaultOpen`/`onOpenChange`; status variants are `destructive | success | warning`.
- **Contrast:** every foreground/background token pair must be ≥4.5:1 in both themes; `node registry/check-contrast.mjs` enforces it.
- **File naming:** kebab-case, one spelling per component, no alias re-export files. Comments explain *why*, not what; no "template compliance" leftovers or dead constants.
- Keep files focused: a component and its sub-parts in one file unless it genuinely exceeds ~300 lines.

### Design workflow — use the two vendored skills

Skills live in `.claude/skills/` (installed offline; no network needed). Invoke them with the Skill tool, and use them **for every component's design pass** — before writing code, not after.

| Skill | Use it for |
|---|---|
| `frontend-design` (Anthropic) | Aesthetic direction and the plan → self-review → build → critique method: compact token system, distinctive choices, restraint ("spend boldness in one place"), copy quality. |
| `ui-ux-pro-max` | Searchable local data: styles, palettes, font pairings, UX guidelines, React Native stack rules. |

`ui-ux-pro-max` commands (run from the **repo root**; requires `python`, works offline):

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "brutalism" --domain style -n 3
python .claude/skills/ui-ux-pro-max/scripts/search.py "<component/interaction>" --stack react-native -n 5
python .claude/skills/ui-ux-pro-max/scripts/search.py "<topic e.g. form validation, touch target>" --domain ux -n 5
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain typography -n 3
```

Per-component design pass:
1. `--stack react-native` and `--domain ux` searches for the component's interaction (touch feedback, forms, overlays, motion).
2. `frontend-design` plan pass: state the component's job, its states, and the one memorable brutalist detail; then critique it against the "generic default" checklist before coding.
3. Build against the spec in `apexrn-modify.md` §3.

How to reconcile the skills with our brief:
- **The brief wins.** Our brief is brutalism, so thick borders, zero radius, hard shadows and heavy type are *decisions*, not defaults to be avoided. `frontend-design` warns against habits like all-caps everywhere, decorative eyebrows, or one identical treatment on everything — apply that to *how* we use the brutalist vocabulary (hierarchy, restraint, purposeful labels), not to whether we use it.
- **`ui-ux-pro-max` is web-flavoured.** Ignore Tailwind/CSS/GSAP/Google-Fonts advice; take the UX rules (touch targets, contrast 4.5:1, feedback timing, reduced motion, dark-mode contrast, safe areas) and the `react-native` stack rules. Don't run with `--persist` (it writes design-system files into the repo) unless asked.
- Its style entry for "brutalism" suggests instant/no transitions. We deliberately keep **short purposeful press physics** (spring + haptic) — motion that answers a user action. Respect reduced-motion.
- The neo-brutalist vs raw-brutalist palette question (`design/AUDIT.md` §1, `apexrn-modify.md` §7) is open; default is the current neo look, isolated in tokens.

### The rebuild loop (summary — details in `apexrn-modify.md`)

For each component, in dependency order (primitives → atoms → inputs → motion/nav → overlays):

1. **Spec** — props, states, a11y contract.
2. **Design pass** — the two skills (above).
3. **Rewrite** the component (old version is reference only).
4. **Specimen** — a Component Lab page in `demo/` importing from `@apexrn/ui`: variants, sizes, states matrix, light/dark split, playground, stress cases, event log; wrapped in an ErrorBoundary and lazy-loaded.
5. **Run** on web, then on device. Fix.
6. **Lock** — Definition of Done checklist, smoke test, one commit `feat(ui): <component> — rewrite + lab specimen`, update the tracker.

### Commands (run from `demo/`)

```bash
npm run doctor                     # env sanity: no duplicate dependency trees
npm run typecheck                  # tsc — covers packages/ui AND the demo
npx expo export --platform web     # bundle check
npx expo start --web               # fast iteration
npx expo start                     # device (Expo Go / dev build)
npx expo install --check           # SDK version alignment
```

Before declaring a component done: `doctor` + `typecheck` + `expo export` green **and** it has been exercised in the Lab on a device. Say plainly what was and wasn't verified; don't claim device behavior from a web run.

### When something renders wrong

Triage in this order (full table: `apexrn-modify.md` Appendix A):
1. `npm run doctor` (duplicate React/reanimated/svg?).
2. Is the provider above the component; is everything imported via one module path?
3. Gesture inside a Modal without a root view?
4. Web-only or device-only? Reproduce on the failing platform before changing code.
5. Only then read the component.

### Things to never do

- `npm install` inside `packages/ui`, or add a lockfile/node_modules there.
- Put hex colors, hand-rolled shadows, or module-level metric reads in components.
- Expand scope mid-loop ("fix a neighbour while I'm here").
- Publish to npm, run destructive git commands, or delete `_legacy` reference files before their replacement is VERIFIED, without being asked.
- Trust `demo/AGENTS.md`'s version-pinned docs link over the installed Expo SDK (57).
