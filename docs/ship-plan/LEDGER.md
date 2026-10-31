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

## Phase B0 — design system first (PR: pending) — serial, owner sign-off at end

| # | Task | Status | Commit | Verified | Not verified |
|---|---|---|---|---|---|
| B0-1 | Colour roles, neo + raw presets, provider `preset`, contrast gate | DONE | 697edca, 79eb871 | tokens:check (4 palettes, text ≥4.5, border/ring ≥3, shadow ≥1.5); tokens:test 3 (RED via stub); 11 theme/harness tests incl. nested providers + fallback; typecheck; generate-docs; website tsc | Values are start values until B0-7; no device run |
| B0-2 | `lib/variants.ts` + `lib/motion.ts` | DONE | f462442, f9f86be | 7 variants tests (defaults, unknown/null/inherited-key fallback, no base mutation); motion values + useMotion reduced path; typecheck; registry build (44 items) | Easing curves not visually checked until B0-6 |
| B0-3 | BrutalSurface on the depth ladder; press, ring, disabled, invalid | DONE | aed90fd, af3cbac | 15 BrutalSurface tests (depth neo 4 / raw 2, flat, disabled dashed+no press+no haptic+stable margin, invalid, ring focus/blur/gated, press sink, reduced motion, mid-press reset); 43 suite tests; typecheck; web export | Ring on web keyboard focus not checked in a browser; press translate asserted via shared value (mock limit); no device run |
| B0-4 | `Text` primitive + loading blocks | DONE | 71e121b, 898d661 | 16 tests: each variant size/line/weight, label mono+uppercase, 1.3 cap, muted tone dark, header role; LoadingBlocks 3 blocks, progressbar role, no withRepeat under reduced motion; typecheck; registry (46 items); generate-docs | Mono font rendering per platform not seen on screen yet (B0-6); Text has no live preview on the site yet |
| B0-5 | Icons on the §5 grid | DONE | 49c2428 | 8 icon tests (2px stroke, square caps, miter, 24 viewBox, no fill, hidden from a11y), RED on 3px first | Glyph legibility at 2px seen on screen in B0-6 |
| B0-6 | Specimen board | DONE | 3485672 | 8 specimen tests (4 quadrants × 23 roles, 5 type specimens, depth 4/2); 75 suite tests; web screenshots desktop + phone reviewed by Opus | Maestro specimen flow not yet run in CI; device |
| B0-7 | Tune and lock values | DONE | 94e1166 + DESIGN.md lock | shadow-slab test RED→GREEN; tokens:check; 76 suite tests; re-shot screenshots reviewed by Opus; DESIGN table cross-checked against colors.ts by script (0 mismatches) | Emulator screenshots of the board: pending CI; raw dark shadow is subtle (owner to judge) |
- Ruling: B0-1 keeps BrutalSurface's `offset` prop (only token reads migrate); B0-3 owns the BrutalSurface API change — keeps tasks reviewable separately — cost if wrong: none.
- Ruling: raw `ring` = the ink foreground (light `#111111`, dark `#F2F0EB`), not the signal red — in raw, red already means error/destructive, so a red focus ring would read as an error state; the 2px offset gap distinguishes the ring from the border — cost if wrong: focus is less loud in raw (tunable on the specimen board).
- Ruling: neo dark `background` stays `#1A1A1A` (current palette, DESIGN §1.1 tunes the shadow against it); only `surface` is `#222222` — cost if wrong: none.
- Ruling: the radio is square (DESIGN §1.3: radius 0, no exceptions); Phase B's radio loop makes the indicator distinguishable from Checkbox by its inner mark — cost if wrong: radio and checkbox look alike until Phase B.
- Ruling (B0-7 tuning): the shadow is one solid slab — the shadow layer's border takes the shadow colour, not the surface border — dark mode otherwise showed white-outlined slabs (the glow DESIGN §1.1 removes) — cost if wrong: none visible in light (both black).
- Ruling (B0-7 tuning): neo dark `shadow` = `#5A5A5A` (~2.5:1 on `#1A1A1A`); `#4A4A4A` vanished once the slab was solid — cost if wrong: a slightly lighter shadow, tunable in one token.
- Ruling (B0-7 tuning): raw keeps the ink focus ring; on screen it reads as a deliberate double rule (misregistered print), clearly distinct from idle — cost if wrong: owner may want louder focus in raw.
- Ruling: values locked in rework/DESIGN.md §1 (B0-7, 2026-10-31) — owner sign-off pending — cost if wrong: one token edit per value.
- Carried to Phase B (B0 final review): hard-coded shadow math in dialog, tabs, slider, switch, input-otp, dropdown-menu (SHADOW_OFFSET 4), drawer (SHADOW_WIDTH 6) must read `useTheme().elevation`; chip/slider/switch must pass `disabled` to BrutalSurface instead of switching elevation (layout shift); component-level disabled copies to remove; radio indicator redesign.
