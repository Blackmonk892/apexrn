# Ship run ledger: ApexRN v0.1.0

Source of truth for the ship run (`rework/ORCHESTRATOR.md`). One row per task. "Verified" lists what was actually run; "Not verified" is never left blank.

Branches: `ship/v0.1` (integration) ← `ship/phase-<x>` (one per phase), each merged through a PR.

## Owner run rules (2026-10-31, override ORCHESTRATOR where they differ)

1. Every phase branch goes through a PR into `ship/v0.1`; no local merges. PR link recorded per phase below.
2. Hard stop for owner sign-off after **B0** and after **D**: PR link, screenshots (specimen board / site light + dark), what changed, what was NOT verified. The next phase starts only on the owner's "go".
3. B0 runs serially, one agent at a time. Parallel agents only for tasks touching no shared file; each parallel task's files are listed here before dispatch.
4. Tell the owner as soon as the `Layout.tsx` crash fix (A3) is merged into `ship/v0.1`, so they can test in Expo Go.

## Rulings

- Ruling: `ORCHESTRATOR.md` and `DESIGN.md` live in `rework/`, not the repo root; treat `rework/DESIGN.md` as "the design bible" wherever ORCHESTRATOR says `DESIGN.md` — that is where the owner put them — cost if wrong: none, content is identical.
- ~~Ruling: no PRs, local `--no-ff` merges.~~ Superseded by owner rule 1 (gh installed, 2026-10-31). Git Bash calls it as `"/c/Program Files/GitHub CLI/gh.exe"`.
- Ruling: CI status is read with `gh run list/view` (was: public REST API) — cost if wrong: none.
- Ruling: Android emulator verification runs in GitHub Actions (`ubuntu-latest` + KVM, `reactivecircus/android-emulator-runner`, Maestro), not locally. This machine has no Android SDK, emulator or Maestro, and installing several GB of SDK onto the owner's machine is outside the granted authority — cost if wrong: slower fix loop (a CI run per emulator attempt, ~20 min).
- Ruling: the emulator app is an `expo prebuild` + Gradle **release** APK (JS bundle embedded, debug keystore, x86_64 only), built only in CI; `demo/android/` stays untracked — cost if wrong: a release build hides dev-only red boxes, so the Maestro flow also asserts that no "Render Error"/"TypeError" text is visible and the JS smoke tests cover dev warnings.
- Ruling: `preview/` native-safety guards (App.tsx listener, protocol.ts postMessage) are verified by typecheck + review only, no Jest in `preview/`: it is a web-only runtime and Phase D rewrites its protocol, where it gets tests — cost if wrong: a native run of `preview/` could still crash; nobody runs it natively.
- Ruling: `demo/app.json` gains `android.package: "dev.apexrn.demo"` (required for prebuild) — cost if wrong: cosmetic id, changeable any time before a store release (none planned).
- Ruling: tasks that touch disjoint files run in parallel, each in its own git worktree; tasks sharing a file (demo/package.json: A1→A2→A3→A4) stay sequential — owner asked for speed — cost if wrong: hand-resolved conflicts.
- Ruling: worktree agents branch from `main`, not the phase branch; their commits are reviewed against `bcfd2f7` and cherry-picked onto the phase branch — harness behaviour — cost if wrong: none while each commit touches only its own files.
- Ruling: A6 skips the local `expo prebuild` check (no SDK here); the CI run is the verification — cost if wrong: a prebuild config error surfaces one CI run later.
- Ruling: fix diffs of ≤ 10 lines get their scoped re-review from the Opus controller instead of a new subagent — speed — cost if wrong: one less independent read of a trivial diff.

## Phase A — make it run (PR: https://github.com/Blackmonk892/apexrn/pull/1, merged 59908ca)

Parallel tasks and their files (recorded retroactively for A5/A6, which were dispatched before owner rule 3):
- A5: `website/scripts/check-no-rn.mjs`, `website/scripts/check-no-rn.test.mjs`, `website/scripts/__fixtures__/check-no-rn/**`, `website/package.json` (scripts), `.github/workflows/ci.yml`.
- A6: `.github/workflows/android-e2e.yml`, `demo/e2e/launch.yaml`, `demo/src/screens/HomeScreen.tsx`.
- Sequential in the main checkout: A1 → A2 → A3 → A4 (share `demo/package.json`, `demo/__tests__`).

