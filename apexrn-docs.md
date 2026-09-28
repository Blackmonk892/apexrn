# ApexRN — Complete Component Library Documentation

> **Version:** 1.0.0 (`@apexrn/ui`)
> **Scope:** everything a developer needs to understand, use, extend, and maintain the ApexRN UI component library.
> **Audience:** app developers consuming the library, contributors adding components, and maintainers.

---

## Table of Contents

1. [What ApexRN Is](#1-what-apexrn-is)
2. [Repository Map](#2-repository-map)
3. [Design Language](#3-design-language)
4. [Installation & Setup](#4-installation--setup)
5. [Quick Start](#5-quick-start)
6. [Theming](#6-theming)
7. [Design Tokens Reference](#7-design-tokens-reference)
8. [Architecture](#8-architecture)
9. [Hooks & Utilities Reference](#9-hooks--utilities-reference)
10. [Component Reference](#10-component-reference)
    - [10.1 Surfaces & Actions](#101-surfaces--actions) — BrutalSurface, Button, FAB
    - [10.2 Form Inputs](#102-form-inputs) — Input, Textarea, Label, Checkbox, Switch, RadioGroup, Slider, InputOTP
    - [10.3 Display](#103-display) — Card, Badge, Avatar, Alert, Progress, Skeleton, Separator, ListItem, Carousel, Marquee
    - [10.4 Feedback](#104-feedback) — Toast
    - [10.5 Overlays, Menus & Navigation](#105-overlays-menus--navigation) — Dialog, AlertDialog, Sheet, DropdownMenu, Select, DatePicker, Accordion, Tabs
11. [Composition Patterns](#11-composition-patterns)
12. [Import Paths & File-Naming Conventions](#12-import-paths--file-naming-conventions)
13. [Demo App Guide](#13-demo-app-guide)
14. [Accessibility Conventions](#14-accessibility-conventions)
15. [Performance Conventions](#15-performance-conventions)
16. [Backwards Compatibility & Deprecations](#16-backwards-compatibility--deprecations)
17. [Validation & QA](#17-validation--qa)
18. [Limitations & Roadmap](#18-limitations--roadmap)

---

## 1. What ApexRN Is

ApexRN (`@apexrn/ui`) is a **production-grade, neo-brutalist component library for React Native and Expo**. It provides 30 themeable UI components — from buttons and inputs to dialogs, sheets, dropdowns, and date pickers — sharing one visual language and one set of architectural primitives.

Key properties:

- **React Native first.** Built for Expo (SDK 57), Expo Router, React Native CLI, Android, iOS, and Web via `react-native-web`. Not a web kit ported to native.
- **Token-driven.** Colors, spacing, typography, borders, and shadows come from `lib/colors.ts` + `lib/metrics.ts`, switchable between light and dark schemes through `ApexRNProvider`.
- **One shared surface primitive.** Every "blocky" component renders through `BrutalSurface`, so the brutalist shadow/border treatment is defined once, not copy-pasted.
- **Strict TypeScript.** `strict`, `noUnusedLocals`, `noUnusedParameters`. No `any` in public APIs.
- **Predictable state.** Controlled/uncontrolled behavior follows one convention (see [8.5](#85-controlleduncontrolled-convention)).
- **Accessible defaults.** Roles, states, labels, live regions, and 44px touch targets are built in, not bolted on.
- **Peer-dependency-light.** React, React Native, Expo haptics, Reanimated, Gesture Handler, and SVG are peers — the library adds no other runtime dependencies.

---

## 2. Repository Map

```
apexrn/
├── apexrn-docs.md              # this file
├── README.md                   # marketing / overview readme
├── package.json                # private workspace root
├── design/
│   ├── AUDIT.md                # historical diagnosis (read-only reference)
│   └── REFACTOR.md             # refactor log / status handoff
├── packages/
│   └── ui/                     # ← the library (@apexrn/ui)
│       ├── index.ts            # barrel export (public API surface)
│       ├── package.json        # name, exports map, files, peerDependencies
│       ├── tsconfig.json       # strict library tsconfig
│       ├── lib/
│       │   ├── colors.ts       # ColorScheme, light/dark palettes, spacing,
│       │   │                   # typography, borderWidths, shadowOffset
│       │   ├── metrics.ts      # scale/verticalScale/moderateScale/normalize,
│       │   │                   # screenWidth/screenHeight
│       │   ├── theme.tsx       # ApexRNProvider, useTheme, ThemeMode
│       │   ├── usePressPhysics.ts # press spring + haptics hook
│       │   └── utils.ts        # cn() style merger
│       └── components/         # 30 components (snake_case implementations)
│           ├── brutal_surface.tsx, button.tsx, card.tsx, input.tsx, ...
│           └── <kebab-case>.tsx # 1-line re-export aliases (8 files)
└── demo/                       # Expo showcase app (consumer example)
    ├── App.tsx                 # screen router + providers
    ├── app.json, babel.config.js, metro.config.js
    ├── package.json            # includes "@apexrn/ui": "file:../packages/ui"
    └── src/
        ├── components/Layout.tsx
        ├── context/ThemeContext.tsx
        └── screens/            # one screen per component + batch screens
```

**Module layout inside `packages/ui`:**

| Layer | Files | Depends on |
|---|---|---|
| Tokens | `lib/colors.ts`, `lib/metrics.ts` | `react-native` only |
| Theme | `lib/theme.tsx` | tokens |
| Motion | `lib/usePressPhysics.ts` | Reanimated, expo-haptics |
| Style helper | `lib/utils.ts` (`cn`) | `react-native` |
| Primitive | `components/brutal_surface.tsx` | tokens, theme, motion |
| Components | all others | primitive + layers above |
| Barrel | `index.ts` | everything |

Dependencies only ever point **downward** in this table. Components never import from each other except through documented composition (e.g. `Textarea` → `Input`, `AlertDialog` → `Dialog` + `Button`, `Select` → `Sheet` + `Input` + `ListItem`).

---

## 3. Design Language

ApexRN speaks **neo-brutalism** (the "Gumroad-core" idiom): loud, confident, tactile — while staying theme-driven so it never hardcodes a look consumers can't change.

The five non-negotiable visual rules:

1. **Thick black (or white, in dark mode) borders** — `2px standard`, `3px heavy`, `4px extraHeavy`. Radius is `0` everywhere by default.
2. **Hard offset shadows** — a solid border-colored block sits diagonally behind every surface (`2/4/6/8px` offsets). No blur, no gradients, no glassmorphism.
3. **Flat, high-contrast fills** — primary red `#FF5252`, secondary indigo `#3D5AFE`, accent yellow `#FFD600` on light; tuned variants on dark.
4. **Heavy uppercase type** — weight `800`, slight letter-spacing, uppercase for labels/titles/buttons.
5. **Tactile press physics** — every pressable surface sinks diagonally into its shadow with a stiff spring, a subtle squash, and a light haptic tick.

Motion spec (see `usePressPhysics`): spring `{ damping: 15, stiffness: 400, mass: 0.5 }`, squash `±0.03`, shadow drifts `0.4×` offset and fades `15%` at full press.

---

## 4. Installation & Setup

### 4.1 Install the package

```bash
npm install apexrn
# or
pnpm add apexrn
bun add apexrn
```

For local workspace development (as the demo does):

```json
{ "dependencies": { "@apexrn/ui": "file:../packages/ui" } }
```

### 4.2 Peer dependencies

The library declares these as peers — install the ones your app needs:

| Peer | Minimum | Used by |
|---|---|---|
| `react` | >=18.0.0 | everything |
| `react-native` | >=0.73.0 | everything |
| `expo` | >=50.0.0 | app runtime |
| `expo-haptics` | >=12.0.0 | press feedback (`usePressPhysics`) |
| `expo-modules-core` | >=1.0.0 | Expo modules |
| `react-native-gesture-handler` | >=2.0.0 | Slider, Sheet |
| `react-native-reanimated` | >=3.0.0 | press physics, sheets, dialogs, marquee, skeleton |
| `react-native-svg` | >=13.0.0 | Checkbox, Accordion, Select chevrons |
| `react-native-worklets` | >=0.2.0 | Reanimated 4 |

Your `GestureHandlerRootView` and Reanimated Babel plugin setup is the consumer's responsibility (the demo shows the standard wiring).

### 4.3 Provide the theme

Wrap your app once, near the root:

```tsx
import { ApexRNProvider } from '@apexrn/ui';

export default function Root() {
  return (
    <ApexRNProvider defaultMode="system">
      <App />
    </ApexRNProvider>
  );
}
```

Components also render **without** a provider (they fall back to the light scheme), so screens and tests never crash outside one — but you lose theme switching.

### 4.4 Package surface

`packages/ui/package.json` ships **source** (not compiled JS) with an `exports` map:

```json
{
  "main": "index.ts",
  "types": "index.ts",
  "exports": { ".": { "types": "./index.ts", "react-native": "./index.ts", "default": "./index.ts" } },
  "files": ["index.ts", "lib/**/*", "components/**/*"]
}
```

Metro and TypeScript (with `bundler` resolution) consume this directly — no build step required. Type-only imports (`import type { ButtonProps }`) resolve through the same map.

---

## 5. Quick Start

```tsx
import { ApexRNProvider, Button, Card, Input } from '@apexrn/ui';
import { useState } from 'react';

export default function App() {
  const [name, setName] = useState('');
  return (
    <ApexRNProvider defaultMode="system">
      <Card>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          accessibilityLabel="Your name"
        />
        <Button title="Say hi" variant="primary" onPress={() => console.log(name)} />
      </Card>
    </ApexRNProvider>
  );
}
```

---

## 6. Theming

### 6.1 `ApexRNProvider`

```tsx
interface ApexRNProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode; // 'light' | 'dark' | 'system', default 'light'
}
```

- `defaultMode="system"` follows the OS color scheme via React Native's `useColorScheme()` and updates live.
- `setMode()` / `toggleTheme()` switch at runtime; every themed component re-renders with the new palette — no per-component `style` overrides needed.
- The context value is **memoized**, so theme reads never cause unnecessary re-renders.

### 6.2 `useTheme()`

```tsx
const { mode, colorScheme, colors, setMode, toggleTheme, isDark } = useTheme();
```

| Field | Type | Meaning |
|---|---|---|
| `mode` | `ThemeMode` | requested mode (`light`/`dark`/`system`) |
| `colorScheme` | `'light' \| 'dark'` | resolved effective scheme |
| `colors` | `ColorScheme` | active palette (see §7) |
| `setMode` | `(mode) => void` | switch mode explicitly |
| `toggleTheme` | `() => void` | flip the *effective* scheme (system-aware) |
| `isDark` | `boolean` | `colorScheme === 'dark'` |

Outside a provider, `useTheme()` returns a safe light-scheme fallback with no-op setters (components keep working standalone).

### 6.3 Authoring theme-aware code

```tsx
function MyBlock() {
  const { colors, isDark } = useTheme();
  return <View style={{ backgroundColor: colors.background, borderColor: colors.border }} />;
}
```

Prefer palette roles (`primary`, `muted`, `destructive`…) over hex literals. Never read `colors.light.*` / `colors.dark.*` directly in components — always go through `useTheme().colors`.

---

## 7. Design Tokens Reference

All tokens live in `lib/colors.ts` (backed by `lib/metrics.ts`). `spacing` and `typography` are **live getters**: every access reads the *current* window dimensions, so rotation, foldables, and split-screen never use stale values. `normalize` additionally respects the user's font-scale setting (capped) and clamps runaway growth on tablets.

### 7.1 Color schemes

`ColorScheme` keys: `background`, `foreground`, `primary`, `primaryForeground`, `secondary`, `secondaryForeground`, `accent`, `accentForeground`, `muted`, `mutedForeground`, `destructive`, `destructiveForeground`, `warning`, `warningForeground`, `success`, `successForeground`, `border`, `shadow`.

**Light:**

| Token | Value | Token | Value |
|---|---|---|---|
| background | `#FFFFFF` | foreground | `#000000` |
| primary / on-primary | `#FF5252` / `#FFFFFF` | secondary / on-secondary | `#3D5AFE` / `#FFFFFF` |
| accent / on-accent | `#FFD600` / `#000000` | muted / on-muted | `#F5F5F5` / `#757575` |
| destructive / on-destructive | `#D32F2F` / `#FFFFFF` | warning / on-warning | `#F59E0B` / `#000000` |
| success / on-success | `#2E7D32` / `#FFFFFF` | border / shadow | `#000000` / `#000000` |

**Dark:**

| Token | Value | Token | Value |
|---|---|---|---|
| background | `#1A1A1A` | foreground | `#FFFFFF` |
| primary / on-primary | `#FF6B6B` / `#FFFFFF` | secondary / on-secondary | `#536DFE` / `#FFFFFF` |
| accent / on-accent | `#FFEA00` / `#000000` | muted / on-muted | `#2A2A2A` / `#9E9E9E` |
| destructive / on-destructive | `#EF5350` / `#FFFFFF` | warning / on-warning | `#FFB300` / `#000000` |
| success / on-success | `#66BB6A` / `#000000` | border / shadow | `#FFFFFF` / `#FFFFFF` |

Note: the dark `shadow` is white so the offset-shadow motif stays visible on dark surfaces.

### 7.2 Spacing / typography / borders / shadows

```ts
spacing    = { xs, sm, md, lg, xl, '2xl', '3xl' }   // base 4/8/12/16/24/32/48
typography = { xs, sm, md, lg, xl, '2xl', '3xl', '4xl' } // base 12/14/16/18/20/24/32/40
borderWidths = { standard: 2, heavy: 3, extraHeavy: 4 }
shadowOffset = {
  subtle:   { width: 2, height: 2 },
  standard: { width: 4, height: 4 },
  elevated: { width: 6, height: 6 },
}
```

Base values assume a 375×812 reference phone and scale with the window (`moderateScale` for spacing, capped `normalize` for type).

### 7.3 Metrics functions (`lib/metrics.ts`)

| Function | Behavior |
|---|---|
| `scale(n)` | linear horizontal scale from window width |
| `verticalScale(n)` | linear vertical scale from window height |
| `moderateScale(n, factor = 0.5)` | damped scale (won't explode on tablets) |
| `normalize(n)` | font-size scale, font-scale-aware (capped at 1.3×), hard-capped at 1.6× base |
| `screenWidth()` / `screenHeight()` | current window dimensions (rotation-safe) |

All read `Dimensions.get('window')` **lazily per call** — safe across rotation and multi-window.

---

## 8. Architecture

### 8.1 The primitive: `BrutalSurface`

`components/brutal_surface.tsx` is the single implementation of the brutalist look. Every blocky component renders one instead of hand-rolling shadows.

```tsx
<BrutalSurface
  offset={4}                    // shadow travel in px
  borderWidth="heavy"           // 'standard' | 'heavy' | 'extraHeavy'
  pressable={true}              // false → non-interactive surface
  hasShadow={true}              // false → flat surface, no backing block
  disabled={false}
  haptics={true}
  backgroundColor={...}         // default: theme background
  borderColor={...}             // default: theme border
  shadowColor={...}             // default: theme shadow
  borderRadius={0}
  style={...}                   // outer wrapper
  surfaceStyle={...}            // foreground surface (accepts animated styles)
  shadowStyle={...}             // shadow layer (accepts animated styles)
  onPress={...}                 // + all other PressableProps
>
```

How it works:

- **Three layers:** outer positioning `View` → absolute shadow `Animated.View` (offset `top/left`, negative `right/bottom`) → foreground `AnimatedPressable` (or `Animated.View` when `pressable={false}`).
- **Press physics** come from `usePressPhysics({ offset, disabled, haptics })`; the surface sinks into the shadow, the shadow drifts `0.4×` and fades.
- **Non-pressable path forwards view-safe props** (accessibility role/label/state, `testID`, `onLayout`, etc.) — press-only handlers (`onPress`, `onLongPress`) are stripped so they can't silently no-op on a `View`.
- **Style priority** (later wins): base < theme colors < `surfaceStyle` < press animation. Consumer `style` targets only the outer wrapper — it can never break the surface/shadow geometry.
- Android gets matching `elevation` (`0` shadow / `2` surface) alongside `zIndex`.

### 8.2 Motion: `usePressPhysics`

```ts
const { pressed, animatedSurfaceStyle, animatedShadowStyle,
        handlePressIn, handlePressOut, handlePressCancel } = usePressPhysics({
  offset,        // px travel — must match the surface's shadow offset
  disabled,      // skips animation; auto-resets a stuck press if set mid-gesture
  haptics,      // light impact on press-in (default true)
  squash,       // ±0.03 compression feel (default true)
});
```

Wire `handlePressIn`/`handlePressOut` to the pressable's `onPressIn`/`onPressOut` **and** call through to any consumer handlers. `handlePressCancel` exists for gesture-interruption paths.

### 8.3 Style merging: `cn()`

```ts
cn(...styles) // accepts view/text/image styles, IDs, nested arrays, falsy
```

Unlike `Object.assign` merging, `cn` delegates to `StyleSheet.flatten`, preserving transform arrays and registered style IDs. It is fully typed (no `any`) and its return assigns to View, Text, and TextInput `style` props. Convention: `cn(base, themeOverrides, conditional && variant, consumerStyle)` — the consumer style is **always last**.

### 8.4 Props conventions

- `style` targets the **outer wrapper** unless the docs say otherwise (`Input`/`Textarea` additionally expose `inputStyle` for the `TextInput` and `surfaceStyle` for borders/backgrounds — use `surfaceStyle` for error states, not `style`).
- Components extending `PressableProps`/`ViewProps`/`TextInputProps` accept the usual `testID`, `accessibility*`, `onLayout`, etc. Where a function-style `style` makes no sense (outer wrapper is a `View`), `style` is redeclared as `StyleProp<ViewStyle>` — function styles are rejected at the type level.
- Event handlers receive the native event (`GestureResponderEvent`); `() => void` callbacks remain assignable.

### 8.5 Controlled/uncontrolled convention

- **Fully controlled:** `Checkbox` (`checked` + `onCheckedChange`), `Switch`, `RadioGroup` (`value` + `onValueChange`), `Slider` (`value` + `onValueChange`), `InputOTP` (`value` + `onChangeText`), `Tabs` (`value` + `onValueChange`).
- **Controlled open state:** `Dialog`/`AlertDialog` (`open` + `onOpenChange`, optional — uncontrolled when omitted), `Sheet`/`DropdownMenu` (`open` + `onOpenChange`, required).
- **Uncontrolled with `defaultValue`:** `Accordion` (`value`/`defaultValue` + `onValueChange`; single mode emits a string, multiple mode a string array).
- Parents echoing values back mid-gesture never fight animations (Slider gates on drag state; animated values reset when `disabled` flips).

### 8.6 Ref forwarding

`Input`, `Textarea`, and `InputOTP` are `forwardRef<TextInput>` components — parents get the real `TextInput` (focus/blur/measure). Other components expose no refs; trigger/measurement internals are encapsulated.

---

## 9. Hooks & Utilities Reference

| Export | Source | Purpose |
|---|---|---|
| `ApexRNProvider`, `useTheme`, `ThemeMode`, `ThemeContextType` | `lib/theme` | theming (§6) |
| `colors`, `spacing`, `typography`, `borderWidths`, `shadowOffset`, `ColorScheme` | `lib/colors` | tokens (§7) |
| `scale`, `verticalScale`, `moderateScale`, `normalize`, `screenWidth`, `screenHeight` | `lib/metrics` | responsive scaling (§7.3) |
| `usePressPhysics`, `UsePressPhysicsOptions` (`PressPhysicsConfig` is a deprecated alias) | `lib/usePressPhysics` | press motion (§8.2) |
| `cn` | `lib/utils` | typed style merging (§8.3) |
| `formatLocalDate(date)` | `components/datepicker` | `YYYY-MM-DD` in **local** time (never use `toISOString().split('T')` for displayed dates — it's UTC and shows the wrong day west of Greenwich) |

---

## 10. Component Reference

Import everything from the barrel: `import { Button, Card } from '@apexrn/ui'`. Types are exported alongside (`import type { ButtonProps }`).

Legend: `*` = required. Defaults in **bold**. All components accept the standard React Native props of their base (`testID`, `accessibility*`, `onLayout`, …) unless noted.

### 10.1 Surfaces & Actions

#### `BrutalSurface` (primitive)

The building block (§8.1). Use it directly for custom brutalist blocks; set `pressable={false}` + `hasShadow` as needed. Default export; `BrutalSurfaceProps` extends `PressableProps`.

#### `Button`

Pressable brutalist button with loading and icon support.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` * | `string` | — | label text |
| `onPress` | `(e) => void` | — | |
| `variant` | `'default' \| 'primary' \| 'outline' \| 'destructive'` | `'default'` | `outline` is flat/transparent |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | padding + font scale |
| `disabled` | `boolean` | `false` | muted, no shadow/animation |
| `loading` | `boolean` | `false` | spinner replaces content; implies disabled |
| `icon` / `iconPosition` | `ReactNode` / `'left' \| 'right'` | — / `'left'` | |
| `style` | `StyleProp<ViewStyle>` | — | outer wrapper |
| `accessibilityLabel` / `accessibilityHint` | `string` | title / — | role `button`, `disabled` state announced |

```tsx
<Button title="Delete" variant="destructive" loading={saving} onPress={remove} />
```

#### `FAB` — floating action button

Circular icon button by default; becomes an extended pill when `label` is provided (text is never clipped). Absolutely positioned bottom-right out of the box — override `style` for inline use.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | — | when present, pill mode |
| `children` | `ReactNode` | — | icon element (icon mode) |
| `disabled` | `boolean` | `false` | muted, shadow off |
| `size` | `number` | `56` | diameter (icon mode) / min-height (pill) |
| `style` | `StyleProp<ViewStyle>` | absolute BR | override freely |

### 10.2 Form Inputs

All text fields support `ref`, `disabled` (muted + non-editable + stuck-focus reset), theme placeholder color, and `accessibilityState={{ disabled }}`.

#### `Input`

Single-line field: `leadingIcon` / `trailingIcon` décor, optional tappable trailing icon, and separate style targets.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `leadingIcon` / `trailingIcon` | `ReactNode` | — | décor inside the surface |
| `onTrailingIconPress` | `() => void` | — | wraps trailing icon in a button (hitSlop 8) |
| `disabled` | `boolean` | `false` | |
| `inputStyle` | `StyleProp<TextStyle>` | — | the `TextInput` itself |
| `surfaceStyle` | `StyleProp<ViewStyle>` | — | borders/background — **use for error states** |
| `style` | — | — | outer wrapper only |

```tsx
<Input value={q} onChangeText={setQ} placeholder="Search"
  trailingIcon={<SearchIcon />} onTrailingIconPress={submit}
  surfaceStyle={error ? { borderColor: colors.destructive } : undefined} />
```

Focus behavior: border goes `standard` → `heavy` and the shadow fades in via an animated progress value. Disabling mid-focus resets focus state.

#### `Textarea`

Multiline `Input` with invariants enforced: always `multiline`, top-aligned text, `minHeight: 100` on the `TextInput` (not the wrapper). Accepts `inputStyle` / `surfaceStyle` like `Input`.

#### `Label`

Uppercase themed form label (`TextProps` + `disabled?`). Pair with an input's `accessibilityLabel` — screen readers need the explicit link:

```tsx
<Label>Email</Label>
<Input accessibilityLabel="Email" keyboardType="email-address" />
```

#### `Checkbox` — controlled

24px visual box with an **expanded ~44px touch target** (`hitSlop`, default `10`). Animated check draw + fill. `role="checkbox"` with `{ checked, disabled }` state. Always pass `accessibilityLabel`.

```tsx
<Checkbox checked={agree} onCheckedChange={setAgree} accessibilityLabel="Accept terms" />
```

#### `Switch` — controlled

56×32 track, thumb travel derived from geometry (28px), animated track color. Disabled styling wins over the animation (a disabled-ON switch reads muted, not primary). `role="switch"`, default `hitSlop={8}`. Always pass `accessibilityLabel`.

#### `RadioGroup` / `RadioGroupItem` — controlled

```tsx
<RadioGroup value={flavor} onValueChange={setFlavor} disabled={false}>
  <RadioGroupItem value="vanilla" accessibilityLabel="Vanilla" />
</RadioGroup>
```

Items are 24px circles with 48px targets (`hitSlop` default `12`), animated dot, `role="radio"` + `{ checked, disabled }`. Items outside a group throw a clear error. Hooks live in an inner component so the missing-context guard never violates hook order.

#### `Slider` — controlled

Pan-anywhere-on-track gesture (plus tap-to-seek), snap-to-`step` on release, `onValueChange` fires once per gesture (on end). Degenerate configs (`max <= min`, `step <= 0`, non-finite) collapse to no-ops instead of `NaN`. Rotation-safe (travel distance is a shared value), drag-gated (parent echoes don't fight the thumb), and screen-reader adjustable via increment/decrement actions.

| Prop | Type | Default |
|---|---|---|
| `value` * / `onValueChange` * | `number` / `(v: number) => void` | — |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` |
| `disabled` | `boolean` | `false` |

#### `InputOTP` — controlled

Fixed-length code entry: one hidden accessible `TextInput` (SMS autofill via `textContentType="oneTimeCode"` + `autoComplete="sms-otp"`) driving per-digit `OTPBlock` surfaces (each owns its hooks — no hooks-in-loop). Blocks shrink to fit narrow screens (`blockSize` overrides, min 32). The blocks row is decorative for assistive tech; the hidden input announces `"One-time password input, X of N digits entered"`.

```tsx
<InputOTP length={6} value={code} onChangeText={setCode} ref={otpRef} />
```

### 10.3 Display

#### `Card` / `CardHeader` / `CardFooter`

```tsx
<Card variant="primary" onPress={open} accessibilityLabel="Open pricing">
  <CardHeader><Text>Pro plan</Text></CardHeader>
  <Text>$9/mo</Text>
  <CardFooter><Button title="Choose" /></CardFooter>
</Card>
```

`variant`: `'default' | 'primary' | 'accent'`. Providing `onPress` makes the whole card pressable (`role="button"` + hint). Header/footer carry their own dividers and padding; plain children get body padding from the card.

#### `Badge`

Pill with `variant: 'default' | 'primary' | 'outline' | 'accent'`, optional 2px `withShadow`. `label?: string` for the common case, `children?` for custom content (children win), single-line ellipsis, `role="text"` with a `Badge: …` announcement.

#### `Avatar`

Image with initials fallback (`sm 40 / md 56 / lg 80`). `src` changes reset a failed load so a fixed URL recovers; empty/missing initials fall back to `?`. Announces `"Avatar for XY"` on fallback, `"Avatar image"` for photos; inner image is hidden from screen readers to avoid double announcement. `withShadow` toggles the offset block.

#### `Alert`

Severity banner (`variant: 'default' | 'destructive' | 'warning' | 'success'`) with a colored left rule, optional decorative icon (hidden from screen readers), and a combined `"title. description"` announcement via `role="alert"`. Description uses `mutedForeground` for hierarchy. Renders through `BrutalSurface` (non-pressable).

#### `Progress`

Determinate bar (`value`/`max`, clamped, `NaN`/`max <= 0` safe), optional shadow, animated fill, `role="progressbar"` with clamped `{ min, max, now }`. Non-pressable `BrutalSurface` still forwards role/value/testID props.

#### `Skeleton`

Loading placeholder with a compositor-thread shimmer (`translateX`, no layout thrash). `paused` cancels the animation, unmounts the swipe, and flips `busy` to false. Defaults to full width — override `style` for avatar/chip sizes (no forced minimums).

#### `Separator`

Hairline rule: `orientation: 'horizontal' | 'vertical'`. Vertical uses `alignSelf: 'stretch'` so it never collapses in height-less parents. Hidden from assistive tech.

#### `ListItem`

Full-width pressable row: `title*`, `description?`, `leading?`, `trailing?`. Pressable role only when `onPress` exists; disabled styling wins over the press animation. Used internally by `DropdownMenuItem` and `SelectItem`.

#### `Carousel<T>` — generic

Snap (not paging — `pagingEnabled` would override the snap physics on iOS) peek-and-settle list with momentum-settled `activeIndex`.

```tsx
<Carousel
  data={items}
  renderItem={({ item }) => <PromoCard {...item} />}
  keyExtractor={(item) => item.id}
  showIndicators
  onActiveIndexChange={setPage}
/>
```

`itemWidth` defaults to 80% of the **live** window (rotation-safe). Dots are decorative; the container announces `"Carousel, item X of N"` with an `adjustable` role.

#### `Marquee`

Infinite text ticker (`speed` in px/sec, default `60`; `divider` default `"   •   "`). Repetition count derives from container width (no gaps, no over-render); `speed <= 0` and empty text park the animation instead of freezing. The repeated track is hidden from screen readers — the outer `role="text"` label announces once.

### 10.4 Feedback

#### `Toast`

Top-anchored auto-dismiss banner (`duration` default `3000`, slide/spring in, slide out). `variant: 'default' | 'primary' | 'destructive'`. Dismiss by tap (button semantics + hint) or timeout; `onDismiss*` is ref-stabilized so parent re-renders never restart the timer. Hidden toasts are pointer-transparent **and** removed from the accessibility tree (`role="alert"`, assertive live region only while visible). Consumer `style` can never clobber the slide animation.

```tsx
<Toast visible={saved} title="Saved" description="Profile updated"
       onDismiss={() => setSaved(false)} />
```

### 10.5 Overlays, Menus & Navigation

All overlays render in `Modal`s with `accessibilityViewIsModal`, backdrop dismiss, and Android back-button dismiss.

#### `Dialog` family — controlled or uncontrolled

```tsx
<Dialog open={open} onOpenChange={setOpen}>      {/* or <Dialog> uncontrolled */}
  <DialogTrigger asChild>
    <Button title="Open" />                       {/* child onPress is chained, not dropped */}
  </DialogTrigger>
  <DialogContent onInteractOutside={...}>          {/* default: backdrop closes */}
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Body</DialogDescription>
    </DialogHeader>
    <DialogFooter>{/* actions */}</DialogFooter>
  </DialogContent>
</Dialog>
```

`DialogTrigger` without `asChild` renders its own `Pressable`. `asChild` clones **only** `onPress` into the child (chained with the child's own handler) — never refs or arbitrary props. Content scales/fades in, max-width 400, elevated above the backdrop on Android; consumer `style` can't kill the enter animation.

#### `AlertDialog` — opinionated confirm

`Dialog` pre-composed for destructive confirms: forced `outline` cancel + `destructive` action buttons, footer that wraps on small screens, backdrop taps intentionally ignored (Android back still dismisses — by platform convention), `role="alert"` with a combined label.

```tsx
<AlertDialog title="Delete file?" description="This cannot be undone."
  actionText="Delete" onAction={remove} onCancel={noop}>
  <Button title="Delete…" variant="destructive" />
</AlertDialog>
```

#### `Sheet` / `SheetContent` — bottom sheet

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  {({ handleDismiss }) => (
    <SheetContent sheetHeight={420}>
      {/* … */}
      <Button title="Done" onPress={handleDismiss} />
    </SheetContent>
  )}
</Sheet>
```

`sheetHeight` (default `400`); `PointHeight` is a deprecated alias. Vertical-only pan (`activeOffsetY`/`failOffsetX` discriminate against horizontal scrolls and text fields), velocity-aware dismiss, `KeyboardAvoidingView` for input sheets, decorative drag handle hidden from screen readers, and guaranteed unmount even if a parent ignores `onOpenChange(false)`.

#### `DropdownMenu` family — controlled

```tsx
<DropdownMenu open={open} onOpenChange={setOpen}>
  <DropdownMenuTrigger asChild>
    <Button title="Actions" />   {/* any pressable OR view child works */}
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem label="Rename" onPress={rename} />
  </DropdownMenuContent>
</DropdownMenu>
```

Positioning measures a wrapper around the trigger (never injects `ref` into arbitrary children — the classic crash with ref-less function components), clamps on-screen via live window dimensions, and falls back to a visible default when unmeasured. Trigger announces `expanded`; content uses a `menu` role; items are `menuitem`s that auto-close. Caller styles can't override the computed position.

#### `Select` family — single-select via sheet

```tsx
<Select value={fw} onValueChange={setFw}>
  <SelectTrigger placeholder="Choose a framework" />
  <SelectContent sheetHeight={350}>
    <SelectItem label="React Native" value="rn" />
  </SelectContent>
</Select>
```

Trigger renders a read-only `Input` with chevron inside a `combobox` pressable (live `expanded` state, focus/blur forwarded). Children split into trigger/content slots by identity + `displayName` + name, recursing into fragments. Content scrolls (`ScrollView`) so long lists never clip. Items are `menuitem`s with `selected` state.

#### `DatePicker` family

```tsx
<DatePicker value={date} onChange={setDate}>
  <DatePickerTrigger placeholder="Select a date" />
  <DatePickerContent />
</DatePicker>
```

Same trigger/slot architecture as `Select`. The calendar opens on the **selected** month (not always today) and re-syncs on every open; dates format in **local** time (`formatLocalDate`, exported); day cells are `button`s with `selected` state; month nav buttons are labeled for screen readers. Same fragment-aware splitting and focus forwarding as `Select`.

#### `Accordion` — single or multiple

```tsx
<Accordion type="multiple" defaultValue={['a']} onValueChange={...}>
  <AccordionItem value="a">
    <AccordionTrigger>Section A</AccordionTrigger>
    <AccordionContent>…</AccordionContent>
  </AccordionItem>
</Accordion>
```

Heights animate via measured layout; string triggers get the default heading style while element children render as-is (never force-mounted inside `Text`, which crashes for views); closed content is removed from the accessibility tree; chevron rotates with the open state.

#### `Tabs` family — controlled

```tsx
<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="one">Profile</TabsTrigger>
    <TabsTrigger value="two">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="one" keepMounted>…</TabsContent>
</Tabs>
```

Sliding indicator tracks measured trigger layouts (first paint snaps, later changes animate; StrictMode-safe plain ref). Triggers are `tab` roles with `selected`/`disabled`; content unmounts when inactive unless `keepMounted` (hidden visually + from assistive tech while preserving state).

---

## 11. Composition Patterns

**`asChild` triggers (Dialog, DropdownMenu).** Wrap your own pressable; its `onPress` is chained with the open/toggle handler. Children that can't accept `onPress` (plain `View`) won't fire — use `Pressable`.

**Slot splitting (Select, DatePicker).** `<XTrigger/>` renders inline, `<XContent/>` renders inside the sheet/modal. You can wrap either in fragments. For programmatic UIs, drive `Sheet`/`Dialog` directly instead.

**Render-prop sheets.** `<Sheet>{({ open, handleDismiss }) => …}</Sheet>` gives the dismiss action to footer buttons.

**Surface-first custom blocks.** Need a one-off brutalist panel? Compose `BrutalSurface` + `useTheme()` directly instead of copying shadow styles — that's the pattern every built-in component follows.

**Form rows.** Keep the visible label in `accessibilityLabel` on the control itself; sibling `<Text>` labels are visual only:

```tsx
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Checkbox checked={v} onCheckedChange={setV} accessibilityLabel="Enable notifications" />
  <Text>Enable notifications</Text>
</View>
```

---

## 12. Import Paths & File-Naming Conventions

- Implementations are `snake_case`: `components/dropdown_menu.tsx`, `components/input_otp.tsx`, …
- Eight **kebab-case aliases** exist as 1-line re-exports for consumers who prefer that style: `alert-dialog`, `brutal-surface`, `dropdown-menu`, `floating-action-button`, `input-otp`, `list-item`, `radio-group`, `date-picker`. Both spellings resolve to the same module — no duplication.
- Deep imports (`@ui/components/button`) and the barrel (`@apexrn/ui`) are both supported; prefer the barrel in app code.
- Import types with `import type` to keep bundles lean: `import { Button, type ButtonProps } from '@apexrn/ui'`.

---

## 13. Demo App Guide

The `demo/` Expo app is the living showcase **and** the integration testbed — every library feature is exercised somewhere in it.

### 13.1 Wiring that matters

| File | What it shows |
|---|---|
| `App.tsx` | `GestureHandlerRootView` → `SafeAreaProvider` → `ThemeProvider` → shell; themed `StatusBar`; Android hardware-back returns home |
| `src/context/ThemeContext.tsx` | bridges `ApexRNProvider` (`defaultMode="system"`) into the showcase |
| `src/components/Layout.tsx` | safe-area header with back + theme toggle (labeled buttons), `keyboardShouldPersistTaps="handled"` scroll |
| `babel.config.js` / `metro.config.js` | `@ui` alias (babel) + `extraNodeModules` + workspace `watchFolders` (Metro) |
| `package.json` | `"@apexrn/ui": "file:../packages/ui"` — the workspace link EAS builds need |

### 13.2 Screens

`HomeScreen` lists 33 entries: 7 batch screens (`forms`, `feedback`, `display`, `overlay`, `navigation`, plus `button`/`card`) and one screen per component (`input`, `checkbox`, `radiogroup`, `switch`, `slider`, `badge`, `progress`, `skeleton`, `alert`, `toast`, `avatar`, `accordion`, `carousel`, `marquee`, `listitem`, `dialog`, `sheet`, `dropdown`, `select`, `datepicker`, `tabs`, `separator`, `fab`, `label`, `input_otp`, `textarea`). The router is a simple state switch — eager imports, no deep linking (deliberate for a showcase).

### 13.3 Adding a screen

1. Create `demo/src/screens/<Name>Screen.tsx` (copy `SeparatorScreen` — smallest).
2. Register the id in `HomeScreen.componentsList` and the `switch` in `App.tsx`.
3. Exercise light **and** dark (toggle in header), narrow widths, and assistive-tech labels.

---

## 14. Accessibility Conventions

- Every interactive component sets `accessibilityRole` and `accessibilityState` (`disabled`/`checked`/`selected`/`expanded`); decorative subtrees (`marquee` repetitions, `carousel` dots, `accordion` closed content, hidden toasts, alert icons) are removed from the accessibility tree.
- Dynamic collections announce position once (`"Carousel, item X of N"`, `"X of N digits entered"`) instead of per-node.
- Overlays use `accessibilityViewIsModal`; toasts use an assertive live region only while visible.
- Touch targets meet ~44px (Checkbox/Radio hitSlop, Switch hitSlop, full-track Slider gestures, tappable trailing icons).
- `normalize()` respects the OS font-scale setting, so large-text modes scale type instead of clipping it.

## 15. Performance Conventions

- Theme context value is memoized; `spacing`/`typography` getters do trivial math per access (no re-render subscriptions needed).
- Frame-critical animation runs on the UI thread (Reanimated shared values): press physics, sheet/dialog transitions, shimmer (`translateX`, never `left`), marquee.
- `FlatList` carousel settles index on momentum end (no per-frame `setState` scroll spam); `TabsContent` unmounts inactive tabs by default.
- `Toast.onDismiss` is ref-stabilized so parent renders never restart timers; slider parent echoes never fight drags.

---

## 16. Backwards Compatibility & Deprecations

| Old | Status | Replacement |
|---|---|---|
| `PressPhysicsConfig` | deprecated alias, still exported | `UsePressPhysicsOptions` |
| `SheetContent PointHeight` | deprecated alias, still works | `sheetHeight` |
| `Badge label` (required string) | still works; now optional | `label` or `children` |
| `SelectTrigger style` | unchanged (pressable wrapper) | — |
| `RadioGroup` default import | still works (`export default RadioGroup` kept) | named `RadioGroup` |
| Kebab-case paths | permanent aliases | — |

No other breaking changes: style-target semantics, variant names, and controlled/uncontrolled shapes from 1.0.0 are preserved.

---

## 17. Validation & QA

| Check | Command (cwd) | Status |
|---|---|---|
| Library types | `npx tsc --noEmit` in `packages/ui` | 0 errors (strict + unused checks) |
| Demo types | `npx tsc --noEmit` in `demo` | 0 errors |
| Demo production bundle | `npx expo export --platform web` in `demo` | clean, 861 modules |
| Package self-resolution | import `@apexrn/ui` types via `exports` map | verified |
| Unit tests | — | **no suite configured** (see §18) |
| Linter | — | **no config**; dead code covered by `noUnusedLocals`/`noUnusedParameters` |

Release checklist: both typechecks green → `expo export` clean → bump `packages/ui` version → publish (the `files` allowlist ships only `index.ts`, `lib/`, `components/`).

## 18. Limitations & Roadmap

- **No test suite yet.** The highest-leverage next step is smoke/interaction coverage (render-without-throwing per component would have caught the historical crash-class bugs).
- **No lint config.** Recommend `eslint` + `no-unused-vars` equivalent and Reanimated worklet rules.
- **No compiled dist.** The package ships source via the `exports` map (fine for Metro/bundler consumers); a `tsup`/`rollup` `.js`+`.d.ts` build would widen compatibility with plain Metro-less consumers.
- **No shadcn-style registry/CLI** (`npx apexrn add button` copy-paste distribution) — distribution is npm-install only today.
- **No persistence** for theme mode (falls back to OS on restart) and no `keepMounted`-style state retention beyond Tabs.
- Component wishlist from the readme roadmap: CLI, theme generator, icon package, docs site, animation presets, Figma kit.

---

*End of ApexRN library documentation. For history, see `design/AUDIT.md` (diagnosis) and `design/REFACTOR.md` (change log).*
