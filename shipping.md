# shipping.md — ApexRN release TODO

Goal: ship `@apexrn/ui` the way shadcn/ui ships: a CLI that **copies component source into the user's app** (`npx apexrn add button`), backed by a static registry. Optional second path: an npm package.

Status as of 2026-09-29: 36 components (31 reworked + AppBar, Drawer, BottomNav, SearchBar, Chip) plus `lib/icons`. Everything is web-checked only. Nothing is committed.

Legend: `[ ]` todo, `[x]` done. Do the phases in order; each phase blocks the next.

---

## Phase 0 — Commit what exists

- [ ] Review `git status`; commit the five new components + `lib/icons.tsx` + demo screens (`feat(ui): appbar, drawer, bottom-nav, search-bar, chip + lab specimens`).
- [ ] Commit the 31-component rework (currently uncommitted per memory notes) as separate, reviewable commits where possible.
- [ ] Update the tracker in `apexrn-modify.md` §5.4 for the new components (status: WIP until Phase 1 is done).

## Phase 1 — Device verification (blocks everything)

Rule from CLAUDE.md: web passing is not device passing. Nothing is VERIFIED until it has run on Android **and** iOS.

- [ ] Run `cd demo && npx expo start`; open in Expo Go / dev build on a real Android device and a real iOS device.
- [ ] **Drawer:** swipe-to-close (both sides), scrim tap, Android hardware back, gesture root inside the Modal, safe-area insets, item press closes it.
- [ ] **AppBar:** `topInset` under notch/status bar, action hit targets (>= 44/48), long-title truncation.
- [ ] **BottomNav:** `bottomInset` on gesture-nav phones, sliding block, badges, disabled item.
- [ ] **SearchBar:** keyboard open/close, clear keeps focus, Cancel appears only while focused, search key dismisses keyboard.
- [ ] **Chip:** toggle, removable (remove is a separate touch target), disabled.
- [ ] Re-check the earlier high-risk components: Sheet, Slider, Carousel snapping, Toast top offset, Dropdown positioning on Android.
- [ ] Screen-reader pass (TalkBack + VoiceOver) on every interactive component: role, state, label, focus order, modal trapping.
- [ ] Reduced-motion pass (OS setting on): press physics, drawer, bottom-nav block, sheet.
- [ ] Dark-mode pass for all five new components (not yet screenshotted).
- [ ] Font-scale pass (largest OS text size): nothing overflows or clips.
- [ ] Record what was and was not verified per component in the tracker. No claiming device behaviour from web runs.

## Phase 2 — Fix known leftovers

- [ ] **Filename case:** git tracks `packages/ui/components/Input.tsx` (capital I) while imports say `./input`. Fix with `git mv` (two-step rename on Windows) so it works on case-sensitive filesystems/CI.
- [ ] **File naming:** decide one convention. CLAUDE.md says kebab-case; older files use `brutal_surface`, `input_otp`, `radiogroup`, `alertdialog`. Rename to kebab-case and update imports, or amend CLAUDE.md.
- [ ] Migrate the five older combined demo screens (forms/feedback/display/overlay/navigation) off hardcoded colours and `@ui/*` imports, then remove the `@ui/*` alias.
- [ ] `Card` does not tint child text: fix or document.
- [ ] Plan item 0.6 (Expo config drift) and 0.9 (`_legacy` quarantine): finish, then delete `_legacy` only after replacements are VERIFIED.
- [ ] Correct `apexrn-docs.md` (it overclaims, see plan §2.7); it becomes the base for the docs site in Phase 6.
- [ ] Optional feature gaps noted during build: collapsing large title on scroll for AppBar; swipe-from-edge to open Drawer.

## Phase 3 — Tests and quality gates

- [ ] Add Jest + `@testing-library/react-native` in `demo/` (never in `packages/ui`; hard rule 1). Wave 0.8 of the plan.
- [ ] Smoke test per component: renders, controlled + uncontrolled behaviour, a11y role/state, disabled, "throws outside parent" for compound components.
- [ ] Add a CI workflow (GitHub Actions): `npm run doctor`, `npm run typecheck`, `npx expo export --platform web`, tests.
- [ ] Add a lint config (none exists today) or explicitly rely on `noUnusedLocals`; pick one and document it.
- [ ] Run CI on Linux so the filename-case bug (Phase 2) cannot come back.

## Phase 4 — Registry

The registry is a static JSON description of every component so the CLI can copy files without a server.

