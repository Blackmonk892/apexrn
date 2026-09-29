# Changelog

All notable changes to ApexRN. Format follows [Keep a Changelog](https://keepachangelog.com); versions follow semver. Registry items are versioned together with the CLI.

## [Unreleased] - 0.1.0

### Added
- `apexrn` CLI (`init`, `add`, `diff`, `list`) that copies component source into an Expo app, resolves dependencies between items, rewrites imports to the project's directories and installs peers with `expo install`.
- Static registry builder (`registry/build.mjs`); dependencies are derived from real imports.
- 36 components: Accordion, Alert, Alert Dialog, App Bar, Avatar, Badge, Bottom Nav, Button, Card, Carousel, Checkbox, Chip, Date Picker, Dialog, Drawer, Dropdown Menu, FAB, Input, Input OTP, Label, List Item, Marquee, Progress, Radio Group, Search Bar, Select, Separator, Sheet, Skeleton, Slider, Switch, Tabs, Textarea, Toast, Brutal Surface.
- Theme (`ApexRNProvider`, `useTheme`) and design tokens (`colors.ts`).

### Added (developer experience)
- `<Button>Save</Button>`: `children` is accepted as the label; `title` still works.
- `Toaster` + `useToast()`: `toast('Saved')`, `toast.success()`, `toast.error()`, `toast.warning()`; toasts queue one at a time. `Toast` gains `success` and `warning` variants.
- `Badge` gains `destructive`, `success` and `warning` variants.
- Every component now has a named export (the default export remains). The CLI generates `components/apexrn/index.ts` so `import { Button, Card } from '@/components/apexrn'` works; a barrel you edit is left alone.
- `docs/components.md`: a copy-paste example per component, typechecked against the real components.
- `registry/check-contrast.mjs` (`npm run tokens:check`, also in CI): fails if any text/background token pair drops below 4.5:1.

### Changed (breaking, pre-release)
- `DatePicker` `onChange` is now `onValueChange`, matching every other value control.
- `Sheet` no longer accepts the deprecated `PointHeight` prop; use `sheetHeight`.
- Text on `primary` is now black in both themes (was white: 3.2:1 light, 2.8:1 dark). Dark `destructiveForeground` is black (3.5:1 before), dark `secondary` is `#4D5FF5` (4.2:1 before) and light `mutedForeground` is `#6B6B6B` (4.2:1 on `muted` before). All now meet 4.5:1. To restore the old look, edit `colors.ts`; `tokens:check` will flag it.

### Fixed
- Registry output is now identical on Windows and Linux (line endings normalised); `apexrn diff` no longer reports every line as changed for CRLF checkouts.
- `Card`: text inside `primary`/`accent` cards ignored the variant foreground (React Native `Text` does not inherit colour). New `CardText` part reads it from context; it throws outside a `Card`.

### Changed
- All source files renamed to kebab-case (`brutal_surface` -> `brutal-surface`, `radiogroup` -> `radio-group`, `usePressPhysics` -> `use-press-physics`, and so on). The capitalised `Input.tsx` is now `input.tsx`, which fixes case-sensitive filesystems.

### Known gaps
- Not yet verified on iOS or with screen readers; see `shipping.md` phase 1.
- No component unit tests yet (CLI and registry are tested).
