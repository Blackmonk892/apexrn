Now perform a complete responsive and accessibility audit of the ApexRN website.

Test at minimum:

1440px+
1280px
1024px
768px
480px
390px
360px

==================================================
LANDING PAGE
============

Pay particular attention to the phone animation.

On mobile:

- don't force the desktop scroll-linked animation if it causes jank; simplify the curve
- reduce motion complexity where necessary
- maintain the visual story
- ensure the phone (and its embedded iframe) remains useful and visible, not so small the preview is illegible
- avoid overflow
- avoid text collisions
- confirm the iframe lazy-loads sensibly on mobile connections (don't eagerly load multiple heavy Lab iframes above the fold)

==================================================
DOCS
====

Verify:

- sidebar behavior
- mobile navigation
- code blocks
- tables
- previews (iframe loads, sizes correctly, shows its loading/error states)
- search
- buttons
- keyboard navigation

==================================================
ACCESSIBILITY
=============

Check:

- semantic HTML
- heading hierarchy
- keyboard navigation
- focus states
- contrast
- reduced motion — confirm the site's own CSS/JS animations respect `prefers-reduced-motion`, AND that the preference is forwarded into every embedded Lab iframe via `postMessage({ type: 'apexrn:reducedMotion', value })` so the real component's press-physics also respects it
- screen reader labels
- buttons vs links
- form labels
- interactive previews — the iframe needs an accessible `title`, and its content is a separate document for screen readers to enter/exit; make sure that's not a dead end (e.g. no way back out via keyboard)

Do not remove the brutalist aesthetic to achieve accessibility.

Find solutions that preserve the visual identity.

==================================================
PERFORMANCE
===========

Check:

- unnecessary JavaScript
- animation performance
- image loading
- font loading
- layout shifts (the iframe mounting late is a common CLS source — reserve its space with a fixed-aspect-ratio container)
- oversized bundles
- unnecessary dependencies (confirm `website/package.json` still has zero react-native/react-native-web/Reanimated packages — this was a hard architectural decision, not an oversight)

Fix real issues.

Do not optimize imaginary problems.