| # | Task | Status | Commit | Verified | Not verified |
|---|---|---|---|---|---|
| A1 | Expo drift, drop lucide + expo-modules-core, CLAUDE.md truth | DONE | 0af0dab, a6d5678 | expo-doctor 21/21 in demo and preview; doctor; typecheck; demo web + android export; preview build:web; Sonnet review | Native splash: SDK 57 dropped top-level `splash`, demo now shows the default splash (deferred) |
| A2 | Jest + RNTL harness in demo | DONE | e2516c4 | 3 jest tests, typecheck, doctor; Sonnet review (ran jest) | Reanimated/worklets are mocked, so animation behaviour is not exercised by Jest |
| A3 | Native-safe window access (demo + preview) | DONE | 98d634a, edce8bc | 2 native jest tests RED without their guards; 1 web embed-mode regression test; demo + preview typecheck; web export; Opus review | Expo Go on a real phone (owner); preview guards have no test (ruling); emulator: see CI below |
| A4 | `useTheme()` dev warning outside provider | DONE | 3255865 | 4 jest tests (warn once, none inside provider, none when `__DEV__` false, light fallback); typecheck; registry build; Opus review | Not exercised on device or emulator |
| A5 | CI: tests, preview, website, check-no-rn | DONE | 660edde | 4 node tests; website lint + tsc + check-no-rn local; CI run 41202443138 green on Linux incl. `next build` + Pagefind; Sonnet review | No macOS CI yet (Phase E); check-no-rn CLI exit path untested; CRLF one-liner in generate-docs.mjs has no test (Linux build covers it) |
| A6 | CI: Android emulator + Maestro launch flow | DONE | 56cf4e5, 10c46bf | Run 41200542233 reproduced the crash (pre-A3); run 41202918081 at edce8bc: launch flow PASSED on API 34 emulator, home screen screenshot in `evidence/phase-a-launch-home-api34.png` | iOS; physical Android; Maestro pinned version (deferred) |
- Parallel (2026-10-31): A2 review (read-only; any fix touches `demo/jest.config.js`, `demo/jest.setup.ts`, `demo/__tests__/harness.test.tsx`, `demo/__tests__/utils/render.tsx`) ∥ A3 (`demo/src/components/Layout.tsx`, `demo/src/screens/PlaygroundScreen.tsx`, `preview/App.tsx`, `preview/src/protocol.ts`, `demo/__tests__/native-globals.test.tsx`).
- Ruling: `renderWithTheme` is async (RNTL 14 `render` returns a promise); every test awaits it — library API — cost if wrong: none.
- Parallel (2026-10-31): A4 (`packages/ui/lib/theme.tsx`, `demo/jest.setup.ts`, `demo/__tests__/theme-provider-warning.test.tsx`) ∥ A3 (files above). No overlap.
- Parallel: none during the final-review fix wave (one agent: CLAUDE.md, both workflows, `demo/__tests__/{harness,theme-provider-warning,native-globals}.test.tsx`, `demo/jest.config.js`); the controller edits only this ledger.
- CI flake (run 41203078985): website `next build` failed resolving `next/font/google` (Google Fonts fetch at build time); rerun of the failed job green, no code change. Ruling: the Phase D site uses system fonts only (matches ORCHESTRATOR §1.4), which removes the build's network dependency — cost if wrong: site loses Space Grotesk/Inter/JetBrains Mono (being rebuilt anyway).

## Phase B0 — design system first (PR: https://github.com/Blackmonk892/apexrn/pull/2, owner go 2026-11-01, merged 46eaf4d) — serial, owner sign-off at end

