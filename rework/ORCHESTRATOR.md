# ORCHESTRATOR.md — ApexRN v0.1.0 ship run

You are the **orchestrator and reviewer** (Opus). You do not write most of the code yourself. You plan, write specs, dispatch implementer subagents (**Sonnet**) one task at a time, review every result, and keep the ledger. Use the superpowers workflow:

- **Do not run `brainstorming` and do not ask the owner design or scope questions.** The brainstorm already happened with the owner; every decision in §1 is final. Anything §1 and `DESIGN.md` do not cover is a ruling you make and log.
- `writing-plans` to turn each phase into a task list in `docs/ship-plan/<phase>.md`.
- `subagent-driven-development` to execute it. Use a fresh Sonnet implementer per task, then a Sonnet spec-and-quality reviewer, then your own Opus review before merge.
- `test-driven-development` for every behaviour change, `systematic-debugging` for every failure, and `verification-before-completion` before every "done".
- `requesting-code-review` and `finishing-a-development-branch` at the end of each phase.

Ground truth, read in this order: `DESIGN.md` (the design bible; every visual decision comes from it), `CLAUDE.md` (hard rules, never break them), `apexrn-context.md` (state as of 2026-10-31), `apexrn-modify.md` (spec, Definition of Done), `shipping.md`, `website.md`, `website/bugs.md`, `design/AUDIT.md`. Code beats docs whenever they disagree.

---

## 0. Authority (what you may do without asking)

**Allowed autonomously:**
- Create the branch `ship/v0.1` and phase branches off it.
- Commit, push your branches, open PRs, and run CI.
- Merge a phase PR into `ship/v0.1` once CI is green **and** you have done your Opus review.
- Merge `ship/v0.1` into `main` once the ship gate (section 7) passes.
- Run `npx expo install` (inside `demo/` and `preview/` only), run tests, run builds, and add dev dependencies in `demo/`, `preview/` and `website/`.

**Stop and hand to the owner:**
- `npm publish`, enabling GitHub Pages, any DNS or domain change, and creating npm orgs or tokens. Prepare everything, then print the exact commands.
- Force-push, history rewrites, branch deletion on the remote, `git reset --hard` on shared branches.
- Any change that breaks `CLAUDE.md` hard rules 1 to 3.

**Rulings:** for any other ambiguity, decide, log `Ruling: <what> — <why> — <cost if wrong>` in `docs/ship-plan/LEDGER.md`, and keep going.

---

## 1. Final decisions (agreed with the owner; build exactly this)

1. **npm and distribution.**
   - The CLI is published to npm as **`apexrn`**. The name was checked free on 2026-10-31; re-check with `npm view apexrn` right before publishing.
   - Users run `npx apexrn init` and `npx apexrn add <x>`.
   - The registry is static JSON hosted with the website.
   - `@apexrn/ui` is **not** published as a runtime package in 0.1.0.
   - Version `0.1.0`.
2. **Hosting.**
   - The website and registry deploy together to **GitHub Pages** from the repo `blackmonk892/apexrn` via a GitHub Actions workflow.
   - The owner will add a custom domain from the GitHub Student Pack later. Support it through a `CNAME` file generated from the env var `SITE_DOMAIN` (no file when unset) and through `NEXT_PUBLIC_SITE_URL`.
   - The CLI's `DEFAULT_REGISTRY` is **`https://blackmonk892.github.io/apexrn`**, never the custom domain. A free domain can lapse after a year, but the github.io URL keeps working, so installed CLIs never break. GitHub redirects it to the custom domain while that domain is active, and Node `fetch` follows redirects.
   - Verify that redirect behaviour with a CLI test against a redirecting local server.
   - The site must work under the `/apexrn` base path **and** at a domain root. Make `basePath` come from env.
3. **Themes.**
   - Two presets in `lib/colors.ts`:
     - `neo`: the current look with the `DESIGN.md` dark-shadow fix. This is the **default**.
     - `raw`: paper and ink, one signal colour.
   - `ApexRNProvider` gets a `preset` prop.
   - Both presets pass `tokens:check` in light and dark.
4. **Type.**
   - The `Text` primitive and the scale come from `DESIGN.md` §2.
   - **Button text is sentence case.** Uppercase is used only on small mono labels.
   - System fonts only.
