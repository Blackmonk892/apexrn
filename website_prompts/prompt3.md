Now perform a dedicated design refinement pass on the ApexRN website.

DO NOT rebuild the website from scratch.

Preserve the existing design direction.

Your job is to make the existing implementation feel significantly more polished.

Reminder: the phone's screen contents are an embedded `demo/` Lab iframe; the phone chrome and scroll animation are plain Next.js/CSS. Keep that boundary intact while polishing — don't reach into the iframe's DOM, only its `postMessage` protocol.

==================================================
DESIGN REVIEW
=============

Review every section as if you are a senior product designer and frontend engineer.

Look for:

- weak hierarchy
- repetitive cards
- excessive borders
- unnecessary decoration
- poor spacing
- generic layouts
- awkward transitions
- inconsistent typography
- weak mobile behavior
- animation discontinuities
- sections that feel disconnected
- iframe loading states that feel broken or janky (blank flash before `apexrn:ready` fires)

Fix them.

==================================================
MOTION
======

The phone sequence is the hero animation.

Make it feel exceptional.

Improve:

- entrance
- scale curve
- translation
- subtle rotation
- screen reveal (coordinate the iframe's own `apexrn:ready` postMessage so the screen doesn't pop in abruptly)
- relationship between text and phone
- callouts
- transition into the next section

Motion should communicate product structure, not simply movement.

Add subtle motion elsewhere:

- section reveals
- component interactions (inside the iframe, driven by real component press-physics — not re-implemented in the site)
- code transitions
- hover states
- CTA interactions

Avoid animation overload.

==================================================
VISUAL DETAILS
==============

Add high-quality details only where they improve the experience:

- technical labels
- subtle grid structures
- section numbering
- cursor/micro-interaction details
- precise borders
- controlled shadows
- carefully chosen accent moments

Do not add random decoration.

==================================================
IMPORTANT
=========

The website should look BETTER than the supplied prototype.

The prototype is inspiration.

Do not reproduce its exact sections, text, spacing, or layout.

Improve it.

==================================================
VALIDATE
========

Run the complete project checks after refinement.

Do not sacrifice:

- accessibility
- performance
- responsive behavior
- maintainability
- the static-export build (`next build` must still succeed with no server-only APIs)

for visual effects.
