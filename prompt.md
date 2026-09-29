You are the lead design-system engineer and UI/UX architect for this React Native component library.

Your job is to systematically refactor the entire component library, ONE COMPONENT AT A TIME, using the locally installed design skills in this repository.

This is a MOBILE-FIRST REACT NATIVE COMPONENT LIBRARY whose defining visual language is TRUE BRUTALIST / NEO-BRUTALIST MOBILE UI.

Do not treat this as a generic React Native UI cleanup.
Do not optimize for generic "modern SaaS" aesthetics.
Do not produce generic rounded-card AI UI.
Do not make every component look soft, minimal, gradient-heavy, glassmorphic, or overly polished in the conventional sense.

The goal is to create a cohesive, high-quality, production-grade brutalist component system that feels intentional, tactile, bold, recognizable, consistent, accessible, and excellent on real mobile devices.

==================================================

1. # FIRST: UNDERSTAND THE REPOSITORY

Before modifying anything:

- Inspect the complete repository structure.
- Locate all component source files.
- Locate the existing design tokens/theme system.
- Locate shared primitives and utilities.
- Locate the demo application/folder.
- Locate tests, Storybook/demo infrastructure, documentation, examples, and build configuration.
- Identify the React Native version and styling approach actually used by this repository.
- Identify existing component dependencies and platform-specific logic.
- Read the existing local Claude skills under .claude/skills/.
- Use the locally installed `frontend-design` skill and `ui-ux-pro-max` skill whenever relevant.
- Do not invent a replacement architecture before understanding the current one.

Create an internal inventory of all components and determine a sensible implementation order based on dependency relationships.

Prefer this general order:

1. foundational primitives / tokens
2. typography
3. buttons and controls
4. inputs / forms
5. feedback components
6. surfaces / containers
7. navigation
8. overlays
9. data/display components
10. complex/composite components

However, adapt the order to the actual repository.

Do not refactor everything at once.

================================================== 2. THE CORE DESIGN DIRECTION
============================

The entire library must follow a coherent brutalist mobile design system.

The design language should strongly emphasize:

- bold visual hierarchy
- high contrast
- strong rectangular geometry
- mostly sharp or deliberately restrained corner radii
- substantial borders
- visible outlines
- solid fills
- block-based composition
- strong typography
- tactile interaction
- clear component boundaries
- deliberately visible structure
- compact but intentional spacing
- purposeful asymmetry where appropriate
- expressive but controlled visual weight
- hard-edged or offset shadows/elevation where appropriate
- strong pressed/active states
- unmistakable interactive affordances
- visual honesty rather than decorative effects

Avoid defaulting to:

- excessive rounded corners
- floating pill-shaped UI
- glassmorphism
- frosted surfaces
- unnecessary gradients
- soft neumorphism
- excessive blur
- weak low-contrast borders
- generic dashboard-card aesthetics
- excessive empty space
- decorative effects with no functional purpose
- random stylistic variation between components

Brutalism must be expressed through the ENTIRE SYSTEM, not by simply adding black borders and bright colors.

The visual language must exist consistently across:

- geometry
- spacing
- typography
- borders
- shadows
- color
- state transitions
- component hierarchy
- interaction feedback
- composition
- icon treatment
- disabled states
- error states
- loading states
- focus states
- accessibility states

The result should feel like ONE DESIGN SYSTEM.

================================================== 3. MOBILE-FIRST REQUIREMENTS
============================

Everything must be designed for actual mobile applications.

Optimize for:

- touch interaction
- thumb reach
- small screens
- portrait layouts
- different screen widths
- dynamic text
- accessibility
- keyboard interaction where applicable
- safe areas
- platform differences
- Android and iOS behavior
- reduced motion where appropriate
- performance

Do not blindly copy web brutalism into React Native.

Translate the brutalist design language into excellent native-mobile interaction patterns.

Components must remain practical and usable.

Visual boldness must never compromise usability.

================================================== 4. DESIGN TOKENS ARE THE SOURCE OF TRUTH
========================================

Before introducing arbitrary styling, inspect and reuse existing tokens.

Where the system is weak or inconsistent, improve the shared token layer rather than introducing one-off values.

Create or improve consistent tokens for:

- colors
- semantic colors
- typography
- font sizes
- font weights
- line heights
- spacing
- border widths
- radii
- shadows/elevation
- component heights
- touch targets
- opacity
- motion/animation
- breakpoints or responsive behavior where appropriate

Prefer semantic tokens over raw values.