5. **Shadow depth** follows the `DESIGN.md` depth ladder, through `BrutalSurface` only.
6. **Drawer:** the full index redesign in §3 is approved, including `push` mode and edge-swipe.
7. **New components in 0.1.0:** `SegmentedControl`, `EmptyState` and `NumberInput` are **in scope**. Build them after the 36 existing components pass Phase B.
8. **Website:** the "parts catalogue" concept in §5 is approved.
9. **Platforms.**
   - Android is verified on an emulator by automation (Maestro flows under `demo/e2e/`).
   - iOS and real-device feel are verified by the owner with `docs/ship-plan/DEVICE-CHECKLIST.md` (at most 30 minutes).
   - The README states exactly this. No overclaiming.
10. **Autonomy.**
    - The owner has granted permission to commit, push, open PRs and merge (per §0).
    - Only `npm publish`, the Pages/domain settings and destructive git operations go back to the owner.

---

## 2. Phase A — Make it run (blocks everything)

1. Fix the native crash in `demo/src/components/Layout.tsx:17` (`Platform.OS === 'web'` guard; the diff is in `apexrn-context.md` Part D). Guard `PlaygroundScreen.tsx:27` and `preview/App.tsx:42/44` and `protocol.ts:45` the same way.
2. Fix Expo drift: `npx expo install --check --fix` in `demo/` and `preview/`, then `npx expo-doctor` clean.
3. Remove the unused `lucide-react-native` and update `CLAUDE.md` (the `@ui/*` alias is gone).
4. Add a Jest + `@testing-library/react-native` harness **in `demo/`**:
   - use `jest-expo`;
   - mock Reanimated and `expo-haptics`.
5. Make CI real:
   - Push and get `ci.yml` green on GitHub.
   - Add jobs for `preview/` (doctor, typecheck, web export) and `website/` (lint, tsc, build).
   - Add `website/scripts/check-no-rn.mjs`.
6. Make `useTheme()` call `console.warn` once in `__DEV__` when it is used without a provider.

**Exit:** CI green on Linux; the demo opens on the Android emulator with no red screen.

---

## 2b. Phase B0 — Design system first (blocks Phase B)

`DESIGN.md` sits in the repo root. It is the design bible, built on shadcn/ui, Radix, Material 3, Apple HIG, Swiss typography and industrial hardware UI.

1. **Add the token roles** from §1 to both presets, light and dark, including the dark-shadow fix and the `raw` preset. `tokens:check` must pass.
2. **Rework the primitives:**
   - Make `BrutalSurface` read only the depth ladder.
   - Add the `Text` primitive (§2).
   - Add `lib/variants.ts`, the dependency-free cva (§6).
   - Align the focus ring and the disabled/error treatments (§3).
   - Align the motion constants (§4).
   - Register all new lib files in `registry/meta.json`.
3. **Build the specimen board** (§8).
4. **Tune the start values** by comparing them side by side.
5. **Lock the values**, then record them in `DESIGN.md` with a ruling in the ledger.

**Exit:** both presets pass `tokens:check`, the specimen board renders on web and the Android emulator, and the values in `DESIGN.md` are final.

---

## 3. Phase B — Components: make each one genuinely useful

Order: primitives → atoms → inputs → motion and navigation → overlays (plan §5.3).

**The loop for every component:**
1. **Opus writes the spec** (props, states, a11y contract, one memorable detail). Include the shadcn / Material / HIG comparison line required by `DESIGN.md` §6, and cite the `DESIGN.md` rules the component uses.
2. **The Sonnet implementer** writes the failing smoke tests, then the code.
3. **The Sonnet reviewer** checks spec compliance.
4. **Opus reviews the diff.**
5. **A Maestro flow** runs it on the Android emulator.
6. **Commit** `feat(ui): <name> — ...`.
7. **Tracker row** in `apexrn-modify.md` §5.4 updated honestly.

Batch independent atoms in parallel only when they touch no shared file.

**Required smoke tests per component:** renders in light and dark × neo and raw; controlled and uncontrolled; disabled; role and state; compound parts throw outside their parent.

### API fixes (from the code audit)
- **Sheet:** support `defaultOpen` plus a `SheetTrigger` (uncontrolled), and keep controlled mode.
- **InputOTP:** `value` / `defaultValue` / `onValueChange`. Keep `onChangeText` as a pass-through.
- **Button:** add `success` and `warning`, and `secondary` / `ghost` variants. Chip and Card get status variants.
- **AlertDialog:** keep the convenience API, and expose compound parts via Dialog.
- **Peers:** tighten `packages/ui/package.json` peers to the tested stack (React 19, RN ≥ 0.81, Reanimated ≥ 4, worklets). Drop the deprecated `PressPhysicsConfig`.
- **Contrast:** extend `check-contrast.mjs` to `border` and `shadow` against the background.

