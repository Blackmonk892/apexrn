import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { FAB, Text, presets } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const hidden = { includeHiddenElements: true };
const icon = <Text>+</Text>;

describe('FAB', () => {
  it('renders icon and extended forms in all four palettes', async () => {
    for (const label of [undefined, 'Compose note']) {
      const results = await renderInPalettes(<FAB accessibilityLabel="Compose" icon={icon} label={label} />);
      expect(results).toHaveLength(4);
      for (const { view } of results) {
        expect(view.getByRole('button', { name: 'Compose' })).toBeTruthy();
      }
    }
  });

  it('fires onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<FAB accessibilityLabel="Compose" icon={icon} onPress={onPress} testID="fab" />);
    fireEvent.press(screen.getByTestId('fab'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled, and reports the state', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<FAB accessibilityLabel="Compose" icon={icon} disabled onPress={onPress} testID="fab" />);
    fireEvent.press(screen.getByTestId('fab'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Compose' })).toBeDisabled();
  });

  it('uses the primary pair', async () => {
    await renderWithTheme(<FAB accessibilityLabel="Compose" label="Compose note" testID="fab" />, { preset: 'raw' });
    const { primary, primaryForeground } = presets.raw.light;
    const surface = screen.getByTestId('fab', hidden);
    expect(StyleSheet.flatten(surface.props.style).backgroundColor).toBe(primary);
    expect(StyleSheet.flatten(screen.getByText('Compose note', hidden).props.style).color).toBe(primaryForeground);
  });

  describe('extended label', () => {
    it('keeps the label in sentence case', async () => {
      await renderWithTheme(<FAB accessibilityLabel="Compose" label="Compose note" />);
      const style = StyleSheet.flatten(screen.getByText('Compose note', hidden).props.style);
      expect(style.textTransform).toBeUndefined();
    });

    it('is announced once, by the button label', async () => {
      await renderWithTheme(<FAB accessibilityLabel="Compose a note" label="Compose" icon={icon} />);
      expect(screen.getByRole('button', { name: 'Compose a note' })).toBeTruthy();
      expect(screen.queryByText('Compose')).toBeNull();
      expect(screen.queryByText('+')).toBeNull();
    });
  });

  describe('visible', () => {
    it('hides from assistive tech and pointer events when false', async () => {
      await renderWithTheme(<FAB accessibilityLabel="Compose" icon={icon} visible={false} testID="fab" />);
      expect(screen.queryByRole('button', { name: 'Compose' })).toBeNull();
      const root = screen.getByTestId('fab-root', hidden);
      expect(root.props.pointerEvents).toBe('none');
      expect(root.props.importantForAccessibility).toBe('no-hide-descendants');
      expect(root.props.accessibilityElementsHidden).toBe(true);
    });

    it('is reachable and touchable when true', async () => {
      await renderWithTheme(<FAB accessibilityLabel="Compose" icon={icon} testID="fab" />);
      const root = screen.getByTestId('fab-root');
      expect(root.props.pointerEvents).toBe('box-none');
      expect(screen.getByRole('button', { name: 'Compose' })).toBeTruthy();
    });

    it('comes back when toggled on', async () => {
      const view = await renderWithTheme(<FAB accessibilityLabel="Compose" icon={icon} visible={false} />);
      expect(screen.queryByRole('button', { name: 'Compose' })).toBeNull();
      await view.rerender(<FAB accessibilityLabel="Compose" icon={icon} visible />);
      expect(screen.getByRole('button', { name: 'Compose' })).toBeTruthy();
    });
  });

  describe('placement', () => {
    const rootStyle = () => StyleSheet.flatten(screen.getByTestId('fab-root', hidden).props.style);

    it('defaults to bottom-right', async () => {
      await renderWithTheme(<FAB accessibilityLabel="Compose" icon={icon} testID="fab" />);
      expect(rootStyle()).toMatchObject({ position: 'absolute', right: expect.any(Number), bottom: expect.any(Number) });
      expect(rootStyle().left).toBeUndefined();
    });

    it('supports bottom-left', async () => {
      await renderWithTheme(<FAB accessibilityLabel="Compose" icon={icon} placement="bottom-left" testID="fab" />);
      expect(rootStyle().left).toEqual(expect.any(Number));
      expect(rootStyle().right).toBeUndefined();
    });

    it('centres for bottom-center', async () => {
      await renderWithTheme(<FAB accessibilityLabel="Compose" icon={icon} placement="bottom-center" testID="fab" />);
      expect(rootStyle()).toMatchObject({ left: 0, right: 0, alignItems: 'center' });
    });

    it('adds safe-area insets to the edge offset', async () => {
      await renderWithTheme(<FAB accessibilityLabel="Compose" icon={icon} testID="fab" />);
      const { bottom, right } = rootStyle();
      await renderWithTheme(
        <FAB accessibilityLabel="Compose" icon={icon} insets={{ bottom: 34, right: 10 }} testID="fab2" />,
      );
      const inset = StyleSheet.flatten(screen.getByTestId('fab2-root', hidden).props.style);
      expect(inset.bottom).toBe(bottom + 34);
      expect(inset.right).toBe(right + 10);
    });
  });
});
