Perform a dedicated developer-experience pass.

The goal is to make ApexRN feel like a mature developer platform.

Implement and polish:

- documentation search (static client-side index, see `prompt4.md`)
- keyboard navigation
- command-style navigation where appropriate
- copy-to-clipboard
- code highlighting
- active sidebar state
- breadcrumbs
- previous/next navigation
- mobile navigation
- external GitHub links
- installation copy actions
- URL deep linking — component pages and the playground should deep-link to a specific variant/theme/state (mirrors the Lab's own `#<screen>:<theme>` hash convention; keep the query/hash shape consistent between the Next.js route and the iframe's internal hash so a link is shareable and reproducible)
- browser back/forward behavior

Keyboard shortcuts should be intuitive.

Do not add shortcuts merely for novelty.

Make sure every interactive element has:

- visible focus
- keyboard accessibility
- appropriate semantics
- useful feedback

Add loading states only where needed — the iframe embed genuinely needs one (show a skeleton/placeholder until `apexrn:ready` fires, with a timeout fallback per `prompt6.md`'s error handling).

Avoid artificial loading animations elsewhere.
