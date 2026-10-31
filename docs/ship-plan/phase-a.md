# Phase A: Make it run. Implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The demo launches on Android with no red screen, the environment is drift-free, a Jest harness exists, and CI covers demo, preview, website and an Android emulator launch.

**Architecture:** Fix the four native-unsafe `window` reads, align Expo deps with `npx expo install`, add `jest-expo` + RNTL inside `demo/` (resolving `@apexrn/ui` to `packages/ui` the same way Metro does), make `useTheme()` warn once outside a provider, then extend `.github/workflows/ci.yml` with test/preview/website jobs and an emulator job that builds a release APK and runs a Maestro flow.

**Tech Stack:** Expo SDK 57, RN 0.86.3, React 19.2.3, Reanimated 4.5.1, jest-expo, @testing-library/react-native, Next 16 (website), GitHub Actions, Maestro.

**Spec:** `rework/ORCHESTRATOR.md` §2 (Phase A), `CLAUDE.md` hard rules, `apexrn-context.md` Part D (crash), `docs/ship-plan/LEDGER.md` (rulings).

## Global Constraints

- Never `npm install` in `packages/ui`; no `node_modules`/lockfile there. `cd demo && npm run doctor` stays green.
- Never add `"@apexrn/ui": "file:../packages/ui"` to any package.json.
- Do not touch the Metro `resolveRequest`, the tsconfig `"*"` mapping (`@types/*` first), `experiments.tsconfigPaths: false`, or the preset-only babel config.
- Dependency versions change only through `npx expo install <pkg>` (demo/ and preview/). Dev deps may be added in demo/, preview/, website/.
- TypeScript strict, `noUnusedLocals`/`noUnusedParameters`, no `any` in public APIs. Comments explain why.
- Every behaviour change ships with a test that fails before it.
- Commit format: `fix(demo): …`, `chore(deps): …`, `test(demo): …`, `ci: …`, `fix(ui): …`. End every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Never force-push, rewrite history, or `npm publish`.

## Review Focus

1. Web embed mode: `demo` web at `/lab/?embed=1#button` must still drop the header after the `Platform.OS` guard (A3 test covers web branch).
2. `useTheme()` outside a provider warns **once per process**, not once per component render, and never when `__DEV__` is false (A4 tests both).
3. Jest must load the same React copy for `packages/ui` and the test (an "Invalid hook call" in the harness means a second copy); A2's smoke test renders a hook-using component from `@apexrn/ui`.
4. `check-no-rn` must not false-positive on prose: website docs legitimately say "react-native"; only `package.json` dependency keys and `import`/`require` specifiers in `website/src` and `website/scripts` count (A5 tests a fixture of each).
5. Removing `expo-modules-core` from demo deps must not break `npm run doctor` or the Android build (A1 runs doctor + `expo export --platform android`).

---

### Task 1 (A1): Expo drift, dead deps, CLAUDE.md truth

**Files:**
- Modify: `demo/package.json`, `demo/package-lock.json`, `preview/package.json`, `preview/package-lock.json` (via `npx expo install` / `npm uninstall` only)
- Modify: `demo/app.json` (remove keys expo-doctor rejects; add `android.package`)
- Modify: `CLAUDE.md` (repo layout + rules 3/4 + rebuild loop step 4)

**Interfaces:** Produces a demo and preview where `npx expo-doctor` reports 0 failed checks.

- [ ] **Step 1:** In `demo/`: `npm uninstall lucide-react-native expo-modules-core`, then `npx expo install --check --fix` (answer yes). Repeat `npm uninstall expo-modules-core` + `npx expo install --check --fix` in `preview/`.
- [ ] **Step 2:** Run `npx expo-doctor` in both. Fix every remaining failure in `app.json` (remove only keys it names as invalid for SDK 57). Add `"package": "dev.apexrn.demo"` under `expo.android` in `demo/app.json`. Keep `experiments.tsconfigPaths: false` and `experiments.baseUrl: "/lab"`.
- [ ] **Step 3: Verify.** In `demo/`: `npx expo-doctor` → "0 checks failed" (or all passed); `npm run doctor` → OK; `npm run typecheck` → clean; `npx expo export --platform web --output-dir <scratch>` and `--platform android` → both bundle. In `preview/`: expo-doctor, doctor, typecheck, `npm run build:web`. Confirm `packages/ui` still has no `node_modules`.
- [ ] **Step 4:** Edit `CLAUDE.md` to match the code: Metro aliases only `@apexrn/ui` (the `@ui/*` alias is gone); rule 4 drops the `@ui/*` sentence; layout tree adds `preview/` (iframe runtime for the website), `website/` (Next.js site), `docs/ship-plan/` (ship ledger); note the Component Lab is not built yet (the demo is a screen router). Do not change any other rule.
- [ ] **Step 5: Commit** `chore(deps): align Expo SDK 57, drop unused lucide + expo-modules-core` (deps + app.json) and `docs: CLAUDE.md matches current wiring` (separate commit).

