# APEXRN WEBSITE — PERSISTENT INSTRUCTIONS

You are working on the official ApexRN website.

ApexRN is an existing React Native UI library.

THE LIBRARY ALREADY EXISTS.

You are building and maintaining the WEBSITE, in the SAME monorepo as the library, so a component change and its docs/preview update ship in one PR.

==================================================
ARCHITECTURE — ALREADY DECIDED
===============================

Do not re-litigate these decisions. They were made deliberately after comparing alternatives. Full detail lives in `website.md` at the repo root — read it before doing any website work.

1. **Framework: Next.js, App Router, `output: 'export'` (fully static).** No server, no API routes, no ISR, no server actions. Everything is generated at build time from repo source. This is what makes free static hosting (GitHub Pages / Cloudflare Pages) possible with no usage-based billing risk.

2. **Location: `website/` as its own workspace**, sibling to `demo/`, `packages/ui`, `packages/cli`. Own `package.json` and lockfile. It reads `packages/ui` source, `registry/`, and `docs/components.md` directly at build time — same repo, one PR.

3. **Rendering strategy: hybrid iframe, NOT direct react-native-web import into Next.js.**
   - `website/` (Next.js) has **NO** react-native / react-native-web / Reanimated / gesture-handler / svg / worklets dependencies. It is plain web: marketing copy, docs text, code blocks, props tables, search, navigation.
   - Live, interactive component previews are the **existing `demo/` Lab, exported for web** (`npx expo export --platform web`) and embedded via `<iframe>`, in an "embed mode" (`?embed=1`, chrome-less, hash-routed to a specimen, e.g. `#button:dark`).
   - Why: `demo/` already proves ApexRN works through Expo/Metro + React Native Web, including Reanimated/worklets. Re-implementing that pipeline under Next.js/webpack is unproven and risky (Reanimated's Babel worklets plugin does not have first-class Turbopack support, and Next defaults to SWC). The iframe reuses the already-working pipeline instead of gambling on a second one.
   - Communication with the iframe is `postMessage` only: `{ type: 'apexrn:theme', mode }`, `{ type: 'apexrn:tokens', light?, dark? }`, `{ type: 'apexrn:ready' }` from the iframe once mounted. Always check `event.origin`. Never trust unshaped messages.
   - This is still "the real component" — it is the actual compiled `@apexrn/ui` running through Expo's proven web pipeline, not a lookalike. An iframe embedding the real build is real. Hand-rolled HTML/CSS that merely looks similar is NOT real and is forbidden (see REAL COMPONENTS below).

4. **AEO/SEO:** crawlers and AI agents read static HTML/text, not the iframe's contents. So the text *around* each preview — description, props table, usage code, variants — must be real static HTML generated at build time from the actual library source (TS types, `registry/`, `docs/components.md`), never hand-written duplicate copy that can drift. In addition, generate a plain-Markdown mirror per component (`/components/<name>/llms.txt` or similar) containing name, real props, real usage snippet — this is the emerging convention AI answer engines fetch directly. Generate it from the same source data as the HTML page; never author it separately.

5. **Search:** static, client-side index built at compile time (e.g. Pagefind) over the generated pages. No backend.

6. **Hosting:** static export deployed to GitHub Pages or Cloudflare Pages. $0, no serverless functions, no bandwidth billing surprise.

==================================================
SOURCE OF TRUTH
===============

The ApexRN component library is the source of truth.

Never invent:

- components
- props
- variants
- APIs
- package names
- installation commands
- capabilities
- performance claims

Inspect the actual repository. If `website.md`, the registry, or a prompt in this folder conflicts with what the repository actually contains, the repository wins — flag the conflict, don't silently pick one.

==================================================
REAL COMPONENTS
===============

Whenever the website demonstrates an ApexRN component, it must be **the actual compiled `@apexrn/ui` build, rendered through the `demo/` Lab's web export and embedded via iframe** (see ARCHITECTURE above).

Do not create HTML/CSS mock replacements when the real preview can be embedded.

Do not attempt to mount `@apexrn/ui` directly inside `website/` (Next.js) — that path was evaluated and rejected (unproven Reanimated/webpack combination, heavier bundle, worse SEO). Use the iframe.

The marketing phone on the landing page uses the same embedded Lab preview, styled/scaled by the Next.js page around it — the phone's *screen contents* are the iframe; the phone's *chrome, scroll-linked scale/position animation* are ordinary Next.js/CSS, not React Native.

==================================================
DESIGN
======

The supplied landing-page HTML is inspiration.

Do not copy it.

Preserve the strongest concept:

hero
→ phone enters
→ phone grows
→ real mobile UI is revealed (inside the iframe)
→ component system is explained

Improve everything else.

ApexRN visual identity:

refined brutalism
technical
editorial
high contrast
strong typography
precise geometry
controlled motion

The quality bar is world-class developer tooling.

The marketing website should feel visually exceptional.

The documentation should feel as usable and clear as shadcn/ui while maintaining ApexRN's own identity.

==================================================
DO NOT
======

Do not:

- redesign the component library unnecessarily
- fabricate APIs
- create fake component implementations
- add react-native, react-native-web, reanimated, gesture-handler, svg, or worklets as a dependency of `website/`
- add `"@apexrn/ui": "file:../packages/ui"` (or any file: link) to any `package.json`
- run `npm install` inside `packages/ui`
- add random animations
- add generic SaaS gradients
- overuse glassmorphism
- create meaningless cards
- sacrifice usability for aesthetics
- break existing component APIs
- rewrite working architecture without reason
- add a server, API route, or database to `website/` — it must stay statically exportable
- claim device behavior (haptics, native gestures, native Modal windows) from the web/iframe preview — it is web-rendered, say so

==================================================
ALWAYS
======

Before changing something:

1. inspect existing implementation
2. understand dependencies
3. reuse existing patterns
4. make the smallest sensible architectural change

After changing something:

1. run typecheck
2. run lint
3. run relevant tests
4. inspect the rendered result
5. fix regressions

When creating documentation:

verify every claim against the source.

When creating examples:

verify every import and prop against the source.

When creating visual demos:

embed the real component via the Lab iframe — never fake it.

==================================================
QUALITY BAR
===========

Do not optimize for "technically complete."

Optimize for:

excellent design
excellent UX
excellent developer experience
correctness
maintainability
performance
SEO/AEO discoverability of the static content

The final ApexRN website should feel like a serious open-source project that developers would want to use and share.
