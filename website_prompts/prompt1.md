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

- package manager and workspace structure at the repo root (does a root `package.json` with workspaces exist yet? what needs adding for `website/` to join it cleanly?)
- `packages/ui`: exported components, props, variants, themes, tokens — the real inventory, from source, not from `apexrn-docs.md` (which is known to overclaim in places, see `apexrn-modify.md` §2.7)
- `demo/`: does an "embed mode" (`?embed=1`, `postMessage` handshake, hash routing to a specimen) already exist, or is it still to be built (`website.md` §6, Phase 1)? What specimens exist per component under `demo/src/screens/`?
- `registry/`: does `registry/public/index.json` and per-component JSON already build cleanly (`node registry/build.mjs`)? Is it something `website/` can copy at build time?
- `docs/components.md`: does it have a snippet for every shipped component? Are any missing?
- TypeScript setup: can component prop types be extracted with `ts-morph` / `react-docgen-typescript` run against `demo/`'s tsconfig (needed so `react-native` types resolve), for props-table generation?
- Existing tests, CI workflows (`.github/workflows/*`), and whether any assume the old Astro plan (replace references) or the old "no-RN-deps guard" (`website.md` §5.7 — this guard is now unnecessary since `website/` never gets RN deps in the first place; check nothing enforces the opposite).

==================================================
OUTPUT
==================================================

Produce a concise report:

1. repository findings (what exists today vs. what the plan assumes)
2. gaps that block Phase 1 (Lab embed mode) or Phase 2 (site scaffold) of `website.md`
3. any place `website.md` itself is now stale and needs a small edit (make the edit)
4. implementation order for the next several sessions, matching `website.md`'s phases

Do not modify the component library during this stage unless absolutely necessary for the embed-mode integration, and even then keep it to `demo/` only (never `packages/ui` for the site's sake — see `website.md` §5.6).
