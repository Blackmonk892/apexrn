You are working on the official website for ApexRN.

IMPORTANT CONTEXT:

ApexRN is an existing React Native UI/component library.

The library is ALREADY BUILT.

You are NOT building the component library.

You are building the WEBSITE for ApexRN:

- marketing landing page
- component showcase
- documentation
- installation guides
- interactive examples (embedded, see below)
- API/reference pages
- navigation/search
- developer experience

The uploaded HTML landing-page prototype is a DESIGN REFERENCE ONLY.

Do not copy it literally.

Use it to understand the intended visual direction, especially:

- brutalist visual language
- technical grid
- oversized typography
- hard borders/shadows
- phone entering the page
- phone scaling during scroll
- mobile app shown inside phone
- code/editor section
- component showcase
- technical metadata
- strong black/white/accent palette

The phone/product-reveal concept is the main visual inspiration.

Improve everything else.

==================================================
ARCHITECTURE — ALREADY DECIDED, DO NOT RE-DERIVE
==================================================

The framework and rendering strategy are already decided. Read `instructions.md` in this folder and `website.md` at the repo root in full before doing anything else.

Summary (authoritative version is in those two files):

- Next.js, App Router, `output: 'export'` — fully static, no server.
- New workspace `website/`, own `package.json`/lockfile, in the same monorepo as `packages/ui`, `packages/cli`, `demo/`.
- Live component previews are NOT rendered directly inside Next.js. They are the existing `demo/` Expo Lab, exported for web and embedded via `<iframe>` in a chrome-less "embed mode", controlled with `postMessage`.
- `website/` has zero react-native/react-native-web/Reanimated dependencies.
- Search is a static client-side index. Hosting is a static host (GitHub Pages / Cloudflare Pages), $0.
- Generated content (registry, props tables, code snippets, an `llms.txt` mirror per component for AEO) comes from the real repo source at build time — never hand-authored duplicates.

Your job in THIS pass is not to choose an architecture. It is to:

1. Audit the CURRENT state of the repository against that decided architecture and report drift or blockers.
2. Confirm feasibility of the pieces the plan depends on.
3. Update `website.md`'s phase checklist and any stale details (framework name, file paths) to match current repo state — do not create a separate `WEBSITE_ARCHITECTURE.md`; `website.md` is the single architecture document.

==================================================
AUDIT THE REPOSITORY
==================================================

Inspect, and record findings for:

- package manager and workspace structure at the repo root: confirm there is **no** npm workspaces setup today — `demo/` and `packages/cli` are each independently installed (own `package.json` + own `package-lock.json`, no root lockfile). `website/` must follow that same isolated-install pattern, NOT a root `"workspaces"` array — adding one would change install behavior for the whole repo and risk touching `demo`'s dependency tree, which is explicitly against `CLAUDE.md` hard rule 1.
- `packages/ui`: exported components, props, variants, themes, tokens — the real inventory, from source, not from `apexrn-docs.md` (which is known to overclaim in places, see `apexrn-modify.md` §2.7)
- `demo/`: does an "embed mode" (`?embed=1`, `postMessage` handshake, hash routing to a specimen) already exist, or is it still to be built (`website.md` §6, Phase 1)? What specimens exist per component under `demo/src/screens/`?
- `registry/`: does `registry/public/index.json` and per-component JSON already build cleanly (`node registry/build.mjs`)? Is it something `website/` can copy at build time?
- `docs/components.md`: does it have a snippet for every shipped component? Are any missing?
- TypeScript setup: can component prop types be extracted with `ts-morph` / `react-docgen-typescript` run against `demo/`'s tsconfig (needed so `react-native` types resolve), for props-table generation?
- Existing tests, CI workflows (`.github/workflows/*`), and whether any assume the old Astro plan (replace references) or the old "no-RN-deps guard" (`website.md` §5.7 — this guard is now unnecessary since `website/` never gets RN deps in the first place; check nothing enforces the opposite).

==================================================
SCAFFOLD THE WEBSITE FOLDER (do this in this pass)
==================================================

After the audit, create a working `website/` folder so subsequent prompts have somewhere to build, without touching anything that currently works.

1. `mkdir website`. Do NOT add a `"workspaces"` field to the root `package.json` (see above) — `website/` is a fully independent, isolated package, exactly like `demo/` and `packages/cli` already are.
2. `cd website && npx create-next-app@latest . --typescript --app --eslint --no-tailwind --src-dir --import-alias "@/*"` (or hand-write an equivalent minimal `package.json` + `tsconfig.json` + `next.config.js` + `src/app/` if you prefer full control — either way, the result must be a self-contained Next.js App Router project with its own `package-lock.json`).
3. In `website/next.config.js`, set `output: 'export'` immediately, even before any pages exist, so the static-export constraint is enforced from commit one (no accidental server/API-route usage creeping in later).
4. `website/package.json` must NOT list react-native, react-native-web, react-native-reanimated, react-native-gesture-handler, react-native-svg, react-native-worklets, or expo-haptics as dependencies — that's the whole point of the hybrid-iframe architecture. Confirm this stays true after `create-next-app` runs (it won't add them, but double-check nothing else does).
5. Add `website/node_modules`, `website/.next`, and `website/out` (or whatever the export output dir is) to the root `.gitignore` if not already covered by existing patterns.
6. `cd website && npm install` — this must only touch `website/node_modules`/`website/package-lock.json`. It must NOT run in `packages/ui`, and must NOT be an `npm install` invoked from the repo root.
7. Add one placeholder page (`website/src/app/page.tsx`) so `npm run build` (static export) succeeds end to end as a smoke test.

==================================================
VERIFY NOTHING ELSE BROKE
==================================================

Before finishing, confirm the new folder is genuinely additive and isolated:

- `cd demo && npm run doctor` and `npm run typecheck` still pass (unchanged, since `website/` has its own dependency tree entirely).
- `node registry/build.mjs` and `node registry/check-contrast.mjs` from the repo root still run the same as before.
- `packages/cli`'s tests (`npm test --prefix packages/cli`) still pass.
- `git status` shows only new files under `website/` (plus `.gitignore` edits) — nothing existing was modified except that.

==================================================
OUTPUT
==================================================

Produce a concise report:

1. repository findings (what exists today vs. what the plan assumes)
2. confirmation the `website/` folder now exists, builds (`next build` with static export), and is isolated per the checks above
3. gaps that block Phase 1 (Lab embed mode) or later phases of `website.md`
4. any place `website.md` itself is now stale and needs a small edit (make the edit)
5. implementation order for the next several sessions, matching `website.md`'s phases

Do not modify the component library during this stage unless absolutely necessary for the embed-mode integration, and even then keep it to `demo/` only (never `packages/ui` for the site's sake — see `website.md` §5.6).
