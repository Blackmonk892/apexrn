Now build an interactive ApexRN component playground.

The goal is to let developers experience the real components before installing the library.

==================================================
PLAYGROUND
==========

Create a dedicated playground experience.

A component should have:

LEFT / MAIN:
Live rendered ApexRN component — the embedded `demo/` Lab iframe in embed mode, hash-routed to the component's specimen (same mechanism as the docs component pages, see `prompt4.md` / `instructions.md`). Not a direct mount inside `website/`.

RIGHT:
Controls — ordinary Next.js/React UI (selects, toggles, sliders) built from the real component API where practical (pull the valid prop/variant/size list from the generated registry or props-table data, not a hand-typed list).

Examples:

variant
size
disabled
state
theme
etc.

Only expose valid props.

==================================================
CODE SYNCHRONIZATION
====================

When the developer changes controls:

1. a `postMessage` goes to the iframe, which updates the live specimen (debounce rapid changes — a slider shouldn't flood messages)
2. the code example (plain text/JSX in the Next.js page, not inside the iframe) updates to match, generated from the real prop shape

The relationship should feel immediate, even though it's message-passing rather than a shared render tree — keep the debounce short enough (e.g. ~50-100ms) that it reads as live.

Provide:

COPY CODE

==================================================
REAL COMPONENTS
===============

This must render the real ApexRN component, via the embedded Lab.

No HTML approximations.

No duplicated CSS implementations.

No direct `@apexrn/ui` import inside `website/` — that path was evaluated and rejected (see `instructions.md` ARCHITECTURE section).

==================================================
DESIGN
======

Keep the playground visually clean.

Do not turn it into a huge developer dashboard.

It should feel like a natural extension of the docs.

==================================================
PERFORMANCE
===========

Avoid unnecessary rerenders of the Next.js control panel.

Do not reload the iframe on every control change — only the initial mount should reload it; subsequent changes go through `postMessage`.

Keep interaction responsive; debounce, don't throttle away real-time feel.

==================================================
ERROR HANDLING
==============

If the iframe fails to load, or the `apexrn:ready` handshake never arrives within a reasonable timeout:

- show a useful error state ("Preview failed to load — try refreshing")
- do not crash the docs application
- never silently substitute a fake HTML component in its place

If a control combination the Lab specimen doesn't support is selected, disable it or show why, rather than sending a message the specimen can't handle.
