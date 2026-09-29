# Releasing ApexRN

Status: **ready to test for release, not ready to ship.** The code and tooling are done. What is left needs a real device, a real Expo app, GitHub and npm, none of which can be checked from inside this repo. The full checklist lives in `shipping.md`; this page is the summary and the exact steps.

_Last updated 2026-09-30._

## Where things stand

### Done and verified

| Area | Evidence |
|---|---|
| 36 components + theme/tokens/lib | `npm run typecheck`, `npx expo export --platform web`, `npm run doctor` all green |
| Registry (42 items) | `node registry/build.mjs`; fails on unresolved imports, missing descriptions, duplicate export names |
| CLI (`init`, `add`, `diff`, `list`, barrel) | 18 `node:test` tests against throwaway Expo-shaped projects |
| Installed output compiles | `add --all` into a scratch app (non-monorepo layout) typechecks |
| Docs | `docs/components.md`: all 29 snippets typecheck against the real components |
| Contrast | `npm run tokens:check`: every text/background token pair is at least 4.5:1 in light and dark |
| Release files | LICENSE (MIT), CHANGELOG, CONTRIBUTING, README, CI workflow |
| New variants visually | Badge, Button and Toast checked in headless Chrome, light and dark (web only) |

### Not done (these block a real release)

1. **Nothing is committed.** Everything is in the working tree.
2. **The CLI has never run against a fresh `create-expo-app`.** The tests use fake Expo-shaped folders. The real run is the check most likely to surface a surprise (`expo install`, SDK version drift, alias setup).
3. **CI has never run on GitHub.** The Linux job is where a leftover filename-case bug would show up.
4. **Android and iOS are not both verified.** Components were tested in Expo Go, but the ship gate needs both platforms. Reanimated 4 with the New Architecture often fails on only one. Also untested: screen readers (TalkBack, VoiceOver), reduced motion, largest font size, and dark mode on AppBar, Drawer, BottomNav, SearchBar and Chip.
5. **The registry is not hosted and the CLI is not published.** The default registry URL (`https://blackmonk892.github.io/apexrn`) returns 404 until Pages is enabled and the workflow has run. `npx apexrn` does not exist until the CLI is published.

### Not blocking, but know about it

- There are no component unit tests. The CLI and registry are tested; the components are tested by hand.
- Text on `primary` is now black in both themes (it was white and failed contrast at 3.2:1 light, 2.8:1 dark). To go back to white, edit `primaryForeground` in `colors.ts`; `tokens:check` will then fail, by design.
- `Sheet` is controlled-only. Its `Modal` owns the children, so there is no place for a trigger.

## Steps to release 0.1.0

Do these in order. Stop at the first failure.

### 1. Commit

Split into reviewable commits: (a) the renames, (b) registry and CLI, (c) component DX changes, contrast and docs. Renames are pure moves plus import edits, so keeping them separate lets git track them as renames.

### 2. Test the CLI on a real Expo app

```bash
npx create-expo-app@latest test-app && cd test-app
node ../apexrn/packages/cli/bin/apexrn.mjs init --registry ../apexrn/registry/public
node ../apexrn/packages/cli/bin/apexrn.mjs add button card dialog toaster
```

Run `node registry/build.mjs` in the ApexRN repo first so `registry/public` exists. Then follow the "Next steps" the CLI prints: wrap the root in `GestureHandlerRootView`, `ApexRNProvider` and `Toaster`, render a `Button`, and start the app with `npx expo start`. Repeat on Windows, macOS and Linux if you can.

Check that: the files land where `apexrn.json` says, `expo install` picks SDK-matched versions, the import from the generated `index.ts` resolves, and the app renders.

### 3. Push and confirm CI

Push a branch and open a PR. Both jobs in `.github/workflows/ci.yml` must be green: `demo` (doctor, typecheck, web export) and `registry-and-cli` (contrast, registry build, CLI tests).

### 4. Verify on devices

On a physical Android device and a physical iOS device, run `cd demo && npx expo start` and go through `shipping.md` phase 1: Drawer, AppBar, BottomNav, SearchBar, Chip, then the earlier high-risk ones (Sheet, Slider, Carousel snapping, Toast top offset, Dropdown positioning on Android). Then screen reader, reduced motion, dark mode and largest font size. Record what was and was not verified in the tracker in `apexrn-modify.md`, and do not claim device behaviour from a web run.

### 5. Publish (only when you decide to)

1. **Registry:** enable GitHub Pages (Settings, Pages, Source: GitHub Actions), then run the `publish-registry` workflow manually. Confirm `https://<your-user>.github.io/apexrn/index.json` loads. If you host elsewhere, change `DEFAULT_REGISTRY` in `packages/cli/src/registry.mjs`.
2. **CLI:** in `packages/cli/package.json` remove `"private": true`, check the name `apexrn` is free on npm, then `npm publish` from that folder. Check `npm pack --dry-run` first: only `bin/`, `src/`, `package.json` should ship.
3. **Tag:** move the changelog's Unreleased entry to `0.1.0` and `git tag v0.1.0`.
4. **Smoke test from a clean machine or empty folder:** `npx apexrn init && npx apexrn add button`.

Publishing to npm or making the registry public cannot be cleanly undone, which is why steps 2 to 4 come first.

## Ship gate

All of these must be true for v0.1.0:

- [ ] Every shipped component verified on Android and iOS, tracker updated honestly.
- [ ] CI green on Linux.
- [ ] `npx apexrn init` and `add` work on a fresh Expo app on Windows, macOS and Linux.
- [ ] Docs cover install, theming and every component (done: `docs/components.md`).
- [ ] Licence, README and changelog in place (done).

## Keeping it releasable

Run before every PR (also in CI):

```bash
cd demo && npm run doctor && npm run typecheck && npx expo export --platform web
node registry/check-contrast.mjs && node registry/build.mjs && (cd packages/cli && npm test)
```

Rules that keep the CLI working: components import shared code as `../lib/x` and siblings as `./x`; every component has a named export and an entry in `registry/meta.json`; never run `npm install` inside `packages/ui`.