| # | Task | Status | Commit | Verified | Not verified |
|---|---|---|---|---|---|
| B0-1 | Colour roles, neo + raw presets, provider `preset`, contrast gate | DONE | 697edca, 79eb871 | tokens:check (4 palettes, text ≥4.5, border/ring ≥3, shadow ≥1.5); tokens:test 3 (RED via stub); 11 theme/harness tests incl. nested providers + fallback; typecheck; generate-docs; website tsc | Values are start values until B0-7; no device run |
| B0-2 | `lib/variants.ts` + `lib/motion.ts` | DONE | f462442, f9f86be | 7 variants tests (defaults, unknown/null/inherited-key fallback, no base mutation); motion values + useMotion reduced path; typecheck; registry build (44 items) | Easing curves not visually checked until B0-6 |
| B0-3 | BrutalSurface on the depth ladder; press, ring, disabled, invalid | DONE | aed90fd, af3cbac | 15 BrutalSurface tests (depth neo 4 / raw 2, flat, disabled dashed+no press+no haptic+stable margin, invalid, ring focus/blur/gated, press sink, reduced motion, mid-press reset); 43 suite tests; typecheck; web export | Ring on web keyboard focus not checked in a browser; press translate asserted via shared value (mock limit); no device run |
| B0-4 | `Text` primitive + loading blocks | DONE | 71e121b, 898d661 | 16 tests: each variant size/line/weight, label mono+uppercase, 1.3 cap, muted tone dark, header role; LoadingBlocks 3 blocks, progressbar role, no withRepeat under reduced motion; typecheck; registry (46 items); generate-docs | Mono font rendering per platform not seen on screen yet (B0-6); Text has no live preview on the site yet |
| B0-5 | Icons on the §5 grid | DONE | 49c2428 | 8 icon tests (2px stroke, square caps, miter, 24 viewBox, no fill, hidden from a11y), RED on 3px first | Glyph legibility at 2px seen on screen in B0-6 |
| B0-6 | Specimen board | DONE | 3485672 | 8 specimen tests (4 quadrants × 23 roles, 5 type specimens, depth 4/2); 75 suite tests; web screenshots desktop + phone reviewed by Opus | Device (iOS, physical Android) |
| B0-7 | Tune and lock values | DONE | 94e1166 + DESIGN.md lock | shadow-slab test RED→GREEN; tokens:check; 76 suite tests; re-shot screenshots reviewed by Opus; DESIGN table cross-checked against colors.ts by script (0 mismatches) | raw dark shadow is subtle (owner to judge) |
- Ruling: B0-1 keeps BrutalSurface's `offset` prop (only token reads migrate); B0-3 owns the BrutalSurface API change — keeps tasks reviewable separately — cost if wrong: none.
- Ruling: raw `ring` = the ink foreground (light `#111111`, dark `#F2F0EB`), not the signal red — in raw, red already means error/destructive, so a red focus ring would read as an error state; the 2px offset gap distinguishes the ring from the border — cost if wrong: focus is less loud in raw (tunable on the specimen board).
- Ruling: neo dark `background` stays `#1A1A1A` (current palette, DESIGN §1.1 tunes the shadow against it); only `surface` is `#222222` — cost if wrong: none.
- Ruling: the radio is square (DESIGN §1.3: radius 0, no exceptions); Phase B's radio loop makes the indicator distinguishable from Checkbox by its inner mark — cost if wrong: radio and checkbox look alike until Phase B.
- Ruling (B0-7 tuning): the shadow is one solid slab — the shadow layer's border takes the shadow colour, not the surface border — dark mode otherwise showed white-outlined slabs (the glow DESIGN §1.1 removes) — cost if wrong: none visible in light (both black).
- Ruling (B0-7 tuning): neo dark `shadow` = `#5A5A5A` (~2.5:1 on `#1A1A1A`); `#4A4A4A` vanished once the slab was solid — cost if wrong: a slightly lighter shadow, tunable in one token.
- Ruling (B0-7 tuning): raw keeps the ink focus ring; on screen it reads as a deliberate double rule (misregistered print), clearly distinct from idle — cost if wrong: owner may want louder focus in raw.
- Ruling: values locked in rework/DESIGN.md §1 (B0-7, 2026-10-31) — owner sign-off pending — cost if wrong: one token edit per value.
- Carried to Phase B (B0 final review): hard-coded shadow math in dialog, tabs, slider, switch, input-otp, dropdown-menu (SHADOW_OFFSET 4), drawer (SHADOW_WIDTH 6) must read `useTheme().elevation`; chip/slider/switch must pass `disabled` to BrutalSurface instead of switching elevation (layout shift); component-level disabled copies to remove; radio indicator redesign.
- B0 emulator evidence: android-e2e run 41214777849 at 214450a — launch + specimen flows PASSED (API 34); four quadrant screenshots stitched in `docs/ship-plan/specimen/specimen-android-api34.png`. Debugging trail for the specimen flow (3 failed scroll strategies → deterministic swipes) is in the SDD progress log.

