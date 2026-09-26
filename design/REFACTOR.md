# ApexRN — Refactor Plan

Companion to `design/AUDIT.md` (the diagnosis). This is the plan of record: what we're doing, in what order, and why. Keep this file updated as steps complete — it's the context handoff for any session (human or agent) picking this up cold.

**Status key:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## Suggested order (locked in)

1. `[x]` Fix the 6 crash/logic bugs — done, see notes under Step 1
2. `[x]` Build `usePressPhysics` + `BrutalSurface` primitive — done, see notes under Step 2
3. `[ ]` Wire theming/dark-mode through it
4. `[ ]` Decide and apply the real-brutalism token pass
5. `[ ]` CLI/registry packaging

Do not reorder without updating this file and saying why.

---

## Step 1 — Fix the 6 crash/logic bugs — ✅ DONE

Ref: `design/AUDIT.md` Section 2. These are correctness bugs, not style opinions — fixed before touching architecture, since building nice primitives on top of crashing components would have wasted the work.

- `[x]` **`floating_action_button.tsx`** — `Text` was used but never imported from `react-native`. Added it to the import. (AUDIT 2.1)
- `[x]` **`alertdialog.tsx` / `datepicker.tsx`** — both were passing `label="..."` to `<Button>`; changed all call sites to `title` (AlertDialog cancel/action buttons, DatePicker prev/next/confirm buttons). Also: `Button`'s `Variant` type only supported `'default' | 'primary' | 'outline'`, but `alertdialog.tsx` needed `'destructive'`. Added a real `destructive` variant to `button.tsx` (`VARIANTS.destructive` using `colors.light.destructive`/`destructiveForeground`, `hasShadow: true`) rather than mapping it to an existing variant — Step 4's token pass may retune the exact color, but the variant itself is real now, not a placeholder. (AUDIT 2.2)
- `[x]` **`alert.tsx`** — was referencing `colors.light.warning`/`colors.light.success`, which didn't exist. Added real `warning`/`warningForeground`/`success`/`successForeground` tokens to both `colors.light` and `colors.dark` in `lib/colors.ts` (not just a fallback hex in `alert.tsx` — the token model itself was incomplete, so fixed it at the source). Then removed the now-dead `|| '#hex'` fallback pattern in `alert.tsx`'s `VARIANT_COLORS` since the real tokens exist. Chosen values: light `warning #F59E0B`/`warningForeground #000000`, `success #2E7D32`/`successForeground #FFFFFF`; dark `warning #FFB300`/`warningForeground #000000`, `success #66BB6A`/`successForeground #000000`. These are placeholder-reasonable, not final — Step 4's real-brutalism token pass should revisit them once the palette direction (Section 1 of the audit) is decided. (AUDIT 2.3, 2.13)
- `[x]` **`input_otp.tsx`** — fixed the `focusProgress[i]?.value.value === 1` double-`.value` typo → `focusProgress[i]?.value === 1`. **Deferred to Step 2, on purpose:** the hooks-in-a-loop Rules-of-Hooks violation (`useSharedValue`/`useAnimatedStyle` called inside `Array.from(...)` and inside `renderBlocks()`) was *not* restructured here. Reasoning: the real fix is extracting each block into its own sub-component (e.g. `OTPBlock`) that owns its own hooks — which is exactly the shape Step 2's `BrutalSurface`-per-block migration needs anyway. Doing it twice (once now, once during Step 2) would be wasted motion. **Known residual risk:** `InputOTP` will still throw "Rendered more hooks than during the previous render" if a consumer changes the `length` prop after mount. Don't ship Step 2 without resolving this.
- `[x]` **`dropdown_menu.tsx`** — restructured so the trigger, not the menu, is what gets measured. Added `triggerLayout`/`setTriggerLayout` to `DropdownContextState`. `DropdownMenuTrigger.handlePress` now measures its own `triggerRef` via `.measure()` and writes the result to context *before* calling `setIsOpen(true)` (and toggles closed immediately if already open, instead of relying on stale layout). `DropdownMenuContent` no longer has its own disconnected `triggerRef`/`handleLayout`/`onShow` — it just reads `triggerLayout` from context and drives its open animation off an `isOpen` `useEffect`. Removed the stray `ref={triggerRef}` that was previously (incorrectly) attached to the menu's own `Animated.View`. (AUDIT 2.5)
- `[x]` **`select.tsx`** — `Select` was rendering `children` directly *and* again inside `<Sheet>`'s render-prop. Fixed by splitting `children` with `React.Children.forEach`: anything of type `SelectContent` goes into the Sheet's render-prop, everything else (i.e. `SelectTrigger`) renders once, directly, outside the Sheet. `SelectContent` now mounts exactly once, inside the modal; `SelectTrigger` mounts exactly once, in the normal layout tree. (AUDIT 2.6)

