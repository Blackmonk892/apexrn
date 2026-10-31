import { StyleSheet } from 'react-native';
import { screen } from '@testing-library/react-native';
import { Badge, presets } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const hidden = { includeHiddenElements: true };
const variants = ['default', 'primary', 'outline', 'accent', 'destructive', 'success', 'warning'] as const;

describe('Badge', () => {
  it('renders every variant in all four palettes', async () => {
    for (const variant of variants) {
      const results = await renderInPalettes(<Badge variant={variant} label="Beta" />);
      expect(results).toHaveLength(4);
      for (const { view } of results) {
        expect(view.getByText('Beta', hidden)).toBeTruthy();
      }
    }
  });

  it('reads as plain text to assistive tech', async () => {
    await renderWithTheme(<Badge label="Beta" testID="badge" />);
    const badge = screen.getByTestId('badge', hidden);
    expect(badge.props.accessible).toBe(true);
    expect(badge.props.accessibilityRole).toBe('text');
  });

  it('children take precedence over label', async () => {
    await renderWithTheme(<Badge label="Beta">New</Badge>);
    expect(screen.getByText('New', hidden)).toBeTruthy();
    expect(screen.queryByText('Beta', hidden)).toBeNull();
  });

  it('uses the ink/fill pair of its variant', async () => {
    await renderWithTheme(<Badge variant="primary" label="Beta" />, { mode: 'light', preset: 'raw' });
    const { primaryForeground } = presets.raw.light;
    expect(StyleSheet.flatten(screen.getByText('Beta', hidden).props.style).color).toBe(primaryForeground);
  });

  describe('count', () => {
    it('renders the number in the mono variant', async () => {
      await renderWithTheme(<Badge count={7} />);
      const text = screen.getByText('7', hidden);
      expect(StyleSheet.flatten(text.props.style).fontVariant).toEqual(['tabular-nums']);
      expect(StyleSheet.flatten(text.props.style).textTransform).toBeUndefined();
    });

    it('caps at 99 by default and reads the real number', async () => {
      await renderWithTheme(<Badge count={120} />);
      expect(screen.getByText('99+', hidden)).toBeTruthy();
      expect(screen.getByLabelText('120', hidden)).toBeTruthy();
    });

    it('honours max', async () => {
      await renderWithTheme(<Badge count={12} max={9} />);
      expect(screen.getByText('9+', hidden)).toBeTruthy();
    });

    it('does not cap a count equal to max', async () => {
      await renderWithTheme(<Badge count={99} />);
      expect(screen.getByText('99', hidden)).toBeTruthy();
    });

    it('lets an explicit accessibilityLabel win', async () => {
      await renderWithTheme(<Badge count={3} accessibilityLabel="3 unread" />);
      expect(screen.getByLabelText('3 unread', hidden)).toBeTruthy();
    });

    it('shows zero', async () => {
      await renderWithTheme(<Badge count={0} />);
      expect(screen.getByText('0', hidden)).toBeTruthy();
    });
  });
});