### Task 2 (A2): Jest + RNTL harness in demo

**Files:**
- Modify: `demo/package.json` (devDeps via `npx expo install jest-expo jest @testing-library/react-native @types/jest -- --save-dev`; script `"test": "jest"`)
- Create: `demo/jest.config.js`, `demo/jest.setup.ts`, `demo/__tests__/harness.test.tsx`
- Modify: `demo/tsconfig.json` only to add `"types": ["jest"]`-equivalent coverage for `__tests__` if tsc needs it (do not touch `paths`).

**Interfaces:**
- Produces: `npm test` in `demo/`; test files live in `demo/__tests__/**/*.test.tsx`; `@apexrn/ui` resolves to `../packages/ui/index.ts`; `expo-haptics` and Reanimated are mocked in `jest.setup.ts`; a helper `renderWithTheme(ui, { mode?: 'light' | 'dark' })` exported from `demo/__tests__/utils/render.tsx` that wraps in `ApexRNProvider defaultMode={mode}` (default `'light'`). Later phases add `preset` to this helper.

- [ ] **Step 1: Write the failing test** `demo/__tests__/harness.test.tsx`:
  - `it('renders a library component through @apexrn/ui')`: `renderWithTheme(<Button>Save</Button>)`; `expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()`.
  - `it('resolves one React copy for lib and test')`: `expect(require.resolve('react', { paths: [path.resolve(__dirname, '../../packages/ui/components')] })).toBe(require.resolve('react'))` is not valid under Jest's resolver; instead assert the Button render above produced no `console.error` containing "Invalid hook call" (spy on `console.error`).
  - `it('renders in dark mode')`: `renderWithTheme(<Button>Save</Button>, { mode: 'dark' })` → button present.
