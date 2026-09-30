Now build the ApexRN marketing landing page.

The uploaded HTML prototype is the visual reference.

DO NOT COPY IT.

Take inspiration from it and improve it substantially.

The goal is a world-class developer-tool landing page with the visual quality of:

- shadcn/ui
- Vercel
- Linear
- Raycast
- modern experimental web design

But ApexRN must have its own identity.

This page is built in `website/` (Next.js, static export). See `instructions.md` for the architecture — in particular, this page has NO react-native-web/Reanimated dependency; the phone's screen contents come from an embedded `demo/` Lab iframe, not a directly mounted component tree.

==================================================
CORE CREATIVE DIRECTION
=======================

APEXRN should feel like:

REFINED BRUTALISM
×
REACT NATIVE
×
MOBILE PRODUCT DESIGN
×
DEVELOPER TOOLING

Avoid generic SaaS design.

Avoid:

- generic gradient blobs
- excessive glassmorphism
- meaningless floating shapes
- stock illustrations
- generic feature-card grids
- excessive rounded cards
- template-like layouts

Use:

- strong typography
- editorial composition
- hard borders
- intentional geometry
- technical metadata
- grids
- asymmetric layouts
- monochrome surfaces
- controlled accent color
- tactile interactions
- sophisticated motion

==================================================
HERO
====

Create a powerful hero.

The headline should clearly communicate:

ApexRN is a React Native UI library with a strong visual identity.

The hero should NOT feel like a documentation page.

Include:

- brand
- concise positioning
- primary CTA
- secondary CTA
- GitHub/open-source signal
- technical metadata

Use typography as the primary visual element.

The hero text and layout are ordinary static HTML — this is what carries SEO/AEO weight for the landing page, so keep it real prose in the DOM, not text baked into an image or the iframe.

==================================================
THE PHONE — SIGNATURE EXPERIENCE
================================

The phone interaction from the reference is the most important idea to preserve.

However, improve it.

**Phone screen contents = the `demo/` Lab's web export, embedded as an `<iframe src=".../lab/?embed=1#<screen>:<theme>">`.** The phone frame (bezel, notch, shadow) and the scroll-linked scale/translate animation are plain Next.js/CSS/whatever animation library you choose for the container — never React Native code, since `website/` has none.

Initial state:

- phone exists within the composition
- smaller scale
- slightly recessed visually
- hero typography dominates

As the user scrolls:

- phone moves upward
- phone scales dramatically
- surrounding hero content transitions away
- phone becomes the visual focus
- phone screen (iframe) becomes increasingly visible
- phone settles into a powerful showcase position

Use high-quality scroll-linked animation on the phone *container* (GSAP/ScrollTrigger or an equally reliable web-native approach). This is pure DOM/CSS transform work — it does not touch React Native.

The animation must:

- remain smooth
- handle resize
- handle mobile
- handle reduced motion (also forward the reduced-motion preference into the iframe via `postMessage({ type: 'apexrn:reducedMotion', value })` so the embedded Lab's own press-physics respects it too)
- avoid layout jumps
- avoid excessive CPU usage

Lazy-load the iframe (only mount it once the phone section is near viewport) — it is the heaviest asset on the page.

==================================================
REAL APEXRN COMPONENTS INSIDE THE PHONE
=======================================

CRITICAL:

The application inside the phone is the embedded Lab (real, compiled `@apexrn/ui`, running through the proven Expo-web pipeline). Do not attempt to recreate the UI using HTML/CSS, and do not attempt to mount `@apexrn/ui` directly inside `website/`.

Coordinate with (or build, if not yet done) a `demo/` screen/hash-route that composes a coherent fictional application from real components, for example:

- Card
- Button
- Input
- Tabs
- Switch
- Badge
- List
- Dialog
- Progress
- navigation primitives

Only reference components that actually exist in `packages/ui`. Confirm the exact export names against source before wiring the hash route.

==================================================
PHONE → COMPONENT STORY
=======================

After the phone becomes large, transition into a conceptual explanation:

REAL APP
↓
BUILT FROM
↓
REAL COMPONENTS

Use subtle callouts or visual relationships.

Do not clutter the screen.

The phone should feel like the source from which the component system is revealed.

==================================================
CODE SECTION
============

Create a premium code-to-interface section.

Show real ApexRN usage from the repository (pull from `docs/components.md`, do not hand-write).

Example structure:

CODE

import { ... } from "@apexrn/ui";

<ActualComponent ... />

↓

LIVE RESULT

The "live result" is a second, smaller embedded Lab iframe (or the same shared one, hash-routed) showing that exact specimen — never a static screenshot, never a fake HTML mock.

Provide:

- syntax highlighting
- copy button
- file/tab selector
- line numbers where appropriate
- subtle reveal animation
- responsive behavior

Do not fabricate APIs.

==================================================
COMPONENT SHOWCASE
==================

Create a highly visual component showcase.

Do not create a generic grid of cards.

Use editorial composition.

Feature actual ApexRN components via embedded Lab previews (lazy-loaded — do not mount a dozen iframes eagerly).

The user should immediately understand:

"These are real components I can install."

==================================================
PHILOSOPHY / VALUE
==================

Create a strong typographic section explaining WHY ApexRN exists.

Avoid generic marketing claims.

Use actual verified characteristics of the library.

Do not claim:

- performance guarantees
- accessibility guarantees
- zero runtime overhead
- zero dependencies
- native performance
- etc.

unless the repository actually supports those claims. Also do not claim device behavior (haptics, native gestures) from a web-embedded preview.

==================================================
INSTALLATION
============

Create a visually excellent installation section.

Use the REAL package name and REAL installation commands from the repository (`packages/cli`, root `README.md`).

Do not invent:

npm package names
CLI commands
configuration steps

Provide copy buttons.

==================================================
FINAL CTA
=========

End with a strong visual CTA.

Something memorable.

Minimal copy.

Clear actions:

- Get Started
- Components
- GitHub

==================================================
QUALITY BAR
===========

This must feel like a website someone would bookmark.

Not "good enough."

It should feel:

- intentional
- premium
- technically credible
- visually distinctive
- fast
- responsive
- polished

Every section should have a reason to exist.

Avoid adding sections simply to make the page longer.

==================================================
VALIDATION
==========

After implementation:

- run typecheck
- run lint
- run tests
- run `next build` (static export) and confirm it succeeds with no server-only APIs used
- verify all routes
- verify mobile
- verify desktop
- verify reduced motion (including that it reaches the iframe)
- verify no horizontal overflow
- verify the embedded Lab previews render correctly and lazily
- verify animations do not break scrolling
- verify the page reads correctly with JavaScript/iframes disabled (a static fallback poster image for the phone, real text elsewhere) — this matters for SEO/AEO crawling

Fix all issues before finishing.
