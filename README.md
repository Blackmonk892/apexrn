
# ApexRN

> **A brutalist React Native UI library built for developers who want bold interfaces—not boring ones.**

ApexRN is an open-source component library for React Native inspired by the aesthetics of web brutalism. Thick borders, hard shadows, sharp corners, loud colors, and expressive interactions—all designed without sacrificing developer experience.

https://www.ilovemd.online/pdf-to-md (imp design)

Whether you're building a startup MVP, hackathon project, or an app that refuses to look generic, ApexRN gives you the tools to stand out.

## Why ApexRN?

Most React Native UI libraries aim for minimalism.

ApexRN embraces personality.

* 🧱 Brutalist design language
* 📱 React Native first
* ⚡ Works with Expo and bare React Native
* 🎨 Themeable design tokens
* ♿ Accessible defaults
* 🔧 TypeScript support
* 📦 Lightweight components
* 🚀 Developer-friendly API

---

## Philosophy

ApexRN follows three simple principles.

### Bold by Default

Interfaces shouldn't all look the same.

Every component is designed with strong visual hierarchy, thick outlines, and confident styling.

### Easy to Customize

The library provides sensible defaults while allowing complete control over colors, spacing, typography, borders, and shadows.

### Production Ready

Beautiful components are useless if they're difficult to maintain.

ApexRN prioritizes:

* predictable APIs
* strong TypeScript support
* composable architecture
* platform compatibility
* performance

---

## Features

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/41d1960b-59a2-4a2a-a863-c2118e2b5fe8" width="220" alt="Home" />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/646a24e0-ec3a-437a-99e0-7aad05931eaf" width="220 alt="Buttons" />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6fef9971-1f6e-4626-939b-753682eb143d" width="220" alt="Cards" />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/07d400ff-84ed-411b-bb4a-3b8794c7dfa0" width="220" alt="Cards" />
    </td>
      <td align="center">
      <img src="https://github.com/user-attachments/assets/571014fd-d31e-412e-ab46-5a25e9cae01a" width="220" alt="Cards" />
    </td>
     <td align="center">
      <img src="https://github.com/user-attachments/assets/099bd77b-be2c-4667-bff1-c34b5910a90f" width="220" alt="Cards" />
    </td>
      <td align="center">
      <img src="https://github.com/user-attachments/assets/e11a34b6-87f3-4e50-a267-0410f3fbca79" width="220" alt="Cards" />
    </td>
    </td>
      <td align="center">
      <img src="https://github.com/user-attachments/assets/59f4bac3-2bec-413a-bb0d-5669c566e320" width="220" alt="Cards" />
    </td>
     <td align="center">
      <img src="https://github.com/user-attachments/assets/d40ed797-0e4a-44d2-88cb-eacc1f7782c4" width="220" alt="Cards" />
    </td>
     <td align="center">
      <img src="https://github.com/user-attachments/assets/6232931b-59be-448c-8b25-fb01a41d5a67" width="220" alt="Cards" />
    </td>
    

  </tr>
</table>


**36 components:** Accordion, Alert, Alert Dialog, App Bar, Avatar, Badge, Bottom Nav, Button, Card, Carousel, Checkbox, Chip, Date Picker, Dialog, Drawer, Dropdown Menu, FAB, Input, Input OTP, Label, List Item, Marquee, Progress, Radio Group, Search Bar, Select, Separator, Sheet, Skeleton, Slider, Switch, Tabs, Textarea, Toast, plus the `BrutalSurface` primitive and a light/dark theme with design tokens.

---

## Installation

ApexRN works like shadcn/ui: a CLI **copies component source into your app**. You own the code and edit it freely. There is no runtime package to depend on.

```bash
# in an Expo project
npx apexrn init            # writes apexrn.json, copies the theme + tokens
npx apexrn add button card dialog
```

- Dependencies between components (and the shared `lib` files) are added automatically.
- Peer packages (reanimated, worklets, gesture-handler, svg, haptics) are installed with `npx expo install` so versions match your Expo SDK.
- `npx apexrn list` shows everything available, `npx apexrn diff button` shows how your copy differs from upstream, and `npx apexrn add button --overwrite` replaces it.
- Files you already have are never overwritten unless you name them with `--overwrite`; shared files (tokens, `brutal-surface`) are never overwritten as a side effect.

Requires Expo (SDK 57 is what the components are tested against) and Node 18+.

---

## Basic Usage

Wrap your app once:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ApexRNProvider } from './src/lib/apexrn/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApexRNProvider defaultMode="system">{/* your app */}</ApexRNProvider>
    </GestureHandlerRootView>
  );
}
```

Then use what you added. The CLI keeps a generated barrel, so one import reaches everything installed:

```tsx
import { Button, Card, CardText } from './src/components/apexrn';

<Button variant="primary" onPress={() => console.log('Pressed')}>Hello ApexRN</Button>
```

Want a notification? Wrap the app in `<Toaster>` and call `toast('Saved')` (or `toast.success(...)`, `toast.error(...)`) from anywhere.

**Full usage for every component, with copy-paste examples: [docs/components.md](docs/components.md).**

AppBar, Drawer and BottomNav take safe-area insets as props (`topInset` / `bottomInset`); pass them from `useSafeAreaInsets()`.

---

## Designed for React Native

Unlike many UI kits adapted from the web, ApexRN is built specifically for React Native.

Supported environments:

* Expo
* Expo Router
* React Native CLI
* Android
* iOS

---

## Theming

ApexRN uses a token-based design system.

Customize:

* Colors
* Shadows
* Typography
* Spacing
* Animation

Everything visual lives in one file you own, `lib/apexrn/colors.ts` (colors for light and dark, spacing, typography, border widths, shadow offsets, motion). Edit the tokens and every component follows. Components read colors only through `useTheme().colors`.

Use `style` to change a component's outer wrapper; some components expose named props for inner parts (for example `inputStyle`, `surfaceStyle`).

---

## Design Language

The library embraces:

* Thick borders
* Hard shadows
* Flat colors
* High contrast
* Large typography
* Playful interactions
* Zero unnecessary gradients
* No glassmorphism

---

## Status

See [docs/releasing.md](docs/releasing.md) for exactly what is verified, what is not, and the steps to a 0.1.0 release.

Components are verified in Expo Go; a full Android + iOS + screen-reader pass is tracked in `shipping.md`. The registry and CLI are built and tested locally but not published yet.

## Roadmap

* Hosted registry and published CLI
* Documentation site
* Raw-brutalist theme preset
* Popover / Tooltip, Segmented control, Stepper, Rating
* Figma kit

---

## Contributing

Contributions are always welcome.

You can help by:

* Reporting bugs
* Improving documentation
* Suggesting components
* Fixing issues
* Building new features

Please open an issue before making large architectural changes. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Tech Stack

* React Native
* TypeScript
* Expo
* React Native Reanimated
* React Native Gesture Handler

---

## Inspiration

ApexRN is inspired by the bold visual language of:

* Brutalist web design
* Neo-brutalism
* Modern startup interfaces
* Indie mobile apps

---

## License

MIT

---

# Built for developers who are tired of every app looking the same.

**Design louder. Ship faster. Build different.**
