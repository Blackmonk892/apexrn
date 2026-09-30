# website.md — ApexRN website plan

What we are building, and how to build it **inside this monorepo without breaking the library, the Lab or the CLI**. Nothing here is built yet; this is the plan. Companion docs: `shipping.md` (release TODO), `docs/releasing.md` (readiness), `docs/components.md` (usage snippets).

_Written 2026-09-30._

## 1. Goal

A professional documentation site for ApexRN, in the spirit of ui.shadcn.com, whose centrepiece is **real components rendering inside a phone frame** (not screenshots).

The site does five jobs:

1. **Sell it:** a landing page with a live phone, the `npx apexrn init` command, and the "you own the code" pitch.
2. **Document it:** one page per component with a live preview, variants, code, props, accessibility notes and the `add` command.
3. **Teach theming:** a live token editor (change colours, watch the phone update, copy the result into `colors.ts`).
4. **Host the registry:** `/index.json` and `/r/*.json`, which the CLI downloads. This also closes the "registry not hosted" blocker in `shipping.md`.
5. **Show the changelog and getting-started guide.**

### Non-goals (for v1)

- No user accounts, comments, search backend or analytics beyond a static-site counter.
- No hosted playground that runs arbitrary user code.
- No native device previews (Expo Snack is at most an "Open in Snack" link later).
- No changes to the component library to suit the website.

## 2. Key facts this plan relies on

- **The website does not depend on publishing.** It builds from the source in this repo. Publishing the CLI to npm only affects the install command shown on the site and the registry URL baked into the CLI (section 9).
- **React Native components run in a browser** through `react-native-web`. The Lab already does: `npx expo export --platform web` produces a static site, and `demo/App.tsx` reads a web-only deep link (`?r=<n>#<screenId>:<light|dark>`, ids from `HomeScreen` GROUPS, for example `button:dark`).
- **Web is not a device.** Haptics do nothing, and Android `Modal` and gesture-root quirks do not appear. The site must say so (section 8).

## 3. Decisions

| Decision     | Choice                                                         | Why                                                                                                                                                                                   |
| ------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Location     | `website/` in this repo                                        | One PR changes component, preview, props and docs together; the registry deploys from the same build. Same layout shadcn uses.                                                        |
| Live preview | **iframe of the Lab's web export**, inside a phone frame       | Overlays (Dialog, Sheet, Drawer, Toast) stay inside the phone; keeps React/Reanimated out of the docs framework (no duplicate trees); the heavy bundle loads lazily.                  |
| Framework    | **Next.js, App Router, `output: 'export'`** (fully static, no server/API routes) | Static output, deploys anywhere. Interactivity is mostly the iframe, so no server is needed; static export keeps hosting free and usage-risk-free. |
| Hosting      | One static host (GitHub Pages, Cloudflare Pages or Vercel)     | The registry is static JSON, so no server.                                                                                                                                            |
| Domain       | **Open: choose before publishing the CLI**                     | The registry URL is baked into the CLI (`DEFAULT_REGISTRY`).                                                                                                                          |
| Look         | The site itself is brutalist, built to show the library off    | Use the `frontend-design` and `ui-ux-pro-max` skills for the design pass.                                                                                                             |

## 4. Architecture

```
apexrn/
├── packages/ui/        # unchanged: SOURCE ONLY
├── packages/cli/       # unchanged
├── registry/           # unchanged; build.mjs -> registry/public
├── demo/               # the Lab. Gains an "embed mode" (section 6). Only place with RN deps.
├── docs/               # components.md (snippets) — the site reads these
└── website/            # Next.js (static export) site. Own package.json + lockfile. NO react-native deps.
    ├── src/ (pages, components, content)
    ├── scripts/        # generators (section 7)
    └── public/         # lab/ and r/ are copied in at build time, gitignored
```

Build pipeline (one CI job, no npm publish involved):

1. `cd demo && npm ci && npx expo export --platform web` -> `demo/dist`
2. `node registry/build.mjs` -> `registry/public`
3. Copy `demo/dist` to `website/public/lab/` and `registry/public/*` to `website/public/` (copies are gitignored, produced only in CI and local builds).
4. `cd website && npm ci && npm run build` -> `website/dist`
5. Deploy `website/dist`.