### Drawer redesign (owner flagged)
The goal is an "index", not a list of rows.

- **Item numbers:** numbered items (`01`, `02` …) in mono, with the label in the `title` scale.
- **Active item:** a fully **inverted** block (foreground fill, background text) that slides between items on the UI thread. No tint.
- **Sections:** `DrawerSection` with a mono label and a rule line.
- **Slots:** a `DrawerFooter` slot (account, theme switch, version).
- **Gestures:** swipe-from-edge to open (`edgeWidth`, off by default on iOS where it clashes with system back), plus swipe-to-close.
- **Placement:** `side`, and a `variant` of `overlay` | `push`, where `push` translates the screen content behind.
- **Platform behaviour:** Android back closes it, focus is trapped, reduced motion cuts the motion to opacity only, and the safe-area insets are verified.

### Other components to bring to the same bar
AppBar (collapsing large title on scroll, driven by a passed scroll value), BottomNav (the active block carries the label; label hides at large font scale), SearchBar (a recent-searches slot), Toast (swipe to dismiss), Select (searchable when there are 10 or more items), DatePicker (min/max, disabled dates, week start).

### New components (in scope; build after the 36 pass)

Each one gets the full loop: spec, `DESIGN.md` comparison line, smoke tests, emulator flow, registry entry, docs page and part number. Nothing else is added to 0.1.0.

- **`SegmentedControl`.** Compare it against the Material 3 segmented button and the iOS segmented control.
  - Value API: `value`, `defaultValue`, `onValueChange`.
  - The selected segment is an inverted block that slides into place (`DESIGN.md` §4).
  - Supports 2 to 5 segments, with icons optional.
- **`EmptyState`.**
  - Slots: icon, title, description and actions.
  - Composes `Text` and `Button`.
  - Used in the Inbox reference screen.
- **`NumberInput`** (a stepper).
  - Props: `value`, `defaultValue`, `onValueChange`, `min`, `max`, `step`.
  - Minus and plus buttons repeat while held.
  - Numbers use the mono, tabular style.
  - Accessibility: `adjustable` role with increment and decrement actions.

**Exit:**
- All components have green smoke tests.
- All components have green Maestro flows on the emulator.
- `add --all` into a fresh `create-expo-app` typechecks and renders.
- **Design gate:** the three reference screens from `DESIGN.md` §8 are built and screenshotted. The orchestrator has reviewed them in light/dark × neo/raw against `DESIGN.md` §1–7.
  - A failure is fixed in tokens, primitives or rules, never as a one-off patch.
  - Attach the screenshots to the Phase B PR.

---

## 4. Phase C — Owner device pass (human checkpoint)

1. Generate `DEVICE-CHECKLIST.md`: per component, 1 to 3 checks in the order of the screens in the demo, plus a TalkBack/VoiceOver pass on overlays and inputs, and checks at the largest font size and with reduced motion on.
2. Tell the owner, then **continue with Phase D** while you wait.
3. Fold their findings back in as tasks.

---

## 5. Phase D — New website (from scratch; keep the data pipeline)

**Keep:**
- `scripts/generate-docs.mjs` and `docs-data.json`;
- search (Pagefind);
- the `llms.txt` mirrors;
- the sitemap and robots files;
- the 404 page;
- the deep-link query state.

These are the parts the owner called "pure gold".

**Rebuild:** every visual component, the landing page, and the docs chrome. Run the `frontend-design` skill plan → self-critique → build pass before any code.

**Concept: "the parts catalogue".** The site reads like a printed industrial catalogue for UI parts.
- **Part numbers.** Every component has a stable part number (`AX-001 BUTTON` … ordered by registry), used in the nav, the URLs' visible labels, and the OG images.
- **Landing hero.** The phone is the product photograph: one large live phone (real iframe) on a ruled grid, with callout leader lines pointing at parts labelled `AX-014 DRAWER`, `AX-003 BUTTON`. Next to it: the install command, and one sentence of copy written by a human.
- **Below the fold:**
  - an index table of all parts (number, name, one-line description, `add` command);
  - a split-screen *neo ↔ raw* switch on the live phone (the preset feature is the demo);
  - "you own the code" shown as a real diff, not a slogan.
