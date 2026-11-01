# Changelog

All notable changes to ApexRN. Format follows [Keep a Changelog](https://keepachangelog.com); versions follow semver. Registry items are versioned together with the CLI.

## [0.1.0] - 2026-11-01

Unreleased: the tag and npm publish are the owner's final step. Link: https://github.com/Blackmonk892/apexrn/compare/v0.1.0...HEAD

### Added
- `apexrn` CLI (`init`, `add`, `diff`, `list`). It copies component source into an Expo app, resolves dependencies between items, rewrites imports to your directories, writes a barrel (`index.ts`) and installs missing peers with `expo install`. Flags: `add --all`, `--overwrite`, `--dry-run`, `--no-install`, `--registry <url|path>`.
- Static registry builder (`registry/build.mjs`) with dependencies derived from real imports; 49 items:
  - 39 components: Accordion, Alert, Alert Dialog, App Bar, Avatar, Badge, Bottom Nav, Brutal Surface, Button, Card, Carousel, Checkbox, Chip, Date Picker, Dialog, Drawer, Dropdown Menu, Empty State, FAB (`floating-action-button`), Input, Input OTP, Label, List Item, Marquee, Number Input, Progress, Radio Group, Search Bar, Segmented Control, Select, Separator, Sheet, Skeleton, Slider, Switch, Tabs, Text, Textarea, Toast, and the Toaster (with `useToast()`).
  - Shared code: `theme`, `colors`, `metrics`, `utils`, `icons`, `variants`, `motion`, `loading-blocks`, `use-press-physics`.
- Two theme presets, `neo` and `raw`, each with light and dark palettes: `<ApexRNProvider preset="raw">`. Colour roles live in `colors.ts`; every text, border, ring and shadow pair is checked by `registry/check-contrast.mjs` (`npm run tokens:check`, in CI).
- New components: Number Input, Segmented Control, Empty State, and the Text type-scale primitive.
- A 2px-stroke icon set on a 24 grid, including status icons. Status variants (`destructive`, `success`, `warning`) show an icon and a text label in addition to colour.
- A specimen board and one reference screen per component in `demo/`, Jest + Testing Library smoke tests, and Maestro flows run on an Android emulator in CI.
- `scripts/fresh-app-check.mjs`: scaffolds a blank Expo app, runs `init` and `add --all` against the local registry, then typechecks and bundles it. Runs in CI on Linux and macOS.
- CI on Linux and macOS: demo typecheck, tests and web export, registry and CLI tests, website build.

### Changed
Breaking renames and removals made while reworking the components. There was no earlier release, so no migration path is maintained.
- `Input`: `error` is now `invalid`, with an optional `errorMessage` row.
- `DropdownMenuItem`: `onPress` is now `onSelect`.
- `DatePicker`: `onChange` is now `onValueChange`; in single mode it closes on tap.
- `Card`: `CardText` is removed; use `CardTitle`, `CardDescription` and `CardContent`.
- `Sheet`: the deprecated `PointHeight` prop is removed; use `sheetHeight`.
- `Badge`, `Progress`: the `withShadow` prop is removed (flat by design).
- `BottomNav`: labels show on every tab by default; `labelMode="selected"` shows only the active tab's label.
- `Button`: `children` is the label (`title` still works), sentence-case text, loading blocks instead of a spinner.
- Disabled controls use the dashed-border rule instead of a grey fill.
- Text on `primary` is black in both themes and several tokens were retuned to meet 4.5:1. Edit `colors.ts` to change them; `tokens:check` flags regressions.
- Source files are kebab-case (`brutal-surface`, `radio-group`, `use-press-physics`); every component is also a named export.

### Fixed
- The demo no longer crashes on launch on Android (unguarded `window` access).
- Copied sources typecheck in a fresh Expo SDK 57 or 58 app (refs and events are typed from the component types).
- Registry output is identical on Windows and Linux; `apexrn diff` no longer reports CRLF checkouts as changed.
- `useTheme()` warns once in development when no `ApexRNProvider` is mounted.

### Known gaps
- Android is verified on an emulator by automation. iOS and device feel (haptics, gestures, screen readers) are verified by hand with `docs/ship-plan/DEVICE-CHECKLIST.md`; anything left unchecked there is not verified.
- `InputOTP` accepts digits only; an alphanumeric `pattern` is planned for 0.2.
- `DatePicker` has no range mode yet.
- `ListItem` has no built-in switch or checkbox trailing control and there is no grouped-list wrapper; compose them yourself for now.
- `FAB` does not pass its ink colour to a render-prop icon (`AppBarAction` does).
- The demo has no neo/raw preset switch, so reference screens are shown in neo only.
- The default registry URL is the GitHub Pages address, `https://blackmonk892.github.io/apexrn`; pass `--registry` to use your own host.
