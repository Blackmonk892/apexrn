# Bugs — prompt9 production audit (2026-10-01)

Audit scope: `website_prompts/prompt9.md` final production audit of the ApexRN website.

## Fixed

1. **Missing custom 404 page.** Any bad route fell through to Next's default unstyled 404, breaking the brutalist dark theme. Added `src/app/not-found.tsx` (themed, minimal self-contained header — doesn't reuse `Navbar`, since `Navbar`'s nav links are homepage-only hash anchors that would be broken off-route).

2. **Broken `#phone` anchor.** `id="phone"` lived only on `DesktopHero`, which is `hidden` below the `lg` breakpoint. The Navbar/Footer "Preview" link (`href="#phone"`) silently failed to scroll on narrower viewports. Fixed by moving the id onto a stable `display:contents` wrapper around both `MobileHero`/`DesktopHero` in `HeroSection.tsx`.

3. **Wrong import in Playground code samples.** `playground-codegen.ts` generated `import { X } from '@apexrn/ui'` in every "Code" tab snippet, contradicting the real copy-paste CLI model (`@/components/apexrn`) used consistently everywhere else, including `docs/components.md` and `CodeSection.tsx`. Fixed to `@/components/apexrn`.

4. **Missing `sitemap.xml` / `robots.txt`.** Neither existed. Added `src/app/sitemap.ts` and `src/app/robots.ts`, driven by `NEXT_PUBLIC_SITE_URL` (no domain is configured anywhere in the repo, so it falls back to a placeholder and warns at build time rather than guessing a real one — **set this env var before deploying**).

5. **Stale `.eslintignore`.** Unsupported/ignored by ESLint 9 flat config, redundant with `eslint.config.mjs`'s `globalIgnores` (same paths). Deleted. Also removed an unused `UI_BARREL` constant in `generate-docs.mjs`.

## Open / not fixed

1. **Local `next build` EBUSY on the final `out/` swap.** `next build` compiles, typechecks, and generates all 56 static pages with zero errors every time, but the final `rmdir`/swap into `out/` consistently fails locally with `EBUSY: resource busy or locked`. Reproduced 3× across two shells (bash and PowerShell), and independently by a separate audit pass. Only `MsMpEng` (Windows Defender) and `explorer` were running alongside — consistent with a Windows real-time-AV file-lock on a freshly-written directory, not a code defect. Likely won't reproduce on a Linux CI/deploy runner, but **run one real build on the actual deploy machine before trusting the static export end-to-end** — this was never confirmed to complete successfully on this machine.

2. **No physical-device verification.** Everything was checked via headless Chromium (desktop + mobile viewport emulation) — real Android/iOS device testing (haptics, native modal behavior, some gestures) was not done. This matches the "Known limits" disclaimer already shown on every component preview, so it's a known, accepted gap rather than a new one.

## Verified clean (no action needed)

- Every component preview (docs + playground) is a real `<iframe>` into the compiled `demo/` Lab build — no fake HTML/CSS lookalikes anywhere.
- `website/package.json` has zero react-native/Expo/Reanimated dependencies; no direct `@apexrn/ui`/`react-native` imports anywhere in `website/src`.
- Deep links reproduce exact preview state (theme in URL query + iframe hash; playground control values mirrored into the query string and replayed via `postMessage` on load).
- `generate-docs.mjs` derives all docs content directly from `packages/ui` source via TS AST parsing and self-validates against the registry and Lab routes; re-ran it — zero drift from committed `docs-data.json`.
- Installation/CLI commands, package name, and prop/variant tables all verified against real source (`packages/cli`, `packages/ui/components/*.tsx`).
- Unique `<title>`/meta description per route; static server-rendered prose, props tables, and code blocks (not iframe-only content); `llms.txt` mirrors match their HTML counterparts (same generated source).
- Mobile nav drawer, search dialog (⌘K), Escape-to-close, Tab focus trap, and theme toggle all tested interactively in a real headless browser — all work correctly.
- `eslint` and `tsc --noEmit` both clean.