Do not scatter arbitrary numbers throughout components when a reusable token should exist.

Do not create component-specific visual values unless there is a real design reason.

================================================== 5. COMPONENT API RULES
======================

For every component:

- inspect its current API
- identify redundant or confusing props
- preserve backwards compatibility where practical
- do not break public APIs unnecessarily
- improve naming consistency
- prefer composability over giant prop surfaces
- avoid boolean-prop explosions
- avoid duplicating styling logic
- keep TypeScript types strong
- preserve platform compatibility
- keep behavior predictable

Do not redesign an API simply because you personally prefer a different API.

Only change the API when the improvement is justified by consistency, usability, correctness, accessibility, or maintainability.

================================================== 6. REFACTOR LOOP — EXACTLY ONE COMPONENT AT A TIME
==================================================

You must work in a strict loop.

For EACH component:

STEP A — AUDIT

Inspect:

- source code
- props/types
- variants
- states
- styles
- tokens used
- platform behavior
- accessibility
- tests
- existing demo
- existing documentation

Identify:

- visual inconsistencies
- duplicated logic
- API problems
- missing states
- missing variants
- accessibility issues
- responsive/mobile issues
- performance problems
- opportunities for reuse

STEP B — DESIGN

Before implementation, determine the component's brutalist design treatment.

Define:

- visual hierarchy
- geometry
- spacing
- typography
- border treatment
- surface treatment
- shadow/elevation treatment
- color usage
- interaction behavior
- state behavior
- variant differences

Ensure the design is consistent with the SYSTEM, not merely attractive in isolation.

Use the local design skills for this step.

STEP C — IMPLEMENT

Refactor ONLY the current component.

Do not simultaneously refactor unrelated components.

Do not create one-off design patterns when an existing shared primitive/token can be reused.

Use clean, production-quality React Native + TypeScript.

STEP D — VERIFY

After implementing the component:

- run its relevant tests
- run type checking
- run linting where available
- check imports
- check platform-specific issues
- check accessibility
- check touch-target sizing
- check all states
- check all variants
- check dark/light themes if supported
- check responsive behavior

Fix every issue you discover BEFORE moving to the next component.

STEP E — CREATE / UPDATE THE DEMO

Immediately after the component is successfully refactored, create or update its dedicated demo screen inside the repository's demo folder.

The demo MUST be specifically for the CURRENT COMPONENT.

Do not create a giant generic demo page containing unrelated components.

Use a clear naming convention such as:

demo/
ButtonDemo.tsx
InputDemo.tsx
CardDemo.tsx
...

Adapt to the repository's existing demo architecture instead of blindly creating a new one.

The demo must demonstrate EVERY VARIANT AND STATE THAT ACTUALLY EXISTS IN THE COMPONENT CODE.

Do NOT invent undocumented variants.

If the component exposes:

- variants
- sizes
- tones
- appearances
- icons
- loading
- disabled
- selected
- error
- success
- warning
- validation
- destructive
- fullWidth
- orientation
- alignment
- etc.

then the demo must visibly demonstrate the supported combinations that matter.

The demo should make visual comparison easy.

Show:

- component name
- variant sections
- state sections
- examples with realistic content
- interactive examples where applicable
- important edge cases
- disabled/loading/error states where supported

The demo itself must use the SAME design system.

Do not make the demo prettier by introducing styles unavailable to the component library.

STEP F — VALIDATE THE DEMO

Run the demo/build/typecheck/test pipeline relevant to the project.

Verify:

- no runtime errors
- no TypeScript errors
- no broken imports
- no layout overflow
- no clipped content
- no overlapping controls
- no warnings caused by the refactor
- all component variants render
- all important states render
- touch interaction works
- accessibility behavior remains intact

Only after this succeeds should you proceed.

STEP G — COMMIT-READY STATE

At the end of each component iteration:

- ensure the component is clean
- ensure its demo is complete
- ensure no unrelated files were changed unnecessarily
- summarize what changed internally
- immediately continue to the next component

DO NOT STOP after one component unless there is a genuine blocking repository failure.

================================================== 7. DEMO QUALITY BAR
===================

Every component demo should feel like a polished design-system showcase.

Use the demo to prove that the component works visually and behaviorally.

The demo should make differences between variants obvious.

For example, if a Button supports:

- primary
- secondary
- destructive
- ghost
- outline

show them as an intentional visual matrix.

If it supports:

- small
- medium
- large

show the sizes together.

If it supports:

- default
- pressed
- disabled
- loading

show those explicitly.

