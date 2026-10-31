import { Text } from 'react-native';
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
});
