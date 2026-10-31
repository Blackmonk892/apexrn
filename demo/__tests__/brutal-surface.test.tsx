import { Text, StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import { usePressPhysics } from '@apexrn/ui';
import { fireEvent, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { BrutalSurface, presets } from '@apexrn/ui';
import { renderWithTheme } from './utils/render';

// The ring is hidden from assistive tech on purpose, so queries must opt in.
const HIDDEN = { includeHiddenElements: true };

beforeEach(() => {
  jest.mocked(Haptics.impactAsync).mockClear();
});

describe('BrutalSurface', () => {
  it('draws the card shadow at the neo depth', async () => {
    await renderWithTheme(<BrutalSurface><Text>x</Text></BrutalSurface>);
    expect(screen.getByTestId('brutal-surface-shadow')).toHaveStyle({ top: 4, left: 4 });
  });

  it('draws the shadow at depth 2 in the raw preset', async () => {
    await renderWithTheme(<BrutalSurface><Text>x</Text></BrutalSurface>, { preset: 'raw' });
    expect(screen.getByTestId('brutal-surface-shadow')).toHaveStyle({ top: 2, left: 2 });
  });

  it('renders no shadow node when flat', async () => {
    await renderWithTheme(<BrutalSurface elevation="flat"><Text>x</Text></BrutalSurface>);
    expect(screen.queryByTestId('brutal-surface-shadow')).toBeNull();
  });

  it('keeps a consumer testID on the surface', async () => {
    await renderWithTheme(<BrutalSurface testID="mine"><Text>x</Text></BrutalSurface>);
    expect(screen.getByTestId('mine')).toBeTruthy();
  });

  it('fires a haptic once per press', async () => {
    await renderWithTheme(<BrutalSurface testID="s"><Text>x</Text></BrutalSurface>);
    await fireEvent(screen.getByTestId('s'), 'pressIn');
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('swallows presses and haptics when disabled', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <BrutalSurface disabled testID="s" onPress={onPress}><Text>x</Text></BrutalSurface>,
    );
    const surface = screen.getByTestId('s');
    await fireEvent(surface, 'pressIn');
    await fireEvent.press(surface);
    expect(onPress).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('drops the shadow and dashes the border when disabled', async () => {
    await renderWithTheme(<BrutalSurface disabled testID="s"><Text>x</Text></BrutalSurface>);
    expect(screen.queryByTestId('brutal-surface-shadow')).toBeNull();
    expect(screen.getByTestId('s')).toHaveStyle({ borderStyle: 'dashed', opacity: 0.6 });
  });

  it('colours the border destructive when invalid', async () => {
    await renderWithTheme(<BrutalSurface invalid testID="s"><Text>x</Text></BrutalSurface>);
    expect(screen.getByTestId('s')).toHaveStyle({ borderColor: presets.neo.light.destructive });
  });

  it('forces the ring with focused', async () => {
    await renderWithTheme(<BrutalSurface focused><Text>x</Text></BrutalSurface>);
    expect(screen.getByTestId('brutal-surface-ring', HIDDEN)).toHaveStyle({
      borderWidth: 2,
      borderColor: presets.neo.light.ring,
    });
  });

  it('shows the ring on focus and hides it on blur', async () => {
    await renderWithTheme(<BrutalSurface testID="s"><Text>x</Text></BrutalSurface>);
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
    await fireEvent(screen.getByTestId('s'), 'focus');
    expect(screen.getByTestId('brutal-surface-ring', HIDDEN)).toBeTruthy();
    await fireEvent(screen.getByTestId('s'), 'blur');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
  });

  it('reserves the same layout margin enabled and disabled', async () => {
    const margins = async (disabled: boolean) => {
      await renderWithTheme(
        <BrutalSurface disabled={disabled} testID={`s-${disabled}`}><Text>x</Text></BrutalSurface>,
      );
      const root = screen.getByTestId(`s-${disabled}`).parent;
      const flat = StyleSheet.flatten(root?.props.style) as { marginRight: number; marginBottom: number };
      return [flat.marginRight, flat.marginBottom];
    };
    expect(await margins(true)).toEqual(await margins(false));
    expect(await margins(true)).toEqual([4, 4]);
  });

  it('shows no ring on a disabled surface', async () => {
    await renderWithTheme(<BrutalSurface disabled focused><Text>x</Text></BrutalSurface>);
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
  });
});

describe('usePressPhysics', () => {
  type Api = ReturnType<typeof usePressPhysics>;
  let api: Api;
  const Probe = ({ disabled = false }: { disabled?: boolean }) => {
    api = usePressPhysics({ depth: 4, disabled });
    return null;
  };

  it('sinks by the depth on press-in and returns on press-out', async () => {
    await renderWithTheme(<Probe />);
    api.handlePressIn();
    expect(api.pressed.value).toBe(1);
    api.handlePressOut();
    expect(api.pressed.value).toBe(0);
  });

  it('sets the value instantly under reduced motion', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const spring = jest.spyOn(Reanimated, 'withSpring');
    await renderWithTheme(<Probe />);
    api.handlePressIn();
    expect(api.pressed.value).toBe(1);
    expect(spring).not.toHaveBeenCalled();
    spring.mockRestore();
  });

  it('resets when disabled flips mid-press', async () => {
    const { rerender } = await renderWithTheme(<Probe />);
    api.handlePressIn();
    expect(api.pressed.value).toBe(1);
    await rerender(<Probe disabled />);
    expect(api.pressed.value).toBe(0);
    api.handlePressIn();
    expect(api.pressed.value).toBe(0);
  });
});