**Bundled quick wins** (touched opportunistically, not architectural): `carousel.tsx`'s invalid `accessibilityRole="adjustments"` → `"adjustable"` (AUDIT 2.7); deleted `components/test.tsx` scratch file (confirmed via grep it wasn't imported anywhere outside `design/*.md`) (AUDIT Section 3).

**Left untouched, intentionally, to avoid scope creep beyond the 6 bugs:** the dead `|| '#hex'` fallback patterns in `badge.tsx` (`accent`) and `toast.tsx` (`destructive`) — those keys already existed in `colors.light`, so the fallbacks were always dead code, not active bugs. Clean up in Step 5's hygiene pass (AUDIT 2.10). Also left `dropdown_menu.tsx`'s pre-existing close-animation issue alone (`if (!isOpen) return null` unmounts the `Modal` immediately when `isOpen` flips false, before `handleClose`'s scale/opacity-out animation can play) — this bug existed before the ref fix and is unrelated to it; worth a note for whoever does further Dropdown work, but out of scope for "the 6 bugs."

**Exit criteria for Step 1 — met:** every component in `packages/ui/components` renders without throwing (no more missing `Text` import), and the specific broken interactions (FAB label, AlertDialog/DatePicker button text + destructive variant, Alert color tokens, OTP focus-snap typo, Dropdown anchor position, Select single-mount) are fixed. **Not yet independently smoke-tested against the demo app** — there is no test suite yet (that's Step 5), so verification here was read-through/reasoning-based, not an actual run. Whoever picks this up next should sanity-check these in the demo app (`demo/`) before building on top, especially the Dropdown reposition logic and the Select children-splitting, since both involve non-trivial control flow changes.

---

## Step 2 — `usePressPhysics` + `BrutalSurface` primitive

Ref: prior conversation turn ("the tactile-press system"). Goal: replace the ~10 hand-copied press-animation blocks and ~17 hand-copied shadow/border surface blocks with two shared primitives.

### `usePressPhysics(config)` hook — ✅ built (`packages/ui/lib/usePressPhysics.ts`)
- Replaces every component's own `useSharedValue` + `withTiming(..., {duration, easing: quad})` press handling.
- Uses `withSpring` (`{ damping: 15, stiffness: 400, mass: 0.5 }`) so press reads as a snap/impact with rebound, not a linear slide.
- Animates translate-into-shadow *and* squash (`scaleX`/`scaleY`, ±3% inverse) so the surface visibly compresses, not just slides.
- Animates the shadow layer too — it translates 40% as far as the foreground and fades opacity slightly, so the whole block reads as compressing rather than a static shadow the foreground slides over.
- Haptics: `expo-haptics` `impactAsync(Light)` on press-in, wrapped in `.catch(() => {})` since haptics can reject on unsupported platforms (web, some Android devices). `expo-haptics` wasn't previously a dependency anywhere in the repo — added to `demo/package.json`. The demo has since been bumped to Expo SDK 57 (`npx expo install expo@^57.0.0 && npx expo install --fix`), which resolved `expo-haptics` to `~57.0.3`; confirmed via `npm install` (669 packages, no missing-peer errors on this package).
- Return shape: `{ pressed, animatedSurfaceStyle, animatedShadowStyle, handlePressIn, handlePressOut }`. `pressed` (the raw shared value) is exposed for components that need to derive their own animated style off the same timing — e.g. `ListItem`'s background-color flash and `RadioGroupItem`'s squash-only feedback, both of which don't use the shadow-block translate at all.

### `BrutalSurface` primitive component — ✅ built (`packages/ui/components/brutal_surface.tsx`)
- Encapsulates: absolutely-positioned shadow block (offset, border, color) + `zIndex:2` foreground surface (border, background) + wiring to `usePressPhysics` when pressable.
- Props: `offset` (default 4), `borderWidth` (`standard`/`heavy`/`extraHeavy`, default `heavy`), `borderRadius` (default 0 — real-brutalism square corners; only the documented circle exceptions pass 999), `pressable` (default true — skips physics wiring when false), `hasShadow` (default true — separate from `pressable`, since some variants/states like `Button`'s `outline` or a disabled control drop the shadow block entirely rather than just freezing it), `disabled` (typed `boolean | null` to match `PressableProps`, so consumers can spread props straight through), `haptics`, `backgroundColor`/`borderColor`/`shadowColor`, `style` (outer wrapper), `surfaceStyle` (foreground — accepts a Reanimated animated-style object too), `shadowStyle` (shadow layer — same, for shadows driven by something other than press, e.g. focus).

**Migration status — all components in both plan batches are done:**
- `[x]` **`Button`** — straight swap onto `BrutalSurface`; `hasShadow` now drives what `showShadow` used to.
- `[x]` **`Card`** (pressable variant) — `pressable={!!onPress}`; non-pressable cards render through the same primitive with `pressable={false}`.
- `[x]` **`Checkbox`** — uses `BrutalSurface` for the shadow/press physics, but still owns its own `useAnimatedStyle` for the checked-state background color interpolation and checkmark scale-in, passed through `surfaceStyle` as an animated-style object.
- `[x]` **`ListItem`** — **not** migrated onto `BrutalSurface`: a list row has no shadow block at all (flat, divider-bordered). Instead it calls `usePressPhysics` directly with `offset: 0` and uses the returned raw `pressed` value to drive its existing background-flash `interpolateColor`, so it still shares the spring timing without inheriting a shadow it never had.
- `[x]` **`FAB`** — straight swap, `offset: 6` (the existing elevated offset).
- `[x]` **`RadioGroupItem`** — **judgment call:** its circular shape (`borderRadius: 999` hack) doesn't fit `BrutalSurface`'s square hard-shadow model, so it was *not* migrated onto the primitive. It previously had **zero** press feedback at all (only a selection-state scale animation on the inner dot). Wired it onto `usePressPhysics` directly with `offset: 0` so it now gets a subtle squash-only tactile response on press, consistent with the rest of the library, without forcing a square shadow onto a circle. Flagged here since a future session might reasonably ask "why isn't this using BrutalSurface" — this is why.
- `[x]` **`Switch` thumb** — the thumb itself is decorative (the track owns `onPress`), so it now renders through `BrutalSurface` with `pressable={false}` — replaces the old manually-duplicated `thumbShadow` + `thumbSurface` static blocks. The track's own tap toggle and thumb-slide animation are untouched.
- `[x]` **`Badge`** — `pressable={false}`, `hasShadow={withShadow}`, `offset: 2`, `borderWidth: 'standard'`.
- `[x]` **`Avatar`** — **circle exception**, same reasoning as `RadioGroupItem` but this time `BrutalSurface` *does* support it: added a `borderRadius` prop to the primitive (default 0) and pass `999` here. `hasShadow={withShadow}`.
- `[x]` **`Input`** — its hard shadow reveals on *focus*, not press, so `pressable={false}` and the focus-driven `useAnimatedStyle` (unchanged logic) is passed in via the new `shadowStyle` prop instead of being hand-rolled. Border width still snaps standard→heavy on focus, passed straight through the `borderWidth` prop.
- `[x]` **`Dialog`** (`DialogContent`) — `offset: 8`, `borderWidth: 'extraHeavy'` (was a raw `4`, which is exactly `borderWidths.extraHeavy` — confirmed before mapping it), `pressable={false}`. The existing scale+opacity entrance animation stays on the outer `Animated.View` wrapper, untouched.
- `[x]` **`Sheet`** — **judgment call, no code change:** re-read `sheet.tsx` specifically looking for the shadow-offset block and there isn't one — the panel uses plain borders (heavy sides, extra-heavy top) with no diagonal hard-shadow layer at all. Nothing here matches what `BrutalSurface` unifies, so it's intentionally left alone rather than forcing a shadow onto a component that was never designed with one.
- `[x]` **`Toast`** — it's tap-to-dismiss (`Pressable` wrapped the whole card already), so it now gets full press physics via `BrutalSurface` (`onPress={hideToast}`), not just the static shadow. The slide-in/out `translateY` animation stays on the outer `Animated.View`.
- `[x]` **`Progress`** — `pressable={false}`, `hasShadow={withShadow}`, `offset: 4`, `borderWidth: 'heavy'`; the fill-width animation is untouched, just nested inside the primitive's track surface.
- `[x]` **`Slider` thumb** — same pattern as `Switch` thumb: decorative-only (`pressable={false}`), the `GestureDetector`/pan-driven drag stays on the outer `Animated.View`.
- `[x]` **`Tabs` list** — `pressable={false}`, `offset: 4`, `borderWidth: 'heavy'`; one gotcha worth flagging for future edits — `TabsList`'s wrapper needed *extra* bottom margin beyond the shadow clearance (`SHADOW_OFFSET + spacing.md`), and since the caller's `style` prop is applied *after* `BrutalSurface`'s own offset-based margin in the style array, the caller has to restate the offset itself rather than just adding to it (a plain `marginBottom: spacing.md` would have silently overwritten, not added to, the shadow clearance).
- `[x]` **`InputOTP` blocks** — this is where the **Step 1 hooks-in-a-loop deferral gets resolved**. The old code called `useSharedValue`/`useAnimatedStyle` inside `Array.from(...)` and inside a `renderBlocks()` loop — a Rules-of-Hooks violation that would throw ("Rendered more hooks than during the previous render") if `length` ever changed after mount. Fixed by extracting a real `OTPBlock` sub-component that owns its own `focusProgress` shared value and both animated styles; the parent now just renders `length` `<OTPBlock key={i} .../>` instances. Each block is its own component instance, so React tracks its hooks independently — mounting/unmounting a block when `length` changes is now safe by construction, not just untested. The shadow-only-on-active-block behavior (resting blocks show no shadow at all, not just a frozen one) is preserved via the new `shadowStyle` prop.

**Type-checked, not yet run on device.** `npx tsc --noEmit` was run against the real installed dependencies (temporarily junctioning `packages/ui/node_modules` → `demo/node_modules` to work around the fact that `packages/ui` isn't an npm workspace yet — that junction was removed after, it's not a real fix and shouldn't be recreated outside of ad hoc verification; making this resolve properly is Step 5's job). One real bug surfaced and was fixed: `FAB` spreads `PressableProps` (whose `disabled` can be `null`) onto `BrutalSurface`, whose `disabled` prop only accepted `boolean` — widened to `boolean | null`. Every other type error from that run (a `cn()` utility signature that doesn't accept `StyleProp` arrays, a couple of RN-0.86 accessibility-role/event-type signature changes from the SDK 57 bump, `StyleSheet.absoluteFillObject` → `absoluteFill` rename) is pre-existing and unrelated to this migration — confirmed by checking they also fire on files this session never touched. Still not run in an actual Expo Go client/simulator — visually verify before shipping, especially: Checkbox's animated-style-through-`surfaceStyle` plumbing, the Switch/Slider thumb sizing math, and the InputOTP per-block shadow fade.

**Exit criteria for Step 2 — met.** One primitive file owns the shadow/border pattern, one hook file owns the press physics, and every component that used to hand-roll either now imports from the shared source (or, for the three documented judgment calls — `ListItem`, `RadioGroupItem`, `Sheet` — was deliberately left out with a stated reason). No behavioral regression vs. Step 1's fixed baseline, verified by type-check; not yet verified visually on-device.

---

## Step 3 — Theming / dark-mode wiring

Ref: AUDIT 2.8, 2.14. Every component currently reads `colors.light.*` directly; `colors.dark` exists and is dead.

- `[ ]` Add `ApexRNProvider` (context) + `useTheme()` hook exporting the active `ColorScheme` (light or dark) and a way to force/override it, plus `system` mode via `useColorScheme()` from `react-native`.
- `[ ]` Wire `BrutalSurface` (and any component not yet migrated onto it) to pull colors from `useTheme()` instead of the static import. Since Step 2 centralized most color-touching surface code into `BrutalSurface`, this should mostly be a one-place change — components that still read `colors.light` directly for text/icon colors (labels, titles, etc.) need the same treatment.
- `[ ]` Confirm `demo/src/context/ThemeContext.tsx` either gets replaced by the library's own `ApexRNProvider`, or is updated to drive it — right now the demo has its own disconnected theme toggle that does nothing to real components; don't end up with two competing theme systems.
- `[ ]` Decide whether `spacing`/`typography`/`borderWidths`/`shadowOffset` also need to vary by theme (unlikely) or stay theme-independent (likely) — document the answer here once decided.

**Exit criteria for Step 3:** toggling theme (via the demo app, or system dark mode) visibly re-colors every component with no per-consumer manual overrides needed.

---

## Step 4 — Real-brutalism token pass

Ref: AUDIT Section 1 (design decision), and prior conversation turn recommending Option A/C (drop the neo-brutalist candy palette; monochrome + one functional ink color; keep radius-0 hard borders; drop or mute the colored offset shadow to a thin monochrome line).

- `[ ]` **Decision to make explicitly before coding:** confirm Option A (single "real brutalism" theme, palette overhaul) vs. Option C (dual theme — keep neo-brutalist as one selectable theme, add a second "classic brutalist" theme, consumer picks via `ApexRNProvider`). Step 3's theming layer makes Option C real work, not just a nice idea — record the decision here once made, don't leave it implicit in a commit.
- `[ ]` Update `lib/colors.ts` tokens accordingly (this is the file every component already reads through the Step 3 theme layer, so the blast radius should be small if Steps 2–3 were done properly).
- `[ ]` Revisit `warning`/`success` semantic tokens added ad hoc in Step 1 (`alert.tsx`) — give them real, deliberate values consistent with whichever palette direction is chosen, not leftover hex fallbacks.
- `[ ]` Re-check every component visually in the demo app after the token swap — some hardcoded assumptions (e.g. "primary is red so destructive-adjacent text needs to be white") may not hold under a monochrome palette.

**Exit criteria for Step 4:** the demo app, screenshotted, reads as genuinely distinct from generic neo-brutalist shadcn clones — not just "same shadows, different hex codes."

---

## Step 5 — CLI / registry packaging

Ref: AUDIT Section 3, and prior conversation turn recommending a shadcn-style registry model over a plain npm package (RN devs want to own/tweak visual component source, not depend on a black box).

- `[ ]` Add `packages/ui/package.json`, `index.ts` barrel, `tsconfig.json`, declare peer deps (`react`, `react-native`, `react-native-reanimated`, `react-native-svg`, `react-native-gesture-handler`).
- `[ ]` Rename files to a consistent kebab-case convention (`Input.tsx`→`input.tsx`, `dropdown_menu.tsx`→`dropdown-menu.tsx`, `floating_action_button.tsx`→`floating-action-button.tsx`, `listitem.tsx`→`list-item.tsx`, `radiogroup.tsx`→`radio-group.tsx`, `alertdialog.tsx`→`alert-dialog.tsx`, `input_otp.tsx`→`input-otp.tsx`) — do this as its own isolated commit, separate from behavioral changes, so history stays readable.
- `[ ]` Delete `components/test.tsx` (scratch file, not real API surface).
- `[ ]` Build `registry.json` manifest per component (files, deps, tokens used) + a minimal CLI (`npx apexrn add button` or similar) that copies source into a consumer repo and patches their theme file.
- `[ ]` Also publish the package to npm as a normal dependency option, for consumers who want that instead of copy-in.
- `[ ]` Add baseline tooling that should have existed from day one: ESLint (would have caught the unused-import "template compliance" dead code and the FAB missing-import crash at lint time instead of runtime), a handful of smoke tests per component (React Native Testing Library — "renders without throwing" would have caught 4 of the 6 Step 1 bugs immediately), and CI running both.

**Exit criteria for Step 5:** a developer can either `npx apexrn add button` into a fresh RN/Expo app, or `npm install @apexrn/ui`, and get a working, typed, themed component with no manual setup beyond installing the declared peer deps.

---

## Notes for whoever picks this up next

- This plan intentionally does not touch the palette/shadow decision (Step 4) until Steps 1–3 are done, because Step 2's primitive and Step 3's theme layer are the actual leverage points — changing tokens before they exist just means redoing the token edit twice.
- `design/AUDIT.md` has full file-and-line detail for every bug referenced here by section number (e.g. "AUDIT 2.5") — read it before starting a step if the one-line summary above isn't enough context.
- Update the status checkboxes and add dated notes under each step as work lands, so this file stays an accurate log, not just a plan.