The site talks to the Lab only through an iframe URL and `postMessage`. It never imports library code.

## 5. Safety rules (do not break)

These map to the hard rules in `CLAUDE.md`.

1. **`website/` has its own `package.json` and lockfile and no React Native dependencies** (no react-native, reanimated, gesture-handler, svg, worklets, expo). All RN dependencies stay in `demo/`. This keeps hard rule 1 (no duplicate react/reanimated trees).
2. **Never run `npm install` in `packages/ui`.** Installing inside `website/` is fine. Do not add `"@apexrn/ui": "file:..."` anywhere (hard rule 2).
3. **Do not edit `metro.config.js`, `demo/tsconfig.json` or `babel.config.js` for the site** (hard rule 3). The one allowed `app.json` change is the web base path in section 6, and it must be verified with `npm run doctor`, typecheck and a web export.
4. **The site never imports from `packages/ui` or `demo/`.** It embeds the built Lab and reads generated JSON. If a generator needs component types, it runs from `demo/`'s TypeScript setup, not by adding paths to the site.
5. **Generated output is never committed:** `website/public/lab/`, `website/public/r/`, `website/public/index.json`, `website/dist/`. Add them to `.gitignore` in the same PR that creates them. (The root `.gitignore` already ignores `dist/`.)
6. **No library changes for the site's sake.** If the site needs something the library lacks (for example a `theme` override prop on `ApexRNProvider`), that is a separate, reviewed library change, not a hack here.
7. **Add a guard:** a check (extend `demo/scripts/doctor.js` or add `website/scripts/check-no-rn.mjs`) that fails if `website/package.json` lists a React Native dependency. Run it in CI.
8. **Say what was and was not verified.** Web previews prove web rendering only (`CLAUDE.md` rule 6).

## 6. Lab "embed mode" (change to `demo/` only)

Today the Lab shows its own header, back button and home list. For embedding we add, without touching `packages/ui`:

- **`?embed=1`:** hide the Layout header/back button and home; render just the specimen for the hash route (`#button:light`). Optionally `&frame=0` to also drop section chrome.
- **Theme sync:** listen for `message` events. Accept only known shapes and check `event.origin` against the site origin (and localhost in dev):
  - `{ type: 'apexrn:theme', mode: 'light' | 'dark' }` calls `setMode`.
  - `{ type: 'apexrn:tokens', light?: Partial<Colors>, dark?: Partial<Colors> }` applies token overrides (below).
- **Ready signal:** post `{ type: 'apexrn:ready' }` to the parent so the site can hide its loading state.
- **Live token overrides:** `colors` is an exported object. In the demo only, `Object.assign(colors.light, overrides.light)` (and dark), then force a re-render by re-setting the theme mode. This is contained in `demo/`. If we later want it as a real library feature, add a `colors` prop to `ApexRNProvider` through the normal component loop.
- **Reduced motion:** honour the parent's setting so screenshots and low-power users get a calm preview.
- **Web base path (open item, verify first):** the Lab is not an Expo Router app, and the default export references assets with absolute `/_expo/...` paths. Served under `/lab/` it will 404 them unless `experiments.baseUrl` is set to `/lab` in `demo/app.json`. Check that this works for the Lab, that `doctor`, typecheck and `expo export` stay green, and that the device build is unaffected. If it is not clean, fall back to hosting the Lab on its own subdomain (`lab.<domain>`) with no base path.

Test the embed on web only through the recipe in `memory/web-verification-recipe.md` (export, serve `demo/dist`, drive Chrome).

## 7. Generated content (never hand-edited)

| Source                                             | Generates                                                                                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `registry/public/index.json`                       | the component list, descriptions, `add` commands, dependency lists (which peers to install)                                                                                                       |
| `docs/components.md`                               | per-component code snippets. Split by heading; these are already typechecked in CI, so they cannot drift                                                                                          |
| TypeScript types of `packages/ui/components/*.tsx` | props tables (name, type, default, description from the JSDoc). Use the TypeScript compiler API or `react-docgen-typescript`, run with `demo/`'s TS configuration so `react-native` types resolve |
| `CHANGELOG.md`                                     | the changelog page                                                                                                                                                                                |
| `packages/ui/lib/colors.ts`                        | the token tables and the defaults for the token editor (parse the same way `registry/check-contrast.mjs` does)                                                                                    |

