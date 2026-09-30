Now connect the documentation system to the actual ApexRN component library.

First inspect the entire component source (`packages/ui/components/*.tsx`, `registry/meta.json`, `registry/public/index.json` once built, `docs/components.md`).

Build an authoritative inventory containing:

- component name
- source location
- exported name
- props
- required props
- optional props
- variants
- sizes
- states
- defaults
- events/callbacks
- composition patterns
- dependencies (`registryDependencies`, peer deps)
- accessibility-related behavior
- examples already present in the repository
- which `demo/src/screens/` specimen(s) exist for it and what hash route(s) they expose in Lab embed mode

Do not invent missing information. If a component has no existing specimen in `demo/`, flag it — the docs page for it cannot have a live preview until one exists (do not fake one).

==================================================
COMPONENT REGISTRY
==================

The registry already exists at `registry/` (`registry/build.mjs` → `registry/public/index.json` + per-item JSON). Do not build a second, competing metadata system.

`website/` consumes that generated output (copied into `website/public/` at build time — see `website.md` §4 pipeline) to power:

- sidebar
- component routes (`generateStaticParams`)
- titles
- descriptions
- dependency lists / install commands
- search index
- related components

If the registry is missing metadata the site needs (e.g. a longer description, a doc category), that's a registry schema change (`registry/meta.json` + `registry/build.mjs`), reviewed like any other library change — not a website-side workaround.

==================================================
EXAMPLES
========

For every component:

Find or create a canonical example based on the REAL API, sourced from `docs/components.md`.

The example must actually render — as an embedded Lab preview, not a claim.

Do not create fictional props.

==================================================
API DOCUMENTATION
=================

Derive props tables from TypeScript types in `packages/ui/components/*.tsx` using `ts-morph` or `react-docgen-typescript`, run with `demo/`'s TypeScript configuration (so `react-native` types resolve — see `CLAUDE.md` hard rule 3 on why `demo/tsconfig.json`'s `"*"` mapping exists). This generation script lives in `website/scripts/` (or similar) and runs at build time; its output is never hand-edited.

If automatic extraction is impractical for a given prop shape, fall back to a clearly-marked, easy-to-maintain metadata file — not silent hand-duplication.

==================================================
IMPORTANT
=========

Never change a component's API merely to make documentation easier.

The component library remains the source of truth.

The website adapts to the library.

==================================================
VALIDATION
==========

Verify every component route.

A component should not appear in navigation unless it actually exists/exported in `packages/ui` AND has a registry entry.

Every documented prop must exist in the real TypeScript source.

Every example must compile/render through the embedded Lab.

The build must fail (not warn) if a registry entry has no corresponding page, or a page references a component with no registry entry.
