# ApexRN — Refactor Plan

Companion to `design/AUDIT.md` (the diagnosis). This is the plan of record: what we're doing, in what order, and why. Keep this file updated as steps complete — it's the context handoff for any session (human or agent) picking this up cold.

**Status key:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## Suggested order (locked in)

1. `[x]` Fix the 6 crash/logic bugs — done
2. `[x]` Build `usePressPhysics` + `BrutalSurface` primitive — done
3. `[x]` Wire theming/dark-mode through it — done
4. `[x]` Decide and apply the real-brutalism token pass — done
5. `[x]` CLI/registry packaging & workspace setup — done

---

## Step 1 — Fix the 6 crash/logic bugs — ✅ DONE

Ref: `design/AUDIT.md` Section 2.
- `[x]` **`floating_action_button.tsx`** — missing `Text` import fixed.
- `[x]` **`alertdialog.tsx` / `datepicker.tsx`** — fixed `label` -> `title` prop mismatch, added destructive button variant.
- `[x]` **`alert.tsx`** — added real `warning` and `success` tokens to theme.
- `[x]` **`input_otp.tsx`** — fixed double `.value` bug and extracted `OTPBlock` to resolve Rules-of-Hooks violation.
- `[x]` **`dropdown_menu.tsx`** — restructured trigger position measurement and exit animation flow.
- `[x]` **`select.tsx`** — fixed double mounting by splitting trigger and content children.

---

## Step 2 — `usePressPhysics` + `BrutalSurface` primitive — ✅ DONE

- `[x]` **`usePressPhysics` hook** (`packages/ui/lib/usePressPhysics.ts`): tactile physics with spring animation and haptic feedback.
- `[x]` **`BrutalSurface` component** (`packages/ui/components/brutal_surface.tsx`): unified brutalist shadow and surface container.
- `[x]` Migrated Button, Card, Checkbox, FAB, Switch, Badge, Avatar, Input, Dialog, Toast, Progress, Slider, Tabs, InputOTP to `BrutalSurface`.

---

## Step 3 — Theming / dark-mode wiring — ✅ DONE

- `[x]` Added `ApexRNProvider` context and `useTheme()` hook in `packages/ui/lib/theme.tsx`.
- `[x]` Wired `useTheme()` into `BrutalSurface` and across all 29 components in `packages/ui/components/`.
- `[x]` Integrated `demo/src/context/ThemeContext.tsx` with `ApexRNProvider` so toggling theme in demo instantly updates all components.

---

## Step 4 — Real-brutalism token pass — ✅ DONE

- `[x]` Standardized `ColorScheme` interface in `packages/ui/lib/colors.ts`.
- `[x]` Provided high-contrast Brutalist theme values for both light and dark modes with complete semantic tokens (`warning`, `success`, `destructive`, `accent`, `primary`, `secondary`).

---

## Step 5 — Packaging & Architecture — ✅ DONE

- `[x]` Created `packages/ui/package.json`, `packages/ui/tsconfig.json`, and `packages/ui/index.ts` barrel export.
- `[x]` Created kebab-case module aliases (`input.tsx`, `dropdown-menu.tsx`, `floating-action-button.tsx`, `input-otp.tsx`, `alert-dialog.tsx`, `date-picker.tsx`, `list-item.tsx`, `radio-group.tsx`, `brutal-surface.tsx`).
- `[x]` Resolved all TypeScript compilation errors across the entire codebase (`npx tsc --noEmit` passes with 0 errors).

---

## Step 6 — Production hardening pass — ✅ DONE

Strict `tsc --noEmit` (with `noUnusedLocals`/`noUnusedParameters`) passes with
0 errors in both `packages/ui` and `demo`; `npx expo export --platform web`
bundles clean (861 modules); `@apexrn/ui` resolves with types via the
`exports` map (`file:../packages/ui` linked in demo).

- Shared primitives: fixed `tsconfig` (bundler resolution, excludes
  `node_modules`), fixed `UsePressPhysicsOptions` export mismatch, typed `cn`
  (view/text/image styles, no `any`), memoized theme value + fixed
  toggle-from-`system`, lazy window metrics + live spacing/typography getters
  + font-scale-aware `normalize`, visible dark-mode shadow token, rewrote
  `BrutalSurface` (typed surface/shadow styles incl. animated styles,
  non-pressable path now forwards a11y/testID/layout props via `Animated.View`,
  nullable `disabled`, Android elevation, typed press events).
- Simple components: Button (event-typed `onPress`, hint, `StyleProp`),
  Card (hint, `StyleProp`), Badge (`children` support, ellipsize), Avatar
  (`src`-change recovery, correct labels), Label (unchanged — verified),
  Separator (vertical stretch, removed `any`), Input (typed focus events,
  stuck-focus reset, `surfaceStyle` + `onTrailingIconPress`, removed invalid
  padding shorthand), Textarea (targets `inputStyle`/`surfaceStyle`,
  enforced multiline, top alignment), Checkbox/Radio (48px targets, `hitSlop`,
  hook-order fix), Switch (derived travel 28px, disabled-wins ordering),
  Slider (NaN guards, shared travel distance, drag-gating, tap-to-seek,
  full-track gestures, AT increment/decrement), Progress (finite guards,
  clamped a11y value), Skeleton (compositor `translateX` sweep, `paused`
  cancels + unmounts swipe, no forced full width), Marquee (speed/empty
  guards, container-derived repetitions, single-announcement a11y),
  ListItem (disabled-wins ordering, conditional `button` role, typed events),
  FAB (extended-label pill, `disabled`/`size`/`hitSlop`, elevation),
  Carousel (generic `<T>`, `useWindowDimensions`, snap-without-paging,
  momentum-settled index, `keyExtractor`, hidden decorative dots),
  InputOTP (SMS autofill props, valid roles, responsive `blockSize`,
  focus-threshold fix, single-announcement a11y).
- Complex components: Dialog (chained `asChild` onPress, `[open]`-only
  effect, positioned/elevated content, `accessibilityViewIsModal`),
  AlertDialog (dead-code removal, alert semantics), Sheet (`sheetHeight` with
  `PointHeight` alias, `KeyboardAvoidingView`, directional pan, animation-wins
  style order), Dropdown (ref-free `asChild` measuring wrapper, chained
  handlers, clamped `useWindowDimensions` positioning, `menu`/`menuitem`
  roles), Select (proper trigger props with forwarded focus + live `expanded`,
  fragment-aware slot splitting, scrolling content, `menuitem`+`selected`),
  DatePicker (local-date formatting + exported `formatLocalDate`, calendar
  syncs to selected month on open, same trigger/splitting fixes, `button` day
  cells, labeled nav buttons), Accordion (`defaultValue`, typed
  `onValueChange`, crash-proof trigger children, hidden-content a11y),
  Tabs (`StyleProp` triggers, `useRef` first-render, `keepMounted`).
- Packaging: `exports` map + `files` + versioned `peerDependencies`
  (incl. `worklets`/`expo-modules-core`), metrics + legacy
  `PressPhysicsConfig` alias exported from the barrel.
- Demo: `file:../packages/ui` dep + declared `react-native-svg`,
  `SafeAreaProvider`/safe-area Layout, synced `StatusBar`, Android back-to-home,
  `keyboardShouldPersistTaps`, labeled controls, theme-driven screens,
  fixed Dialog/Dropdown/DatePicker/Sheet screens, `extraNodeModules` in Metro.