Rules: a generator failing fails the build (no silent empty tables), and every component in the registry must have a page (build check).

## 8. Pages and content

- **Landing:** a large phone running a curated showcase screen; the copy button for `npx apexrn init`; three short points (you own the code, brutalist tokens, accessible by default); a components gallery strip; a "why not a package" note.
- **Getting started:** install, `init`, add a component, wrap the app (`GestureHandlerRootView`, `ApexRNProvider`, `Toaster`), safe-area insets. Content already exists in `docs/components.md` and the README.
- **Components index:** grid grouped as in `docs/components.md` (Actions, Display, Feedback, Forms, Overlays, Navigation).
- **Component page:** live phone with a light/dark toggle; variants and states shown by choosing the matching Lab specimen; tabs for "Preview / Code"; install command; usage snippet; props table; accessibility notes (role, state, hit target, screen-reader behaviour); related components.
- **Theming:** the token editor (colour pickers per token, light and dark, live in the phone) with a contrast readout using the same 4.5:1 math as `registry/check-contrast.mjs`, warnings when a pair fails, and a "copy `colors.ts`" button.
- **Changelog** and a short **Known limits** box on each preview: "Rendered on the web with react-native-web. Haptics, Android Modal windows and native gestures behave differently on a device."
- **AEO mirror:** alongside each component's HTML page, generate a plain-Markdown mirror (e.g. `/docs/components/<name>/llms.txt`) with the same real name/props/usage snippet, from the same source data — never hand-authored separately. Crawlers and AI agents read static text, not the iframe.

### Design direction

Run the `frontend-design` skill and the `ui-ux-pro-max` searches (style, typography, UX) before building the landing page. Principles from `CLAUDE.md` apply to the site too: brutalism is a decision (thick borders, zero radius, hard shadows, heavy type), but keep hierarchy and restraint, spend boldness in one place (the phone), keep contrast at 4.5:1 or better, and respect reduced motion.

## 9. Publishing and hosting (order matters)

The website does not need the library published. Two things do connect them:

- The install command on the site only works after the CLI is on npm.
- The CLI's `DEFAULT_REGISTRY` (`packages/cli/src/registry.mjs`) must point at the site's registry URL, so the URL must exist before the CLI is published.

Launch order:

1. Choose the domain and host.
2. Build and deploy the site; confirm `https://<domain>/index.json` and `/r/button.json` load.
3. Set `DEFAULT_REGISTRY` to `https://<domain>` (or the chosen path) and re-run the CLI tests.
4. Publish the CLI (`shipping.md` phase 7, only on your explicit go-ahead).
5. Smoke test from an empty folder: `npx apexrn init && npx apexrn add button`.
6. Announce.

Before step 4 you can show the site with a "coming soon" note on the install box, or the working local command: `node packages/cli/bin/apexrn.mjs init --registry <url or path>`.

`.github/workflows/registry.yml` currently deploys only the registry to Pages, by manual trigger. When the site exists, replace it with a single workflow that does the pipeline in section 4, still `workflow_dispatch` at first, then on pushes to `main` after launch, with a path filter (`website/**`, `docs/**`, `packages/ui/**`, `registry/**`, `demo/**`).

## 10. Phases

Sizes: S = a focused session, M = a few sessions, L = a large chunk of work.

### Phase 0 — Decide (S)

- [x] Pick framework: **Next.js, App Router, `output: 'export'`**. Host/domain still open — choose before publishing the CLI (section 9).
- [ ] Decide whether the Lab lives under `/lab/` (needs `baseUrl`) or a subdomain.
- [ ] Choose the phone frame style and the landing showcase screen.

### Phase 1 — Embed mode in the Lab (M)