### B0 sign-off changes (owner, 2026-11-01): "go" with six changes, as small commits on PR #2, merge only when every check is green

| # | Change | Status | Commit | Verified | Not verified |
|---|---|---|---|---|---|
| B0-8 | Icons: round lens on search, round head on user; add `WarningIcon` + `InfoIcon` for status; re-shoot icon row | DONE | 46e644c, b444ba2, eccc334 | 30 icon tests incl. per-icon geometry (all coordinates inside the 24 box; bite-checked with one coordinate at 23.5) and circle counts; 126 suite tests; typecheck; doctor; registry build; `specimen/icons-row.png` reviewed by Opus in all four palettes | Glyphs at 16px on a device |
| B0-9 | raw dark `shadow` `#5A5750` → `#6E6A62` (3.51:1 on `#111111`, border is 16.6:1) + DESIGN §1 | DONE | 45e1c7d | tokens:check, tokens:test | Seen on the emulator only after the next android-e2e run |
| B0-10 | Status-signal rule (DESIGN §3) + test: raw status variants on Toast, Alert, Badge render an icon and a text label | DONE | af0c20a | `status-signal.test.tsx` 22 cases (raw light + dark × 3 components × 3 variants, Alert info, custom icon override, raw success = warning fill), RED 20/22 first; Opus diff review | Badge height with the icon on a device; Chip joins in Phase B |
| B0-11 | Sonnet re-review of icons (49c2428, implemented by Haiku) together with B0-8 | DONE | eccc334 (fixes) | Sonnet review approve-with-fixes; all fixes applied | — |
- Owner decision: raw focus ring double rule — keep.
- Ruling: implementers are Sonnet from here on (owner, per the brief); 49c2428 (Haiku) gets a Sonnet re-review in B0-11 — cost if wrong: none.
- Ruling: B0-8 → B0-9/B0-10 run serially (B0-10 consumes the new status icons; all touch `packages/ui`). The B0-11 reviewer is read-only and runs alongside B0-9/B0-10; its fixes, if any, land after B0-10 — cost if wrong: none, the reviewer writes no files.
- Ruling: there is no `info` status role or variant in v0.1 (CLAUDE.md fixes status variants as `destructive | success | warning`); the DESIGN rule names `info` so it applies the day one is added, and the test enumerates each component's actual status variants. Alert's `default` variant already carries the info glyph and gets `InfoIcon` — cost if wrong: adding an `info` role later is one token row per palette plus one test row.
- Ruling: Chip has no status variants yet (ORCHESTRATOR §2c adds them in Phase B), so the B0 test covers Toast, Alert and Badge; Chip joins the same test table in its Phase B loop (carry list) — cost if wrong: none, nothing to test today.
- Ruling: status glyphs become `lib/icons` components (DESIGN §5: one icon family), replacing the text glyphs `✓ ! ✕ i` in Toast and Alert — the rule says "icon", and text glyphs scale with OS font size and fall back to system fonts — cost if wrong: small visual change in two components that Phase B rewrites anyway.
- Carried to Phase B (owner, 2026-11-01): Button gets sentence-case text and `LoadingBlocks` instead of the spinner; Input's disabled state uses the dashed-border rule (BrutalSurface `disabled`), not a grey fill; all 10 "not wired" cells on the specimen board get wired; Chip's status variants join the status-signal test.
- B0-11 review (Sonnet, icons 49c2428 + B0-8): approve-with-fixes. Fix round: HomeIcon wall top on grid (`V10`); InfoIcon gets serifs (`M12 4V5M10 10H12V20M9 20H15`) so it can't read as a flipped "!"; icons test gains a real geometry check (path/circle extents inside the 24 box, no fill) instead of only wrapper props; `accessibilityElementsHidden` for iOS. Kept: WarningIcon dot as a 2×3 block (zero-length subpaths render unreliably on iOS).
- Carried to Phase B (B0-11 review): accordion, checkbox and select hand-roll their own `Svg` at stroke 3–4 and chip passes `strokeWidth={4}` — all move to `lib/icons` at the default 2px in their loops; status icons render at ≥ 20 inside Toast/Alert badges (check on device).