- [ ] **Step 2:** `npm test` → fails (no jest config / module not found).
- [ ] **Step 3: Implement** `jest.config.js`: `preset: 'jest-expo'`; `moduleNameMapper: { '^@apexrn/ui$': '<rootDir>/../packages/ui/index.ts' }`; `moduleDirectories: ['node_modules', '<rootDir>/node_modules']` so files under `packages/ui` resolve bare imports to demo's single copy; `roots: ['<rootDir>/__tests__']`; `setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']`; make sure Babel transforms `../packages/ui/**` (if babel skips files outside `rootDir`, set `transform` with `babel-jest` and `{ configFile: <demo>/babel.config.js }`). `jest.setup.ts`: `jest.mock('expo-haptics')` with no-op `impactAsync`/`selectionAsync`/`notificationAsync` and the enum objects the library reads; Reanimated via `require('react-native-reanimated').setUpTests?.()` or the documented Reanimated 4 jest setup — use whichever the installed version documents in `node_modules/react-native-reanimated` (check its docs/README, not memory).
- [ ] **Step 4:** `npm test` → 3 passing; `npm run typecheck` → clean; `npm run doctor` → OK.
- [ ] **Step 5: Commit** `test(demo): jest-expo + RNTL harness resolving @apexrn/ui`.

### Task 3 (A3): Native-safe window access

**Files:**
- Modify: `demo/src/components/Layout.tsx:17`, `demo/src/screens/PlaygroundScreen.tsx:20-29`, `preview/App.tsx:36-45`, `preview/src/protocol.ts:44-46`
- Test: `demo/__tests__/native-globals.test.tsx`

**Interfaces:** Consumes `renderWithTheme` from A2.

- [ ] **Step 1: Write failing tests** in `native-globals.test.tsx` (jest-expo runs as iOS/Android by default, where `window.location` is undefined — if jsdom provides `location`, delete it in the test with `Object.defineProperty(window, 'location', { value: undefined, configurable: true })` and restore after):
  - `it('Layout renders on native without window.location')`: render `<Layout title="APEXRN"><Text>child</Text></Layout>` → `getByText('child')` and header title `APEXRN` visible.
  - `it('PlaygroundScreen mounts on native without window.addEventListener')`: with `window.addEventListener` set to `undefined`, render `<PlaygroundScreen componentId="button" onBack={() => {}} />` → no throw.
  - `it('Layout embed mode still works on web')`: `jest.replaceProperty(Platform, 'OS', 'web')` (or mock `Platform.OS`), set `window.location = { search: '?embed=1' }` → header title `APEXRN` is **not** rendered, child is.
- [ ] **Step 2:** `npm test -- native-globals` → first two FAIL with "Cannot read property 'search' of undefined" / "addEventListener is not a function".
- [ ] **Step 3: Implement.** Layout: `const search = Platform.OS === 'web' ? window.location?.search ?? '' : '';` with the why-comment from `apexrn-context.md` Part D. PlaygroundScreen effect: `if (Platform.OS !== 'web') return;` first line. preview/App.tsx effect: same guard (still call nothing on native). preview/protocol.ts `postToParent`: `if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.parent || window.parent === window) return;` (import `Platform`).
- [ ] **Step 4:** `npm test` all green; demo + preview `npm run typecheck` clean; `npx expo export --platform web` in demo still bundles.
- [ ] **Step 5: Commit** `fix(demo): guard window.location/listeners on native (launch red screen)`.

### Task 4 (A4): `useTheme()` warns once outside a provider

**Files:**
- Modify: `packages/ui/lib/theme.tsx` (the `useTheme` fallback branch)
- Test: `demo/__tests__/theme-provider-warning.test.tsx`

**Interfaces:** `useTheme()` signature and fallback return value unchanged.

- [ ] **Step 1: Write failing tests** (use `jest.isolateModules` so the once-flag resets per test):
  - `it('warns once when used without ApexRNProvider in __DEV__')`: render `<Button>A</Button>` and `<Button>B</Button>` with **no** provider; `console.warn` called exactly once, message contains `ApexRNProvider`.
  - `it('does not warn inside a provider')`: `renderWithTheme(<Button>A</Button>)` → `console.warn` not called.
  - `it('does not warn when __DEV__ is false')`: set `global.__DEV__ = false` in the isolated module scope, render without provider → not called; restore.
  - `it('still returns the light fallback')`: a probe component calling `useTheme()` outside a provider reports `colorScheme === 'light'`.
- [ ] **Step 2:** Run → first test FAILS (0 calls).
- [ ] **Step 3: Implement:** module-level `let warnedMissingProvider = false;` and in the fallback branch `if (__DEV__ && !warnedMissingProvider) { warnedMissingProvider = true; console.warn('[apexrn] useTheme() was called outside <ApexRNProvider>. Falling back to the light theme; wrap your app root in <ApexRNProvider>.'); }`. Replace the "Safe fallback" comment with a why-comment (fallback keeps isolated renders working; the warning surfaces the dead-theme bug).
- [ ] **Step 4:** `npm test` green; `npm run typecheck`; `node registry/build.mjs` (from repo root) still succeeds.
- [ ] **Step 5: Commit** `fix(ui): useTheme warns once in dev when no ApexRNProvider`.

### Task 5 (A5): CI covers tests, preview and website

**Files:**
- Create: `website/scripts/check-no-rn.mjs`, `website/scripts/check-no-rn.test.mjs`, fixtures under `website/scripts/__fixtures__/check-no-rn/{clean,dep,import}/`
- Modify: `website/package.json` (scripts `"typecheck": "tsc --noEmit"`, `"check:no-rn": "node scripts/check-no-rn.mjs"`, `"test:scripts": "node --test scripts/"`)
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces `check-no-rn.mjs` exporting `findRnUsage(websiteDir: string): Array<{ file: string; match: string }>` and a CLI entry (exit 1 and print each hit when non-empty, else print `check-no-rn: OK`). Forbidden: `react-native`, `react-native-*`, `expo`, `expo-*`, `@expo/*`, `@react-native/*`, `@apexrn/ui` as a package.json `dependencies`/`devDependencies` key, or as an `import … from`/`import(`/`require(` specifier in `src/**` and `scripts/**` (`.ts .tsx .js .mjs`). Prose, strings in JSON data and comments do not count. Skip `node_modules`, `.next`, `out`, `__fixtures__`.

- [ ] **Step 1: Write failing tests** `check-no-rn.test.mjs` (node:test): `clean` fixture → `[]`; `dep` fixture (package.json with `"react-native-svg"` in devDependencies) → one hit naming the key; `import` fixture (`src/a.tsx` with `import { View } from 'react-native'`, plus `src/b.tsx` whose only mention is a comment `// works like react-native`) → exactly one hit, in `a.tsx`; real `website/` dir → `[]`.
- [ ] **Step 2:** `node --test website/scripts/` → FAIL (module missing).
- [ ] **Step 3: Implement** `check-no-rn.mjs` (zero deps; regex over import specifiers is enough — match `from\s+['"]X['"]`, `import\(['"]X`, `require\(['"]X`, `^import\s+['"]X`).
- [ ] **Step 4:** tests green; in `website/`: `npm run lint`, `npm run typecheck`, `npm run check:no-rn` all pass locally (if lint/typecheck fail on existing code, fix the code minimally and say so in the report; do not disable rules).
- [ ] **Step 5: Edit `ci.yml`:** triggers `push: branches: [main, 'ship/**']` + `pull_request` + `workflow_dispatch`. Job `demo` adds `npm test -- --ci` after typecheck. New job `preview` (working-directory `preview`: `npm ci`, `npm run doctor`, `npm run typecheck`, `npm run build:web`). New job `website` (Node 22, working-directory `website`: `npm ci`, `npm run check:no-rn`, `npm run test:scripts`, `npm run lint`, `npm run typecheck`, `npm run build` with `NEXT_PUBLIC_SITE_URL: https://blackmonk892.github.io/apexrn`). Keep `registry-and-cli` unchanged. Each job caches npm on its own lockfile.
- [ ] **Step 6: Verify** YAML parses (`node -e "require('fs').readFileSync('.github/workflows/ci.yml','utf8')"` is not a parse check — use `npx --yes yaml-lint .github/workflows/ci.yml` or `python -c "import yaml,sys;yaml.safe_load(open(sys.argv[1]))" .github/workflows/ci.yml`).
- [ ] **Step 7: Commit** `ci: test, preview and website jobs + check-no-rn guard`. The orchestrator pushes and checks the run.

### Task 6 (A6): Android emulator launch in CI (Maestro)

**Files:**
- Create: `demo/e2e/launch.yaml`, `.github/workflows/android-e2e.yml`
- Modify: `demo/.gitignore` (ensure `/android`, `/ios` ignored)
- Modify: `demo/src/screens/HomeScreen.tsx` only if no stable text/`testID` exists to assert on (add `testID="home-screen"` to the root).

**Interfaces:** Produces the workflow later phases add flows to: every `demo/e2e/*.yaml` is run with `maestro test demo/e2e/`. App id `dev.apexrn.demo`.

- [ ] **Step 1: Write the flow** `demo/e2e/launch.yaml`: `appId: dev.apexrn.demo`; `- launchApp: { clearState: true }`; `- extendedWaitUntil: { visible: { id: "home-screen" }, timeout: 60000 }`; `- assertNotVisible: "Render Error"`; `- assertNotVisible: ".*TypeError.*"`; `- takeScreenshot: launch-home`.
- [ ] **Step 2: Write `android-e2e.yml`**: triggers `push` on `ship/**` + `workflow_dispatch`; `ubuntu-latest`, timeout 60 min. Steps: checkout; setup-node 22 (cache demo lock); setup-java temurin 17; enable KVM (udev rule snippet from `reactivecircus/android-emulator-runner` README); `npm ci` in demo; `npx expo prebuild --platform android --no-install` in demo; Gradle cache; `./gradlew assembleRelease` in `demo/android`; install Maestro (`curl -Ls "https://get.maestro.mobile.dev" | bash`, add `$HOME/.maestro/bin` to PATH); `reactivecircus/android-emulator-runner@v2` (api-level 34, target google_apis, arch x86_64, `disable-animations: true`) with script `adb install demo/android/app/build/outputs/apk/release/app-release.apk && maestro test demo/e2e/ --format junit --output maestro-report.xml`; always upload `maestro-report.xml` and `~/.maestro/tests/**` screenshots as an artifact.
- [ ] **Step 3: Verify locally** what can be: YAML parses (as A5 step 6); `npx expo prebuild --platform android --no-install` succeeds in demo on Windows and `demo/android/` is gitignored (`git status` shows nothing new); then delete the generated `demo/android/` folder.
- [ ] **Step 4: Commit** `ci: Android emulator + Maestro launch flow`. The orchestrator pushes; exit for Phase A is this job green with the `launch-home` screenshot showing the home screen.
