
# ApexRN

> **A brutalist React Native UI library built for developers who want bold interfaces—not boring ones.**

ApexRN is an open-source component library for React Native inspired by the aesthetics of web brutalism. Thick borders, hard shadows, sharp corners, loud colors, and expressive interactions—all designed without sacrificing developer experience.

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

<img width="720" height="1600" alt="Screenshot_2026-06-30-07-36-06-440_host exp exponent" src="https://github.com/user-attachments/assets/bb7c92c4-ed5c-4616-b7d8-2de099726d45" />


* Buttons
* Cards
* Inputs
* Textareas
* Badges
* Chips
* Checkboxes
* Switches
* Radio Groups
* Alerts
* Dialogs
* Bottom Sheets
* Toasts
* Avatars
* Progress Indicators
* Loading States
* Skeletons
* Typography
* Layout utilities
* Theme Provider
* Design Tokens

> More components are added regularly.

---

## Installation

```bash
npm install apexrn
```

or

```bash
pnpm add apexrn
```

or

```bash
bun add apexrn
```

---

## Basic Usage

```tsx
import { Button } from "apexrn";

export default function App() {
  return (
    <Button onPress={() => console.log("Pressed")}>
      Hello ApexRN
    </Button>
  );
}
```

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
* Border Radius
* Shadows
* Typography
* Spacing
* Animation
* Component Variants

Example:

```tsx
<ThemeProvider
  theme={{
    colors: {
      primary: "#FFDD00",
      background: "#FFFFFF",
      foreground: "#000000",
    },
  }}
>
  <App />
</ThemeProvider>
```

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

## Roadmap

* Component Registry
* CLI
* Theme Generator
* Icon Package
* Documentation Site
* Animation Presets
* Dark Mode
* Figma Kit
* More Components
* Accessibility Improvements

---

## Contributing

Contributions are always welcome.

You can help by:

* Reporting bugs
* Improving documentation
* Suggesting components
* Fixing issues
* Building new features

Please open an issue before making large architectural changes.

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