- [ ] `?embed=1` chrome-less rendering for every specimen. **Not started** — no `embed` handling exists in `demo/App.tsx` or `demo/src` yet (confirmed by repo audit).
- [ ] `postMessage` protocol: theme, tokens, ready; origin checks.
- [ ] Verify the `baseUrl` question (section 6); keep `doctor`, typecheck and export green.
- [ ] Test on web with the Chrome recipe, light and dark, reduced motion.
- [ ] Confirm nothing changed for device builds (start in Expo Go once).

### Phase 2 — Scaffold and pipeline (M)

- [x] Create `website/` with its own `package.json` and lockfile; no RN deps. Scaffolded with `create-next-app` (App Router, TS, ESLint, `src/`), `output: 'export'` set immediately, builds clean (`npm run build` → `website/out/`). Isolated install, not an npm workspace — matches how `demo/` and `packages/cli` already install independently.
- [x] Ignore generated output in `.gitignore` (`.next/`, `out/` added; `node_modules/` already covered globally).
- [ ] Build script implementing section 4 locally (`npm run build` at the repo root or in `website/`).
- [ ] `PhoneFrame` component: responsive, lazy-loaded iframe, loading state, light/dark toggle, ready handshake, `title` for accessibility, and a static fallback image for no-JS.

### Phase 3 — Generated docs (M)

- [ ] Component pages from the registry index with the snippets from `docs/components.md`.
- [ ] Props tables from TypeScript types (section 7); build fails on missing pages or empty tables.
- [ ] Getting-started, changelog and components-index pages.

### Phase 4 — Design and landing (L)

- [ ] Design pass with the two skills; tokens for the site itself.
- [ ] Landing page with the live phone and copy-to-clipboard command.
- [ ] Responsive layouts (phone-width first), dark mode for the site, keyboard and screen-reader pass on the site itself.

### Phase 5 — Token editor (M)

- [ ] Colour controls wired to `apexrn:tokens`; contrast readout; "copy `colors.ts`".
- [ ] Reset to defaults; persist nothing server-side.

### Phase 6 — Hosting and CI (S)

- [ ] One workflow: build Lab, registry and site, deploy; path-filtered.
- [ ] Verify `/index.json` and `/r/*.json` from the deployed URL.
- [ ] Set `DEFAULT_REGISTRY` and update `docs/releasing.md` and `shipping.md`.

### Phase 7 — Launch (S)

- [ ] Follow the launch order in section 9.

## 11. Risks and mitigations

| Risk                                           | Mitigation                                                                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Lab bundle is heavy (RN-web + Reanimated)      | Lazy-load iframes when scrolled into view; one shared warm iframe for the landing page; show a light placeholder first; cache long. |
| Base path breaks assets under `/lab/`          | Verify in Phase 1; fall back to a subdomain.                                                                                        |
| Preview looks different from a device          | Visible "Known limits" note; never claim device behaviour from the site (`CLAUDE.md` rule 6).                                       |
| Site drifts from the library                   | Generated content, typechecked snippets, build fails on missing pages; same-repo PRs.                                               |
| Someone adds RN deps to `website/`             | The no-RN guard in CI.                                                                                                              |
| Token overrides leak into the Lab's normal use | Overrides apply only in embed mode and reset on reload.                                                                             |
| `postMessage` abuse                            | Strict message schema and origin check; ignore everything else.                                                                     |
| SEO: previews are client-rendered              | Docs text, code and props are static HTML; previews have a static poster image.                                                     |
| Registry URL changes after the CLI ships       | Pick the domain first; keep `/r` paths stable and versioned (`index.json` has a `version`).                                         |

## 12. Definition of done (v1)

- [ ] Every component in the registry has a page with a working live preview in light and dark.
- [ ] Props tables and snippets are generated, and the build fails if either is missing.
- [ ] The token editor changes the phone live and reports contrast failures.
- [ ] The deployed site serves `/index.json` and `/r/*.json`, and `apexrn add` works against them.
- [ ] Lighthouse or an equivalent check passes for accessibility and performance on the landing page and one component page.
- [ ] The site is usable at phone width, with keyboard navigation and reduced motion honoured.
- [ ] `npm run doctor`, typecheck, web export, `tokens:check` and the CLI tests are still green.
- [ ] `website/` has no React Native dependencies, and no generated files are committed.
- [ ] This file, `shipping.md` and `docs/releasing.md` are updated with what was and was not verified.
