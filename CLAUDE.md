# CLAUDE.md — ApexRN

## What we are building

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

## Repo layout

```
apexrn/
├── CLAUDE.md               # this file
├── apexrn-modify.md        # THE PLAN: rewrite loop, spec, Lab design, tracker, triage table
├── apexrn-docs.md          # docs of the current (pre-rewrite) lib — partly overclaims, see plan §2.7
├── design/                 # AUDIT.md (diagnosis), REFACTOR.md (history)
├── packages/ui/            # @apexrn/ui — SOURCE ONLY (components/, lib/, index.ts)
├── demo/                   # Expo app: ALL dependencies live here; hosts the Component Lab
└── .claude/skills/         # vendored design skills (offline): frontend-design, ui-ux-pro-max
```

Read `apexrn-modify.md` before doing library work. It is the source of truth for scope, order, the Definition of Done, and the tracker.

## Hard rules (do not break)

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

## Code conventions

- **TypeScript strict**, `noUnusedLocals`/`noUnusedParameters`. No `any` in public APIs.
- **Colors only from `useTheme().colors`.** No hex literals in components. Never read `colors.light`/`colors.dark` directly.
- **Anything blocky renders through `BrutalSurface`.** Don't hand-roll shadow/border stacks.
- **Size-dependent tokens (`spacing`, `typography`, window size) are read at render time**, not in module-level `StyleSheet.create` (which freezes them at import). Static values (border widths, offsets) may stay static.
- **Animate `transform`/`opacity` only** (Reanimated, UI thread). Avoid animating layout props (`width/height/borderWidth/left/top`) unless there's no alternative, and comment why.
- **Merge styles with `cn(base, themeOverrides, conditional, consumerStyle)`** — consumer style last. Don't pass animated styles through `cn`; use arrays.
- **Accessibility is part of the component:** role + state on interactive nodes, ≥44px hit targets (`hitSlop`), decorative subtrees hidden from assistive tech, overlays use `accessibilityViewIsModal` and close on Android back.
- **Modals + gestures:** any `GestureDetector` rendered inside a React Native `Modal` needs its own `GestureHandlerRootView` inside that Modal (Android renders Modals in a separate window).
- **Compound components throw a clear error** when used outside their parent; no `displayName`/`name` sniffing to detect slots.
- **File naming:** kebab-case, one spelling per component, no alias re-export files. Comments explain *why*, not what; no "template compliance" leftovers or dead constants.
- Keep files focused: a component and its sub-parts in one file unless it genuinely exceeds ~300 lines.

## Design workflow — use the two vendored skills

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

## The rebuild loop (summary — details in `apexrn-modify.md`)

For each component, in dependency order (primitives → atoms → inputs → motion/nav → overlays):

1. **Spec** — props, states, a11y contract.
2. **Design pass** — the two skills (above).
3. **Rewrite** the component (old version is reference only).
4. **Specimen** — a Component Lab page in `demo/` importing from `@apexrn/ui`: variants, sizes, states matrix, light/dark split, playground, stress cases, event log; wrapped in an ErrorBoundary and lazy-loaded.
5. **Run** on web, then on device. Fix.
6. **Lock** — Definition of Done checklist, smoke test, one commit `feat(ui): <component> — rewrite + lab specimen`, update the tracker.

## Commands (run from `demo/`)

```bash
npm run doctor                     # env sanity: no duplicate dependency trees
npm run typecheck                  # tsc — covers packages/ui AND the demo
npx expo export --platform web     # bundle check
npx expo start --web               # fast iteration
npx expo start                     # device (Expo Go / dev build)
npx expo install --check           # SDK version alignment
```

Before declaring a component done: `doctor` + `typecheck` + `expo export` green **and** it has been exercised in the Lab on a device. Say plainly what was and wasn't verified; don't claim device behavior from a web run.

## When something renders wrong

Triage in this order (full table: `apexrn-modify.md` Appendix A):
1. `npm run doctor` (duplicate React/reanimated/svg?).
2. Is the provider above the component; is everything imported via one module path?
3. Gesture inside a Modal without a root view?
4. Web-only or device-only? Reproduce on the failing platform before changing code.
5. Only then read the component.

## Things to never do

- `npm install` inside `packages/ui`, or add a lockfile/node_modules there.
- Put hex colors, hand-rolled shadows, or module-level metric reads in components.
- Expand scope mid-loop ("fix a neighbour while I'm here").
- Publish to npm, run destructive git commands, or delete `_legacy` reference files before their replacement is VERIFIED, without being asked.
- Trust `demo/AGENTS.md`'s version-pinned docs link over the installed Expo SDK (57).