## Phase B — components (plan: `docs/ship-plan/phase-b.md`)

- Ruling: each `<Name>Screen.tsx` is that component's specimen; the 12-section Lab of `apexrn-modify.md` §4 is not built — ORCHESTRATOR §3 (final) asks for smoke tests, an emulator flow and the specimen, not the Lab — cost if wrong: Lab chrome added later, specimens move into it.
- Ruling: tasks inside a wave run in parallel in the main checkout (not worktrees: harness worktrees branch from `main`, which lacks B0). Each task owns four paths and commits with `git commit -- <paths>`; shared files are controller-owned — cost if wrong: an index.lock retry or a typecheck error from a neighbour's in-flight file.
- Ruling: one android-e2e run per wave push covers that wave's flows (~20 min per run) — cost if wrong: a flow failure is found per wave, not per component.

| # | Task | Status | Commit | Verified | Not verified |
|---|---|---|---|---|---|
| B-1 | Harness: palette render helper, deep links, flow template, peers, tracker | DONE | f3f49c5, 534e897, 15fc9b8, 8dffb0a, 785e2f7 | 130 tests (renderInPalettes; deep links: known id, unknown id, none); typecheck; doctor; web export; registry build; `expo config` shows the scheme; Opus diff review | Maestro `config.yaml` globs + `_open.yaml` until the next android-e2e run; renderInPalettes test was written with its code (not seen RED) |
- Ruling: the tracker has 37 rows (34 Home components + 3 new); ORCHESTRATOR's "36" counted Text and BrutalSurface, finished in B0 — cost if wrong: none.
- Ruling: B-1 infra diff reviewed by the Opus controller only (harness code, no component) — cost if wrong: one less independent read; the emulator run is the real check.
- Parallel batch W2a (2026-11-01), each task owns only these paths:
  - B-2 Button: `packages/ui/components/button.tsx`, `demo/src/screens/ButtonScreen.tsx`, `demo/__tests__/button.test.tsx` (+ removes `demo/__tests__/button-loading.test.tsx` into it), `demo/e2e/components/button.yaml`
  - B-3 Label: `packages/ui/components/label.tsx`, `demo/src/screens/LabelScreen.tsx`, `demo/__tests__/label.test.tsx`, `demo/e2e/components/label.yaml`
  - B-4 Separator: `packages/ui/components/separator.tsx`, `demo/src/screens/SeparatorScreen.tsx`, `demo/__tests__/separator.test.tsx`, `demo/e2e/components/separator.yaml`
  - B-5 Badge: `packages/ui/components/badge.tsx`, `demo/src/screens/BadgeScreen.tsx`, `demo/__tests__/badge.test.tsx`, `demo/e2e/components/badge.yaml`
  - B-6 Avatar: `packages/ui/components/avatar.tsx`, `demo/src/screens/AvatarScreen.tsx`, `demo/__tests__/avatar.test.tsx`, `demo/e2e/components/avatar.yaml`
  - B-8 Progress: `packages/ui/components/progress.tsx`, `demo/src/screens/ProgressScreen.tsx`, `demo/__tests__/progress.test.tsx`, `demo/e2e/components/progress.yaml`
