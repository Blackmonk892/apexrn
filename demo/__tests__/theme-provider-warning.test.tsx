import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';

type Fresh = {
  render: typeof import('@testing-library/react-native/pure').render;
  cleanup: typeof import('@testing-library/react-native/pure').cleanup;
  ui: typeof import('@apexrn/ui');
};

// The warn-once flag lives at module scope, so every test needs its own copy of
// the library, and of react and RNTL so that they all share one renderer. The
// pure entry is used because the default one registers jest hooks on import.
function loadFresh(): Fresh {
  let fresh!: Fresh;
  jest.isolateModules(() => {
    const rntl = require('@testing-library/react-native/pure');
    fresh = { render: rntl.render, cleanup: rntl.cleanup, ui: require('@apexrn/ui') };
  });
  return fresh;
}

const devFlag = globalThis as unknown as { __DEV__: boolean };

const MESSAGE = '[apexrn] useTheme() was called outside <ApexRNProvider>. Falling back to the light theme; wrap your app root in <ApexRNProvider>.';

describe('useTheme outside ApexRNProvider', () => {
  let warn: jest.SpyInstance;
  let cleanup: Fresh['cleanup'] | undefined;
  const originalDev = devFlag.__DEV__;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    await cleanup?.();
    cleanup = undefined;
    warn.mockRestore();
    devFlag.__DEV__ = originalDev;
  });

  it('warns once when used without ApexRNProvider in __DEV__', async () => {
    const fresh = loadFresh();
    cleanup = fresh.cleanup;
    const { render, ui } = fresh;
    await render(
      <>
        <ui.Button>A</ui.Button>
        <ui.Button>B</ui.Button>
      </>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(MESSAGE);
  });

  it('does not warn inside a provider', async () => {
    const fresh = loadFresh();
    cleanup = fresh.cleanup;
    const { render, ui } = fresh;
    await render(
      <ui.ApexRNProvider defaultMode="light">
        <ui.Button>A</ui.Button>
      </ui.ApexRNProvider>,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn when __DEV__ is false', async () => {
    devFlag.__DEV__ = false;
    const fresh = loadFresh();
    cleanup = fresh.cleanup;
    const { render, ui } = fresh;
    await render(<ui.Button>A</ui.Button>);
    expect(warn).not.toHaveBeenCalled();
  });

  it('still returns the light fallback', async () => {
    const fresh = loadFresh();
    cleanup = fresh.cleanup;
    const { render, ui } = fresh;
    const Probe = () => <Text>{ui.useTheme().colorScheme}</Text>;
    const screen = await render(<Probe />);
    expect(screen.getByText('light')).toBeTruthy();
  });
});

describe('useReducedMotion mock', () => {
  const Probe = () => <Text>{useReducedMotion() ? 'reduced' : 'full'}</Text>;

  it('can be overridden per test', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const screen = await render(<Probe />);
    expect(screen.getByText('reduced')).toBeTruthy();
  });

  it('defaults to false again on the next test', async () => {
    const screen = await render(<Probe />);
    expect(screen.getByText('full')).toBeTruthy();
  });
});
