# Contributing to ApexRN

Read `CLAUDE.md` (conventions and hard rules) and `apexrn-modify.md` (spec and Definition of Done) first. The short version:

## Setup

```bash
cd demo
npm install          # the ONLY place dependencies are installed
npm run doctor       # must stay green
npx expo start       # the Component Lab
```

Never run `npm install` inside `packages/ui`: it is source only. A second install creates duplicate react/reanimated trees and breaks the app.

## Adding or changing a component

One component at a time, in this order:

1. **Spec**: props, states, accessibility contract.
2. **Design pass**: what is the one memorable brutalist detail; check it against the token system.
3. **Write** `packages/ui/components/<kebab-name>.tsx`. Colors only from `useTheme().colors`; blocky things through `BrutalSurface`; merge styles with `cn`. Import shared code as `../lib/...` and other components as `./name` (the CLI rewrites the former).
4. **Register**: export it from `packages/ui/components/index.ts` and add a one-line description to `registry/meta.json`. Give the component a **named export** (keep `export default` for single-component files); the CLI barrel does `export *`, and the build fails if two components export the same name.
   Colours: any new foreground/background token pair must pass `node registry/check-contrast.mjs` (4.5:1).
5. **Specimen** in the Component Lab (`demo/`), importing from `@apexrn/ui`.
6. **Verify** on web, then on a real device (Android and iOS): gestures, overlays, keyboard, back button, dark mode, large text, reduced motion.
7. Commit: `feat(ui): <component> - rewrite + lab specimen`.

Each component file must stay self-contained: a developer should be able to copy it (plus its listed dependencies) and edit it.

## Checks before opening a PR

```bash
cd demo && npm run doctor && npm run typecheck && npx expo export --platform web
node registry/check-contrast.mjs && node registry/build.mjs && (cd packages/cli && npm test)
```

`registry/build.mjs` fails if a relative import points at nothing or a component has no description, so a broken dependency cannot ship.

Release process and current readiness: [docs/releasing.md](docs/releasing.md).

## The CLI and registry

- `registry/build.mjs` generates `registry/public/` from `packages/ui`. Never edit the output.
- `packages/cli` has no dependencies by design. Keep it that way.
- Test the flow against a scratch Expo project: `node packages/cli/bin/apexrn.mjs init --registry registry/public --cwd <project>`.
