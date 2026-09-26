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