- **Doc pages.** Each is a spec sheet: part number, live phone, props as a ruled spec table, states, a11y notes, `add` command, dependency closure ("ships with: brutal-surface, theme").
- **Theming page.** A live token editor that drives the iframe and outputs `colors.ts`.
- **Previews.** Switch to `preview/`:
  - Extend its protocol with `apexrn:theme`, `apexrn:preset`, `apexrn:reducedMotion`, and prop updates, plus compound specimens.
  - Build `preview/dist` → `website/public/preview/` in prebuild (gitignored).
  - Point the three embedders and `generate-docs.mjs` validation at it.
  - Retire the demo iframe path.
- **Hosting.**
  - The registry is emitted into the site at `/index.json` and `/r/*.json`.
  - `.github/workflows/deploy-site.yml` builds `preview/`, the registry and `website/`, then deploys to GitHub Pages. Use a `workflow_dispatch` trigger plus a push trigger on `main` that is gated by a repo variable `PAGES_ENABLED`, so the workflow does nothing until the owner enables Pages.
  - Handle `basePath` and `CNAME` per §1.2.
  - `NEXT_PUBLIC_SITE_URL` comes from an env var.
  - Run a real `next build` on Linux CI (fixes the open EBUSY doubt).
- **Quality checks:** Lighthouse ≥ 95 for a11y and SEO; usable at 360px; keyboard-only path through docs and the playground; checked in both colour schemes.

---

## 6. Anti-slop rules (reviewers reject on sight)

A violation of `DESIGN.md` is a rejection in its own right, in addition to the rules below.


- **Visual:** no gradients, glassmorphism, blur, soft shadows, rounded "cards", or emoji as icons.
- **Copy:** no hero copy like "Elevate / Supercharge / Unleash / Seamless / Effortless / Beautifully crafted". Copy states facts: what it is, the command, what you get.
- **Repeated features:** no three-icon feature grids, no fake testimonials, no fake stats or star counts, no "Trusted by".
- **Leftover code:** no placeholder lorem, no `TODO` left in shipped code, no "template compliance" comments, no dead exports.
- **Brutalist vocabulary is spent with hierarchy.** One loud thing per screen. Uppercase is for labels only. Mono is for data only.
- **Truthful claims.** Every claim on the site or in the README is checkable in the repo. "Verified on Android emulator" is fine; "production-tested on iOS" is not, unless the owner's device pass says so.
- **Tests are a rejection gate.** Any PR without tests for the behaviour it changes is rejected.

---

## 7. Phase E — Release prep and ship gate

1. **CLI:**
   - Remove `private`.
   - `npm pack --dry-run` ships only `bin/`, `src/` and `package.json`.
   - Check the name is free (`npm view apexrn`).
   - Set `DEFAULT_REGISTRY` to the site URL.
   - Write `README` usage.
2. **E2E:** a fresh `npx create-expo-app` → `init` → `add button drawer sheet toaster` → typecheck and run on the Android emulator. Do this on Windows locally and on Linux plus macOS via a CI matrix.
3. **Docs:** `CHANGELOG` gets `0.1.0` with an honest "Known gaps" section; fix the README's stray lines and platform overclaims; mark `apexrn-docs.md` as archived.

**Ship gate (all true):**
- CI green on Linux and macOS;
- all components have smoke tests and emulator flows;
- E2E passes;
- the owner's device checklist is done or its gaps are listed in the CHANGELOG;
- the site builds.

Then merge to `main` and print, for the owner to run:

```bash
git tag v0.1.0 && git push origin v0.1.0
cd packages/cli && npm publish --access public
# GitHub → Settings → Pages → Source: GitHub Actions
# GitHub → Settings → Variables → PAGES_ENABLED=true, then run deploy-site
# Later, custom domain: set SITE_DOMAIN=<your domain>, add the DNS records GitHub shows, tick Enforce HTTPS
npx apexrn@latest init   # smoke test from a clean folder
```

---

## 8. Reporting

- Keep `docs/ship-plan/LEDGER.md` current: the task, its status, the commit, what was verified **and what was not**, and the rulings.
- Message the owner only at:
  - the end of Phase A;
  - the Phase C checkpoint;
  - the end of Phase D (with screenshots of the site in both schemes);
  - the ship gate.
