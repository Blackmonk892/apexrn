# Ship run ledger: ApexRN v0.1.0

Source of truth for the ship run (`rework/ORCHESTRATOR.md`). One row per task. "Verified" lists what was actually run; "Not verified" is never left blank.

Branches: `ship/v0.1` (integration) ← `ship/phase-<x>` (one per phase).

## Rulings

- Ruling: `ORCHESTRATOR.md` and `DESIGN.md` live in `rework/`, not the repo root; treat `rework/DESIGN.md` as "the design bible" wherever ORCHESTRATOR says `DESIGN.md` — that is where the owner put them — cost if wrong: none, content is identical.
- Ruling: no PRs are opened. `gh` is not installed and there is no API token, so phase branches are pushed, CI runs on push (`ci.yml` triggers on `ship/**`), and the phase is merged into `ship/v0.1` locally with `git merge --no-ff` after CI is green and the Opus review is done. Each merge commit carries the review summary that would have been the PR body — cost if wrong: owner loses PR-page history; they can still open a PR for `ship/v0.1` → `main` before the final merge.
- Ruling: CI status is read through the public GitHub REST API (repo is public; unauthenticated, 60 req/h) — cost if wrong: polling is rate-limited, so poll at ≥ 2-minute intervals.
- Ruling: Android emulator verification runs in GitHub Actions (`ubuntu-latest` + KVM, `reactivecircus/android-emulator-runner`, Maestro), not locally. This machine has no Android SDK, emulator or Maestro, and installing several GB of SDK onto the owner's machine is outside the granted authority — cost if wrong: slower fix loop (a CI run per emulator attempt, ~20 min).
- Ruling: the emulator app is a `expo prebuild` + Gradle **release** APK (JS bundle embedded, debug keystore), built only in CI; `demo/android/` stays untracked — cost if wrong: a release build hides dev-only red boxes, so the Maestro flow also asserts that no "Render Error"/"TypeError" text is visible and the JS smoke tests cover dev warnings.
- Ruling: `preview/` native-safety guards (App.tsx listener, protocol.ts postMessage) are verified by typecheck + review only, no Jest in `preview/`: it is a web-only runtime and Phase D rewrites its protocol, where it gets tests — cost if wrong: a native run of `preview/` could still crash; nobody runs it natively.
- Ruling: `demo/app.json` gains `android.package: "dev.apexrn.demo"` (required for prebuild) — cost if wrong: cosmetic id, changeable any time before a store release (none planned).

## Phase A — make it run

| # | Task | Status | Commit | Verified | Not verified |
|---|---|---|---|---|---|
| A1 | Expo drift, drop lucide + expo-modules-core, CLAUDE.md truth | TODO | | | |
| A2 | Jest + RNTL harness in demo | TODO | | | |
| A3 | Native-safe window access (demo + preview) | TODO | | | |
| A4 | `useTheme()` dev warning outside provider | TODO | | | |
| A5 | CI: tests, preview, website, check-no-rn | TODO | | | |
| A6 | CI: Android emulator + Maestro launch flow | TODO | | | |