For mobile, make the demos scrollable and easy to inspect on narrow screens.

Never allow the demo to become a random collection of disconnected examples.

================================================== 8. BRUTALIST DESIGN SYSTEM RULES
================================

Apply these principles consistently:

GEOMETRY

- Favor strong block geometry.
- Use rounded corners sparingly and intentionally.
- Prefer recognizable shapes and clear boundaries.

BORDERS

- Borders should be visually meaningful.
- Use them as structural elements, not decoration.
- Border thickness should follow the token system.

SHADOWS

- Prefer deliberate, crisp, tactile shadows/elevation.
- Avoid soft floating-card shadows unless there is a functional reason.

COLOR

- Use a restrained but expressive palette.
- Establish semantic color roles.
- High contrast is encouraged.
- Bright accent colors can be used intentionally.
- Do not randomly color every component.

TYPOGRAPHY

- Typography must carry significant visual weight.
- Strong hierarchy.
- Clear labels.
- Strong button/input text.
- Avoid tiny, low-contrast text.

SPACING

- Establish a consistent spacing rhythm.
- Tight spacing is acceptable where appropriate for brutalist density.
- Do not make everything cramped.

MOTION

- Motion should reinforce physicality and interaction.
- Pressed states should feel tactile.
- Avoid excessive animations.
- Respect reduced-motion accessibility settings.

INTERACTION

- Tap feedback should be obvious.
- Selected states should be unmistakable.
- Disabled states should remain understandable.
- Error states must be visually clear without relying on color alone.

================================================== 9. ACCESSIBILITY IS NON-NEGOTIABLE
==================================

Brutalism must never become an excuse for poor accessibility.

For every interactive component:

- ensure sufficient color contrast
- provide accessible labels where needed
- support screen readers
- support keyboard interaction where relevant
- provide clear focus/pressed states
- maintain appropriate touch target sizes
- do not communicate important meaning using color alone
- preserve readable text
- respect user font scaling where practical
- respect reduced motion where relevant

Accessibility issues must be fixed during the component iteration, not postponed.

================================================== 10. CONSISTENCY RULE
====================

Never optimize one component in isolation.

Every refactor must be checked against:

- the token system
- neighboring components
- shared primitives
- typography
- spacing
- state conventions
- interaction conventions
- border conventions
- shadow conventions
- accessibility conventions

If one component reveals that the shared design system is inconsistent, improve the SHARED SYSTEM rather than adding a component-specific hack.

================================================== 11. DO NOT CHEAT
================

Do NOT:

- rewrite the entire repository at once
- change unrelated components during an iteration
- invent variants that don't exist
- remove functionality just to simplify styling
- silently break public APIs
- leave TODOs instead of fixing issues
- ignore warnings
- declare success without testing
- create fake placeholder demos
- use screenshots/mockups instead of the real component
- use generic web CSS patterns inappropriate for React Native
- introduce random design decisions that conflict with the system
- stop after the first component

================================================== 12. CONTINUOUS EXECUTION
========================

Once the initial audit is complete, execute this process automatically:

AUDIT COMPONENT
↓
DESIGN
↓
REFACTOR
↓
TEST
↓
CREATE/UPDATE COMPONENT DEMO
↓
TEST DEMO
↓
FIX ISSUES
↓
VERIFY BRUTALIST CONSISTENCY
↓
NEXT COMPONENT
↓
REPEAT

Continue until all eligible components have been processed.

Maintain a running internal checklist of:

- component completed
- refactor completed
- demo completed
- tests passed
- typecheck passed
- visual/state coverage completed

At the end, provide a final summary containing:

- components refactored
- components skipped and why
- new/changed design tokens
- shared primitives introduced or improved
- accessibility improvements
- demo screens created/updated
- tests/typecheck/build results
- remaining issues, if any

================================================== 13. MOST IMPORTANT PRINCIPLE
============================

The final library must NOT feel like a collection of individually designed components.

It must feel like a SINGLE, COHERENT, PREMIUM BRUTALIST MOBILE DESIGN SYSTEM.

Every component should look like it belongs to the same family.

The result should be:

- unmistakably brutalist
- mobile-native
- highly usable
- accessible
- visually bold
- tactile
- consistent
- composable
- production-grade
- technically clean
- easy to extend

Use the locally installed design skills as design expertise, but use the repository's actual architecture, tokens, components, APIs, and constraints as the source of truth.

Start by auditing the repository and building the component inventory.

Then begin the first component iteration and continue the loop automatically.