- Ruling: Progress's indeterminate state loops (`withRepeat`), like `LoadingBlocks`: a loading indicator, not decoration; static under reduced motion — DESIGN §4's loop ban targets decoration — cost if wrong: one static variant.
- Ruling: static, non-compound components (Separator, Label, Avatar, Badge) skip the controlled/uncontrolled, disabled and compound-throw smoke tests — nothing to test — cost if wrong: none.
- Ruling: an avatar's initials are a monogram, so they stay uppercase outside the `label` variant (one commented exception) — cost if wrong: one style line.
- Fix (controller): `_open.yaml` waits for Home before `openLink` — run 41235050444 showed the VIEW intent reach the activity ~1s before JS booted, so the Linking event was lost (6db916f). Website playground config drops the removed `withShadow` controls (8ab64ea).
- Parallel batch W2b (2026-11-01), each task owns only these paths:
  - B-7 Skeleton: `packages/ui/components/skeleton.tsx`, `demo/src/screens/SkeletonScreen.tsx`, `demo/__tests__/skeleton.test.tsx`, `demo/e2e/components/skeleton.yaml`
  - B-9 Alert: `packages/ui/components/alert.tsx`, `demo/src/screens/AlertScreen.tsx`, `demo/__tests__/alert.test.tsx`, `demo/e2e/components/alert.yaml` (keeps `status-signal.test.tsx` green, does not edit it)
  - B-10 Card: `packages/ui/components/card.tsx`, `demo/src/screens/CardScreen.tsx`, `demo/__tests__/card.test.tsx`, `demo/e2e/components/card.yaml`
  - B-11 ListItem: `packages/ui/components/list-item.tsx`, `demo/src/screens/ListItemScreen.tsx`, `demo/__tests__/list-item.test.tsx`, `demo/e2e/components/listitem.yaml`
  - B-12 FAB: `packages/ui/components/floating-action-button.tsx`, `demo/src/screens/FABScreen.tsx`, `demo/__tests__/fab.test.tsx`, `demo/e2e/components/fab.yaml`
  - Barrel: Card's new parts and removed `CardText` need `packages/ui/components/index.ts` — the Card task owns that one line.
- Slowness fix (2026-11-01): parallel agents each ran the full Jest suite (one worker per core), so one test file took ~200s. Leftover full runs were killed; agents now run only their own file with `--maxWorkers=1`, and the controller runs the full suite once per batch.
- Parallel batch W3a (2026-11-01), each task owns only these paths:
  - B-13 Input: `packages/ui/components/input.tsx`, `demo/src/screens/InputScreen.tsx`, `demo/__tests__/input.test.tsx`, `demo/e2e/components/input.yaml`
  - B-15 Checkbox: `packages/ui/components/checkbox.tsx`, `demo/src/screens/CheckboxScreen.tsx`, `demo/__tests__/checkbox.test.tsx`, `demo/e2e/components/checkbox.yaml`
  - B-16 Switch: `packages/ui/components/switch.tsx`, `demo/src/screens/SwitchScreen.tsx`, `demo/__tests__/switch.test.tsx`, `demo/e2e/components/switch.yaml`
  - B-17 RadioGroup: `packages/ui/components/radio-group.tsx`, `demo/src/screens/RadioGroupScreen.tsx`, `demo/__tests__/radio-group.test.tsx`, `demo/e2e/components/radiogroup.yaml`
- Ruling (2026-11-01): this machine has 2 cores and 7 GB RAM (0.5 GB free under load), so at most **2 implementers run at once** from here on; the full Jest suite and typecheck of the whole branch run in GitHub CI (Linux runners) on each push, not locally — measured: one test file took 140s with five agents running — cost if wrong: less parallelism, but each agent finishes in minutes instead of ~40.

### Owner rulings (2026-11-01, final)
- B-20: specimen cells a component cannot be put in from outside are labelled `internal`; no display-only props on public components. Test asserts no cell reads "not wired".
- DatePicker: single mode closes on tap — kept. Range mode does not exist yet → 0.2 list.
- BottomNav: revert — labels on all tabs by default, optional `labelMode="selected"`; large-font-scale fallback stays.
- InputOTP digits only: kept for 0.1.0, listed under CHANGELOG known gaps.
- Drawer stays one file (567 lines): single-file components are intentional for the copy-paste model.

