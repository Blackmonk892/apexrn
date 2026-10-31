# Phase B: Components. Implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every one of the 36 components is rebuilt on the B0 system (tokens, presets, `BrutalSurface`, `Text`, `variants()`, `motion`), has smoke tests and an emulator flow, and three reference screens prove they compose into a product. Then `SegmentedControl`, `EmptyState` and `NumberInput` are added.

**Architecture:** One task per component, in the dependency order of `apexrn-modify.md` §5.3. A task owns exactly four paths: `packages/ui/components/<name>.tsx`, `demo/src/screens/<Name>Screen.tsx`, `demo/__tests__/<name>.test.tsx` and `demo/e2e/components/<name>.yaml`. Shared files (`packages/ui/index.ts`, `registry/meta.json`, the specimen board, `apexrn-modify.md` §5.4, the ledger) are touched only by the controller or by tasks that say so, so tasks inside a wave can run in parallel in the main checkout. The demo keeps its screen router; each `<Name>Screen` is that component's specimen (the 12-section Lab of `apexrn-modify.md` §4 predates ORCHESTRATOR and is not built).

**Tech Stack:** as Phase B0 (`docs/ship-plan/phase-b0.md`, Tech Stack paragraph). After Task 1: `renderInPalettes(ui)` from `demo/__tests__/utils/render.tsx` renders `ui` once per palette (`neo`/`raw` × `light`/`dark`) and returns the four results labelled; the demo opens a screen directly from `apexrn-demo://c/<id>` (ids are the Home ids: `button`, `listitem`, `input_otp`, …); a component flow starts with `- runFlow: ../_open.yaml` with `env: { ID: <id> }`.

**Spec:** `rework/DESIGN.md` §1–§8, `rework/ORCHESTRATOR.md` §1 and §3, `CLAUDE.md`, `apexrn-modify.md` §3 (API and a11y rules), the ledger's Phase B carry list (`docs/ship-plan/LEDGER.md`).

## Global Constraints

Every component task's requirements include all of these.

