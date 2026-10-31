import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { Switch, presets } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const hidden = { includeHiddenElements: true };

// Inner track 56 - 2*2 border = 52, minus 2*2 padding and the 20pt thumb.
const TRAVEL = 28;

const thumbX = () => {
  const style = StyleSheet.flatten(screen.getByTestId('sw-thumb', hidden).props.style);
  const move = (style.transform as { translateX: number }[]).find((t) => 'translateX' in t);
  return move?.translateX;
};

describe('Switch', () => {
  it('renders on and off in all four palettes', async () => {
    for (const checked of [false, true]) {
      const results = await renderInPalettes(<Switch checked={checked} accessibilityLabel="Wi-Fi" />);
      expect(results).toHaveLength(4);
      for (const { view } of results) {
        const node = view.getByRole('switch', { name: 'Wi-Fi' });
        expect(node.props.accessibilityState).toMatchObject({ checked });
      }
    }
  }, 30000);

  it('toggles an uncontrolled switch and reports the new value', async () => {
    const onCheckedChange = jest.fn();
    await renderWithTheme(<Switch accessibilityLabel="Wi-Fi" onCheckedChange={onCheckedChange} />);
    await fireEvent.press(screen.getByRole('switch', { name: 'Wi-Fi' }));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toBeChecked();
    await fireEvent.press(screen.getByRole('switch', { name: 'Wi-Fi' }));
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it('honours defaultChecked', async () => {
    await renderWithTheme(<Switch defaultChecked accessibilityLabel="Wi-Fi" />);
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toBeChecked();
  });

  it('stays put when a controlled parent ignores the change', async () => {
    const onCheckedChange = jest.fn();
    await renderWithTheme(
      <Switch checked={false} onCheckedChange={onCheckedChange} accessibilityLabel="Wi-Fi" testID="sw" />,
    );
    await fireEvent.press(screen.getByRole('switch', { name: 'Wi-Fi' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).not.toBeChecked();
    expect(thumbX()).toBe(0);
  });

  it('does not fire when disabled, and reports the state', async () => {
    const onCheckedChange = jest.fn();
    await renderWithTheme(<Switch disabled accessibilityLabel="Wi-Fi" onCheckedChange={onCheckedChange} />);
    await fireEvent.press(screen.getByRole('switch', { name: 'Wi-Fi' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toBeDisabled();
  });

  it('passes disabled to the surface: flat, no shadow', async () => {
    await renderWithTheme(<Switch disabled accessibilityLabel="Wi-Fi" />);
    expect(screen.queryByTestId('brutal-surface-shadow', hidden)).toBeNull();
    const track = StyleSheet.flatten(screen.getByRole('switch', { name: 'Wi-Fi' }).props.style);
    expect(track.borderStyle).toBe('dashed');
  });

  describe('thumb', () => {
    it('sits at 0 when off and travels when on', async () => {
      const view = await renderWithTheme(<Switch checked={false} accessibilityLabel="Wi-Fi" testID="sw" />);
      expect(thumbX()).toBe(0);
      await view.rerender(<Switch checked accessibilityLabel="Wi-Fi" testID="sw" />);
      expect(thumbX()).toBe(TRAVEL);
    });

    it('lands on the target instantly under reduced motion', async () => {
      (useReducedMotion as jest.Mock).mockReturnValue(true);
      try {
        await renderWithTheme(<Switch checked accessibilityLabel="Wi-Fi" testID="sw" />);
        expect(thumbX()).toBe(TRAVEL);
      } finally {
        (useReducedMotion as jest.Mock).mockReturnValue(false);
      }
    });
  });

  it('inverts the track when on', async () => {
    await renderWithTheme(<Switch checked accessibilityLabel="Wi-Fi" />, { preset: 'raw' });
    const track = StyleSheet.flatten(screen.getByRole('switch', { name: 'Wi-Fi' }).props.style);
    expect(track.backgroundColor).toBe(presets.raw.light.foreground);
  });

  describe('label', () => {
    it('renders a pressable row announced once, with a 44pt target', async () => {
      const onCheckedChange = jest.fn();
      await renderWithTheme(<Switch label="Airplane mode" onCheckedChange={onCheckedChange} testID="sw" />);
      const row = screen.getByRole('switch', { name: 'Airplane mode' });
      expect(screen.queryByText('Airplane mode')).toBeNull();
      expect(screen.getAllByRole('switch')).toHaveLength(1);
      expect(StyleSheet.flatten(row.props.style).minHeight).toBeGreaterThanOrEqual(44);
      await fireEvent.press(row);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole('switch', { name: 'Airplane mode' })).toBeChecked();
    });

    it('does not fire when disabled', async () => {
      const onCheckedChange = jest.fn();
      await renderWithTheme(<Switch label="Airplane mode" disabled onCheckedChange={onCheckedChange} />);
      await fireEvent.press(screen.getByRole('switch', { name: 'Airplane mode' }));
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });
});