- [ ] Define the schema (mirror shadcn): `name`, `type` (`component` | `lib` | `theme`), `files[]` (path + content or URL), `registryDependencies[]` (other ApexRN items), `peerDependencies[]` (npm packages), `description`.
- [ ] Map real dependencies. Examples:
  - `search-bar` -> `input`, `lib/icons`
  - `drawer` -> `badge`, `lib/theme`, `lib/colors`, `lib/utils`
  - `app-bar` -> `brutal_surface`, `lib/icons`
  - `bottom-nav` -> `lib/theme`, `lib/colors`, `lib/utils`
  - `chip` -> `brutal_surface`, `lib/icons`
  - Every component -> `lib/theme`, `lib/colors`, `lib/utils`; pressables -> `brutal_surface`, `lib/usePressPhysics`
- [ ] Write a build script that generates `registry.json` + one `<name>.json` per item from `packages/ui` (single source of truth; never hand-edit the output).
- [ ] Add a `theme` item (`colors.ts` tokens) that users edit to restyle everything, including the neo vs raw brutalist palette choice (plan §7).
- [ ] Verify each item installs in isolation into a blank Expo app (dependency closure is complete, no missing imports).
- [ ] Host the built registry as static files (GitHub Pages or a CDN). Version the URL.

## Phase 5 — CLI (`npx apexrn`)

- [ ] Scaffold a small Node package (`apexrn` or `@apexrn/cli`), TypeScript, no heavy deps.
- [ ] `apexrn init`: detect Expo project, write `apexrn.json` (components dir, lib dir, import alias), copy theme/tokens/`lib/*`/`brutal_surface`, install peers via `npx expo install` (react-native-reanimated, gesture-handler, svg, expo-haptics, worklets), remind about `ApexRNProvider` and `GestureHandlerRootView`.
- [ ] `apexrn add <component...>`: fetch registry item, resolve `registryDependencies` recursively, copy files, rewrite relative imports to the user's aliases, skip or prompt on overwrite.
- [ ] `apexrn diff <component>` and `apexrn add --overwrite`: so users can pull upstream changes into code they have edited.
- [ ] `apexrn list`: show available components.
- [ ] Handle package managers (npm/yarn/pnpm/bun) and the `expo install` requirement for SDK alignment.
- [ ] Test the CLI end to end against a fresh `npx create-expo-app` project on Windows, macOS and Linux.
- [ ] Never run `npm install` inside `packages/ui` while building any of this (hard rule 1).

## Phase 6 — Docs and examples

- [ ] Docs site (or `docs/` in the repo): install/init, theming, one page per component with props table, variants, states, a11y notes, copy-paste example.
- [ ] Getting-started guide for a fresh Expo app: init, add button, add a full app shell (AppBar + Drawer + BottomNav).
- [ ] Publish an example app that composes the app-shell components (the Lab already has the specimens).
- [ ] Screenshots/GIFs of each component in light and dark for the README.
- [ ] Document the rules users must follow: `GestureHandlerRootView` in the app root, `ApexRNProvider`, pass safe-area insets to AppBar/Drawer/BottomNav.
- [ ] Document customisation: edit tokens, `style` vs `inputStyle`/`surfaceStyle`, variants as data.

## Phase 7 — Release

- [ ] Choose a licence (MIT is typical for shadcn-style) and add `LICENSE`.
- [ ] Root `README.md`: what it is, install, quick start, screenshots, contribution guide.
- [ ] `CONTRIBUTING.md`: the rebuild loop (spec, design pass, rewrite, specimen, run, lock) and the Definition of Done.
- [ ] Semver plan and `CHANGELOG.md`; tag `v0.1.0`.
- [ ] Decide whether to also publish `@apexrn/ui` to npm as a second distribution path. Do not publish without an explicit go-ahead (CLAUDE.md "never do").
- [ ] Publish the CLI to npm, deploy the registry and docs, smoke-test `npx apexrn init && npx apexrn add button` from a clean machine.
- [ ] Announce (README badges, demo video, social).

## Phase 8 — After launch (backlog)

- [ ] Remaining components: Popover/Tooltip, Segmented control, Empty state, Stepper, Number input, Time picker, Rating, Toggle group.
- [ ] Layout helpers: Screen/safe-area wrapper, Stack/Row.
- [ ] Pull-to-refresh styling, collapsing AppBar, Drawer edge-swipe.
- [ ] Optional raw-brutalist theme preset alongside the neo look.
- [ ] Issue templates and a component-request process.

---

## Ship gate (all must be true for v0.1.0)

- [ ] Every shipped component is VERIFIED on Android and iOS, with the tracker updated honestly.
- [ ] CI green on Linux: doctor, typecheck, export, tests.
- [ ] `npx apexrn init` + `add` works on a fresh Expo app, on Windows/macOS/Linux.
- [ ] Docs cover install, theming and every component.
- [ ] Licence, README, changelog in place.