### Operating rules (owner, 2026-11-01, effective now — speed first)
1. No questions to the owner; every open choice is a ruling logged here. Only the Phase C device checklist, website landing screenshots (send, don't wait) and the final publish/Pages commands go to the owner.
2. One Sonnet implementer + one combined Sonnet review per task; Opus review only for public component APIs, DESIGN.md tokens, the CLI, and the website landing/design system.
3. Don't wait on CI between tasks; red CI is its own task. Only merges into ship/v0.1 and main need green CI.
4. Phase B ends when B-40 and B-41 are done; only blocking issues they surface are fixed in 0.1.0, the rest goes to the 0.2 list.
5. Phase D (website rebuild) runs now, in parallel, on its own agents.

### B-40 / B-41 results
- B-40 reference screens: DONE (9cf4ac6). Screenshots light + dark only — the demo has no preset switch (0.2 list).
- B-41 fresh-app check: `scripts/fresh-app-check.mjs`. First run: registry, scaffold, peers, init, add --all, web export PASS; `tsc` FAIL in a fresh SDK 58 app (RN 0.88, @types/react 19.3): ref types for View/TextInput/ScrollView, `disabled: boolean | null`, `TextInputContentSizeChangeEventData` renamed. Ruling: **blocking** — a fresh install must typecheck — fixed in 0.1.0 by typing refs/events from the component types themselves (works on SDK 57 and 58). The script's peer install adds react-dom + react-native-web (needed for web export in a blank app).

### 0.2 list
- DatePicker range mode.
- Demo preset (neo/raw) switch so reference screens can be shot in all four palettes.
- ListItem: built-in switch/checkbox trailing control with one label and row-toggle; a grouped-list wrapper with automatic rules.
- FAB passes its ink colour to a render-prop icon (as AppBarAction does).
- A label/value summary row primitive (Checkout totals).
- Reference screens: add Chips + BottomNav (Inbox), Drawer (Settings), Toast on Checkout submit per DESIGN §8.
- InputOTP: alphanumeric `pattern`.

### Site v2 (2026-11-02): Fumadocs + poster landing
- Rejected v1 site replaced. Plan: `docs/ship-plan/site-v2.md`.
- Ruling: the machine has 2 cores and 7 GB of RAM, so preview and web run as 2 parallel agents on separate branches, merged into `ship/site-v2`. The landing starts once the web foundation is merged. Cost if wrong: about 30 minutes of serial time.
- Ruling: the preview example sources live in `preview/src/examples/<slug>/<example>.tsx` and import only from `@apexrn/ui`. The website reads those files as text for the Code tab, so the code shown is the code that runs.
- Design skills (owner, 2026-11-02). Ran frontend-design (plan in `site-v2.md`), Leonxlnx `design-taste-frontend` (tasteskill v2, not the soft variant) and Vercel `web-design-guidelines` (fetched live).
- `redesign-existing-projects` no longer exists upstream; tasteskill folded it into the "Redesign" route of `design-taste-frontend`. Ruling: we follow that route. Its "record the before" step uses the owner's rejection list, because no build of the old site exists on disk.
- Conflict rulings (our spec wins in each case):
  - tasteskill bans monospace labels, tracked uppercase labels, index numbers, thin rules and grid lines, and shadows at rest. Our brief requires mono part numbers (AX-0NN are real catalogue IDs, not ornament), ruled tables, a visible grid behind the phone, and hard offset shadows.
  - Vercel's "Title Case for headings and buttons" is overruled by DESIGN.md §2 sentence case.
- Adopted from tasteskill:
  - headings at most two lines at every width;
  - equal outer margins;
  - section gap ≥120px on desktop;
  - running text in full ink, not grey;
  - one accent;
  - left alignment by default;
  - one h1, and a heading on every section;
  - nav = wordmark, a few links and one action;
  - the footer wordmark at full width;
  - no blank stretches.
- Adopted from Vercel: every rule other than the Title Case one is a build rule, and a full audit runs before the checkpoint.