- **System only.** Colours from `useTheme().colors` roles in their pairs (DESIGN §1.1). Depth from `elevation` keys through `BrutalSurface` only; no `SHADOW_OFFSET`/`SHADOW_WIDTH` constants, no hand-rolled shadow `View`s, no `elevation` style key. Border widths `borderWidths.control` (2) / `borderWidths.container` (3) only. Every visible string renders through `Text` with a variant; no `fontSize`/`fontWeight` in components. The look is a `variants({ base, variants, defaultVariants })` map.
- **States** exactly as DESIGN §3: pressed = `BrutalSurface` sink; focused = `BrutalSurface focused`; disabled = `BrutalSurface disabled` (dashed, no shadow, no haptic, size unchanged — never a grey fill or an elevation switch); error = `invalid` + message in `label` style with `CloseIcon`; loading = `LoadingBlocks`, width kept.
- **Type.** Uppercase only through the `label` variant. Button and every action text is sentence case. Numbers, dates, counts, prices and part numbers are `mono`.
- **Icons** only from `lib/icons`; new glyphs are added there, drawn to DESIGN §5.
- **Status signal (DESIGN §3).** Any `destructive | success | warning` (and `info`, once one exists) variant renders an icon and a visible text label; colour is never the only signal.
- **Motion** from `lib/motion` (`useMotion()`), transform/opacity only, overlays 180/120ms hard stop, selection 160ms, reduced motion → 100ms opacity.
- **API** (apexrn-modify §3.3): value components `value`/`defaultValue`/`onValueChange`; overlays `open`/`defaultOpen`/`onOpenChange`; both modes everywhere. `style` = outer wrapper; inner parts via named props. Compound parts throw `"<Part> must be used within <Parent>"` outside their parent. Named export + `export default` for single-component files. Keep existing export names unless the task says otherwise.
- **A11y** (apexrn-modify §3.4): role + state on interactive nodes; hit target ≥ 44 (`hitSlop`); decorative subtrees hidden; overlays `accessibilityViewIsModal`, Android back closes, dismiss reachable without a gesture; `maxFontSizeMultiplier` 1.3 comes from `Text`.
- **Density** (DESIGN §6): list rows 56 / 72, section gap 24, screen padding 16, controls sm 40 / md 48 / lg 56.
- **Required smoke tests per component** (ORCHESTRATOR §3): renders in all four palettes (`renderInPalettes`); controlled and uncontrolled; disabled (no callback fires); role and state; compound parts throw outside their parent. Plus the task's own listed tests.
- **Specimen screen** (`<Name>Screen.tsx`): Variants, Sizes (if any), States (every applicable DESIGN §3 state, forced where possible), In context (one realistic composition), Edge cases (long text, empty, 320 wide), and an event log line for callbacks. Imports only from `@apexrn/ui` plus `Layout`/`Section`. Real content, sentence case, no lorem, no "Lorem/Foo/Test".
- **Emulator flow** `demo/e2e/components/<name>.yaml`: open via `_open.yaml`, assert the component's key testID visible, perform its main interaction, assert the visible result (event log text or state), assert no "Render Error"/"TypeError", `takeScreenshot: <name>`.
- **No slop:** no narrating comments, no TODOs, no dead exports, no emoji, no marketing copy. Comments explain why.
- **Commits:** `feat(ui): <name> — <what changed>`, ending `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Commit only your own paths: `git commit -m "…" -- <paths>` (other agents work in the same checkout).
- **Shared files are controller-owned** unless the task lists them: `packages/ui/index.ts`, `registry/meta.json`, `demo/App.tsx`, `demo/src/screens/HomeScreen.tsx`, `demo/src/screens/specimen/**`, `apexrn-modify.md`, `docs/ship-plan/LEDGER.md`. If you need a change there, put the exact edit in your report.
- Verification per task, from `demo/`: `npx jest __tests__/<name>.test.tsx`, `npm run typecheck` (errors in other agents' in-flight files are not yours; report them, don't fix them), `npm run doctor`.

## Review Focus

1. A controlled component whose parent ignores `onValueChange` must not change its own display (controlled means controlled). Each value task's controlled test asserts the display stays put.
2. `disabled` flipping to `true` while pressed or open must not leave a stuck sunk surface or an open overlay that can't close (BrutalSurface handles the press; overlay tasks test open + disabled trigger).
3. Text at the 1.3 cap and 320 wide must wrap or truncate by the component's stated rule, never overflow its border (each specimen's Edge cases section; reviewers check the emulator screenshot).
4. Raw dark is where weak pairs show: every component's four-palette test asserts no role is read outside its pair (the reviewer greps for `colors.` uses that mix pairs).
5. Compound parts used outside their parent must throw the named error, not render half a component (each compound task's throw test).

---

### Task 1 (B-1): Harness, deep links, flow template, tracker

**Files:** `demo/__tests__/utils/render.tsx`, `demo/__tests__/harness.test.tsx`, `demo/App.tsx`, `demo/app.json` (`scheme: "apexrn-demo"`), `demo/e2e/_open.yaml`, `demo/e2e/config.yaml`, `.github/workflows/android-e2e.yml` (only if needed to include `components/`), `apexrn-modify.md` §5.4, `packages/ui/package.json` (peers), `packages/ui/lib/use-press-physics.ts` + `index.ts` (drop `PressPhysicsConfig`).

**Interfaces:**
- Produces: `renderInPalettes(ui: ReactElement): Promise<{ palette: string; view: RenderResult }[]>` (palette labels `neo-light`, `neo-dark`, `raw-light`, `raw-dark`). Deep link `apexrn-demo://c/<id>` → that screen; unknown id → Home. `demo/e2e/_open.yaml` takes `${ID}`, runs `openLink`, waits for testID `screen-${ID}` (Layout renders `testID={\`screen-${id}\`}` — add an `id` prop to `Layout` and pass it from each existing screen; that one prop line per screen is the only edit to screens in this task).

- [ ] **Step 1:** failing tests: `renderInPalettes` returns four labelled renders whose `useTheme().colors.background` equals the matching `presets[p][m].background`; App opens `button` from `apexrn-demo://c/button` (mock `Linking.getInitialURL`) and Home for `apexrn-demo://c/nope`.
- [ ] **Step 2:** implement; `config.yaml` makes `maestro test demo/e2e/` run the top-level flows and `components/*.yaml`; `_open.yaml` is not a test flow.
- [ ] **Step 3:** tighten `packages/ui/package.json` peers to the tested stack (`react` ^19, `react-native` >=0.81, `react-native-reanimated` >=4, `react-native-worklets`, gesture-handler, svg, expo-haptics as installed in demo); drop `PressPhysicsConfig`.
- [ ] **Step 4:** replace the §5.4 tracker rows with one row per component (`TODO`), columns `Item | Status | Commit | Verified | Not verified`.
- [ ] **Step 5:** add `demo/e2e/components/button.yaml` as the template's first user (open, tap the first button, assert event log) so the CI run proves the pattern.
- [ ] **Step 6:** jest, typecheck, doctor, web export; commit `test(demo): palette render helper, deep links, component flow template`.

---

## Wave 2: Atoms (parallel groups; each task owns only its four paths)

Specs: one line each for job, then the deltas from today's code. "shadcn:" is the DESIGN §6 comparison line.

### Task 2 (B-2): Button
- Job: the one action control. shadcn: same variant set plus `success`/`warning` (mobile status actions); `asChild` not added (RN Pressable has no slot need yet).
- Variants `primary | secondary | outline | ghost | destructive | success | warning`; sizes sm 40 / md 48 / lg 56. Sentence-case label in `title` weight (carry list). `loading` → `LoadingBlocks` replaces the label, width kept, `accessibilityState.busy`, presses ignored, **not** styled disabled. Status variants carry their icon left of the label (status rule). An icon-only button (no children/title) without `accessibilityLabel` logs a `__DEV__` warning, once.
- Memorable detail: the sink is the only motion; the loading blocks step in the label's place without the button moving a pixel.
- Tests: width identical idle vs loading (onLayout mock); `busy` state; loading press does nothing; each status variant renders its icon; ghost has elevation flat.

### Task 3 (B-3): Label
- Job: field caption. shadcn Label. Uses `Text variant="label"`; `required` adds a `*` read as "required"; `nativeID` for `accessibilityLabelledBy`. `disabled` → muted tone.

### Task 4 (B-4): Separator
- Job: the 2px rule (DESIGN §7.3 "rules beat boxes"). shadcn Separator. `orientation`; always hidden from assistive tech (RN has no separator role; a labelled divider's text is read as plain text). Thickness `borderWidths.control`, colour `border`. Optional `label` centred in mono `label` style (section dividers).

### Task 5 (B-5): Badge
- Job: a static status/count tag. shadcn Badge. Variants as today plus status icons (done in B0-10 for status). `count` prop renders mono tabular; `max` (default 99) → `99+`. Drop `withShadow` (a badge is flat content, DESIGN §7.2); label-only API kept (`label` or children).

### Task 6 (B-6): Avatar
- Job: person or entity mark. shadcn Avatar (`AvatarImage`/`AvatarFallback`); deliberate difference: square (DESIGN §1.3). Image error → initials fallback; initials from `name` if no `initials`; sizes 32/40/56. Drop `withShadow`. `accessibilityLabel` from `name`.

### Task 7 (B-7): Skeleton
- Job: loading placeholder. shadcn Skeleton. Block in `muted`, a single stepping sweep (no gradient — a hard-edged band translating), stops under reduced motion and when `paused`. Shapes via `width`/`height` props; `lines` prop renders n text lines, last at 60%.

### Task 8 (B-8): Progress
- Job: determinate and indeterminate progress. shadcn Progress. Fill animates `scaleX`/translate, never width. `value` undefined → indeterminate (stepping block, reduced motion → static 3 blocks). `accessibilityRole="progressbar"` with `accessibilityValue {min,max,now}`. Optional `label` + mono percentage. Drop `withShadow`.

### Task 9 (B-9): Alert
- Job: inline, persistent message. shadcn Alert (`AlertTitle`, `AlertDescription` parts, compound). Status icons from B0-10; `action` slot (a Button). Container border, flat (no shadow: alerts are content).

### Task 10 (B-10): Card
- Job: grouped content. shadcn Card (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`; `CardText` is replaced by these — remove it). Status variants `destructive | success | warning` as a top rule + icon + label (ORCHESTRATOR §3). Pressable card sinks. Children are flat (DESIGN §7.2: the card owns the one shadow).

### Task 11 (B-11): ListItem
- Job: a row in a list. Material 3 list item (no shadcn equivalent). Heights 56 one-line / 72 two-line, no surface box (rules between rows, DESIGN §7.3). `leading`/`trailing` slots; `title` 2-line truncate, `description` 1 line. Pressable rows show a pressed `muted` fill (rows don't sink: they have no shadow). Optional `meta` (mono, right).

### Task 12 (B-12): FAB
- Job: the one floating primary action. Material 3 FAB and HIG. Square, elevation overlay, `primary` fill, icon + optional extended label (sentence case). Safe-area aware placement (`placement` bottom-right default). Hides from a11y when `visible` false; `accessibilityLabel` required.

## Wave 3: Inputs

### Task 13 (B-13): Input
- Job: single-line text field. shadcn Input. Field = `BrutalSurface` elevation flat, `input` border, focused ring, `invalid` + `errorMessage` row (label style + CloseIcon), `disabled` dashed (carry list: no grey fill). `label`/`description` via Label; `leading`/`trailing` slots; sizes 40/48/56. Keep `inputStyle`.
- Tests: focus shows ring (focus event), invalid sets `accessibilityState.invalid`-equivalent (`aria-invalid`), disabled not editable, error text read with the field (`accessibilityLabelledBy`/hint).

### Task 14 (B-14): Textarea
- Job: multi-line text. shadcn Textarea. Same field rules as Input; `minRows`/`maxRows` (height clamps via onContentSizeChange; comment why height is set); character counter in mono when `maxLength` set.

### Task 15 (B-15): Checkbox
- Job: binary or mixed choice. shadcn Checkbox (Radix). `checked: boolean | 'indeterminate'`, `defaultChecked`, `onCheckedChange`. Box 24 with 2px border, check = `CheckIcon` on `foreground` fill (selected = inverted block, DESIGN §3), indeterminate = a 2px bar. Label pressable, 44 hit target. Pass `disabled` to BrutalSurface.

### Task 16 (B-16): Switch
- Job: instant on/off setting. shadcn Switch. Square track and thumb; thumb translates (transform) 160ms selection timing; on = inverted. Pass `disabled` to BrutalSurface (carry list), no elevation switching. `accessibilityRole="switch"`.

### Task 17 (B-17): RadioGroup
- Job: one choice of several. shadcn RadioGroup (`RadioGroupItem`). Square (DESIGN §1.3); distinguishable from Checkbox by its mark: a filled inner square inset 4 instead of a check (carry list radio redesign). Group role `radiogroup`, items `radio` with `checked`. Arrow-key/adjustable not required on RN.

### Task 18 (B-18): Slider
- Job: choose a value on a range. shadcn Slider. Thumb square, track 2px rule with filled portion via `scaleX`. Gesture on UI thread; `step`, `min`, `max`; `accessibilityRole="adjustable"` with increment/decrement actions. Pass `disabled` to BrutalSurface; read shadow from elevation (carry list). Value label mono.

### Task 19 (B-19): InputOTP
- Job: one-time code entry. shadcn InputOTP. `value`/`defaultValue`/`onValueChange` (keep `onChangeText` pass-through) and `onComplete`. Cells mono, active cell focused ring; paste fills all; `textContentType="oneTimeCode"`, `autoComplete="sms-otp"`. Shadow from elevation (carry list).

### Task 20 (B-20): Specimen state cells
- **Files:** `demo/src/screens/specimen/StateMatrix.tsx`, `demo/__tests__/specimen.test.tsx`.
- Wire the 10 "not wired" cells (carry list) to the real Button, Input and Checkbox states; test asserts no cell reads "not wired". Re-shoot the board screenshots into `docs/ship-plan/specimen/`.

## Wave 4: Motion and navigation

### Task 21 (B-21): Marquee
- Job: a looping ticker for short announcements. No shadcn equivalent. Constant translate loop (allowed by DESIGN §4), stops under reduced motion (static, truncated), pauses on press; hidden duplicate copy is decorative.

### Task 22 (B-22): Carousel
- Job: horizontal paged content. shadcn Carousel (Embla). Snap paging, `index`/`defaultIndex`/`onIndexChange`, page indicator = square blocks with the active one inverted (selection timing), prev/next buttons with labels. Swipe verified in the flow.

### Task 23 (B-23): Accordion
- Job: progressive disclosure. shadcn Accordion. Keep API; content reveal by opacity + translate with a measured height container (comment why height animates if it must); chevron rotates (transform). Trigger `accessibilityState.expanded`.

### Task 24 (B-24): Tabs
- Job: switch views in place. shadcn Tabs. The active tab is an inverted block that slides 160ms (DESIGN §4 selection), transform only; shadow from elevation (carry list). `TabsList` scrolls when tabs overflow. `role="tablist"`/`tab` with `selected`.

### Task 25 (B-25): Toast + Toaster
- Job: transient feedback. shadcn Sonner. Swipe to dismiss (ORCHESTRATOR §3), enter 180 / exit 120 from the top edge, status rule (B0-10), optional `action` (Button). `accessibilityLiveRegion="polite"` (assertive for destructive). Toaster queues, max 3 visible.

### Task 26 (B-26): AppBar
- Job: screen title and actions. Material 3 top app bar / HIG nav bar. Collapsing large title driven by a passed `scrollY` shared value (ORCHESTRATOR §3); back and up to 2 actions, icon buttons with labels; safe-area top.

### Task 27 (B-27): BottomNav
- Job: top-level destinations. Material 3 navigation bar / HIG tab bar. The active block (inverted) carries the label; inactive items are icon-only with a11y labels; the label hides at font scale > 1.3 (ORCHESTRATOR §3). `value`/`defaultValue`/`onValueChange`; safe-area bottom.

### Task 28 (B-28): SearchBar
- Job: query entry with suggestions. Material 3 search bar. Built on Input rules; clear button; `recent` slot listing recent searches as ListItems (ORCHESTRATOR §3); `onSubmit`.

### Task 29 (B-29): Chip
- Job: filter or input token. Material 3 chips (shadcn has none). Filter (selected = inverted, `CheckIcon`), input (removable, `CloseIcon` with label), status variants per status rule — Chip joins `status-signal.test.tsx` (carry list). Pass `disabled` to BrutalSurface (carry list). 32 visual height, 44 hit target.

### Task 30 (B-30): Drawer
- The full index redesign of ORCHESTRATOR §3 "Drawer redesign": numbered mono items with `title` labels, inverted active block sliding between items on the UI thread, `DrawerSection` (mono label + rule), `DrawerFooter`, `side`, `variant: 'overlay' | 'push'`, edge swipe (`edgeWidth`, off by default on iOS), swipe to close, Android back, focus trapped, reduced motion → opacity, safe areas. Shadow from elevation (carry list). Material 3 navigation drawer comparison line. Flow: open by edge swipe, select item, back closes.

## Wave 5: Overlays

### Task 31 (B-31): Sheet
- shadcn Sheet / Material bottom sheet. `open`/`defaultOpen`/`onOpenChange` + `SheetTrigger` (ORCHESTRATOR §3), `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetFooter`. Own `GestureHandlerRootView` in the Modal; handle drag to dismiss; scrim with `scrimOpacity`; 180/120 hard stop; back closes; `accessibilityViewIsModal`.

### Task 32 (B-32): Dialog
- shadcn Dialog with `DialogTrigger` (asChild), `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. Elevation overlay through BrutalSurface (carry list), scrim, back closes, focus lands on title.

### Task 33 (B-33): AlertDialog
- shadcn AlertDialog. Keeps the convenience API and exposes compound parts built on Dialog (ORCHESTRATOR §3). Cancel is outline, the action is primary or destructive; not dismissable by scrim tap.

### Task 34 (B-34): DropdownMenu
- shadcn DropdownMenu. Anchored to trigger measurement, flips above when no room; items 48, destructive item with icon; shadow from elevation (carry list); `open`/`defaultOpen`/`onOpenChange`; back and outside tap close.

### Task 35 (B-35): Select
- shadcn Select. Sheet-based on mobile; searchable when 10 or more items (ORCHESTRATOR §3) using Input; selected item inverted with `CheckIcon`; `invalid`/`disabled` as Input.

### Task 36 (B-36): DatePicker
- shadcn Date Picker (Calendar in Popover). Sheet with a month grid; `min`/`max`, `isDateDisabled`, `weekStartsOn` (ORCHESTRATOR §3); dates mono; today outlined, selected inverted; month nav buttons labelled; `value: Date | undefined`.

## Wave 6: New components (after Waves 2–5 are DONE)

### Task 37 (B-37): SegmentedControl — ORCHESTRATOR §3 "New components", verbatim requirements. Registry entry, index export (task owns `index.ts` and `registry/meta.json` lines for itself, serial with 38–39).
### Task 38 (B-38): EmptyState — as specified there; composes `Text` and `Button`.
### Task 39 (B-39): NumberInput — as specified there; hold-to-repeat with an accelerating interval, `adjustable` role.

## Wave 7: Gate

### Task 40 (B-40): Reference screens
- **Files:** `demo/src/screens/reference/{Settings,Checkout,Inbox}Screen.tsx`, their routes in App/Home, `demo/e2e/reference.yaml`.
- Built only from `@apexrn/ui` (DESIGN §8), layout-only styling. Flow screenshots each screen in all four palettes. Controller runs the design gate; failures are fixed in the system.

### Task 41 (B-41): Fresh-app install check
- `npx create-expo-app` in scratch, `npx apexrn init` + `add --all` from the local registry build, typecheck and web render. Script it as `scripts/fresh-app-check.mjs` so CI can run it in Phase E.

### Task 42 (B-42): Remove the old combined screens
- Delete `Forms/Feedback/Display/Overlay/Navigation/Showcase` screens and their Home group once every component screen is DONE.
