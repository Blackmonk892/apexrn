# apexrn

CLI for ApexRN, a brutalist component library for React Native. Like shadcn/ui, it copies component source into your Expo app so you own and edit the code. There is no runtime package to depend on.

## Requirements

- An Expo project (the CLI refuses to `init` without an `expo` dependency unless you pass `--force`). Components are tested against Expo SDK 57 and 58.
- Node 18 or newer.
- Peer packages (react-native-reanimated, react-native-worklets, react-native-gesture-handler, react-native-svg, expo-haptics, and others a component imports). `add` installs the missing ones with `npx expo install`, so versions match your SDK. Pass `--no-install` to get the command printed instead.

## Usage

```bash
npx apexrn init
npx apexrn add button card dialog
```

`init` writes `apexrn.json` and copies the theme and tokens (`theme`, `colors`, `metrics`, `utils`). It then prints how to wrap your app in `ApexRNProvider` and `GestureHandlerRootView`.

### Commands

| Command | What it does |
|---|---|
| `apexrn init` | Creates `apexrn.json`, copies the theme and tokens. `--force` re-initialises or skips the Expo check. |
| `apexrn add <parts...>` | Copies the named components plus the other components and `lib` files they need. Existing files are kept. |
| `apexrn add --all` | Adds every component. |
| `apexrn add <parts...> --overwrite` | Replaces the components you named with the upstream version. Dependencies are never overwritten. |
| `apexrn add ... --dry-run` | Shows what would be written, writes nothing. |
| `apexrn diff <parts...>` | Shows how your copy differs from upstream. |
| `apexrn list` | Lists everything in the registry and marks what is installed. Works before `init`. |

### Flags

- `--registry <url|path>`: registry to read from, an http(s) URL or a local directory. Default is `https://blackmonk892.github.io/apexrn`. `init` stores it in `apexrn.json`.
- `--components-dir <dir>`, `--lib-dir <dir>` (`init`): where components and shared files go.
- `--cwd <dir>`: project root, default the current directory.
- `--no-install`, `--dry-run` (`add`), `--help`, `--version`.

### What gets written

- Components go to your components directory and shared code to your lib directory; imports are rewritten to match.
- `<componentsDir>/index.ts` is a generated barrel (`import { Button, Card } from './components/apexrn'`). Delete its first line to take ownership of it.
- Restyle everything by editing `colors.ts` in your lib directory.

## License

MIT
