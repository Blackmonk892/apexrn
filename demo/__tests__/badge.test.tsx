import { StyleSheet, View } from 'react-native';
import { screen } from '@testing-library/react-native';
import { Badge, presets } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const variants = ['default', 'primary', 'outline', 'accent', 'destructive', 'success', 'warning'] as const;

describe('Badge', () => {
  it('renders every variant in all four palettes', async () => {
    for (const variant of variants) {
      const results = await renderInPalettes(<Badge variant={variant} label="Beta" />);
      expect(results).toHaveLength(4);
      for (const { view } of results) {
        expect(view.getByText('Beta')).toBeTruthy();
      }
    }
  });

  it('reads as plain text to assistive tech', async () => {
    await renderWithTheme(<Badge label="Beta" testID="badge" />);
    const badge = screen.getByTestId('badge');
    expect(badge.props.accessible).toBe(true);
    expect(badge.props.accessibilityRole).toBe('text');
  });

  it('children take precedence over label', async () => {
    await renderWithTheme(<Badge label="Beta">New</Badge>);
    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.queryByText('Beta')).toBeNull();
  });

  it('uses the ink/fill pair of its variant', async () => {
    await renderWithTheme(<Badge variant="primary" label="Beta" testID="badge" />, { mode: 'light', preset: 'raw' });
    const { primary, primaryForeground } = presets.raw.light;
    expect(StyleSheet.flatten(screen.getByTestId('badge').props.style).backgroundColor).toBe(primary);
    expect(StyleSheet.flatten(screen.getByText('Beta').props.style).color).toBe(primaryForeground);
  });

  it('is flat', async () => {
    await renderWithTheme(<Badge label="Beta" />);
    expect(screen.queryByTestId('brutal-surface-shadow')).toBeNull();
  });

  it('renders non-string children and leaves them to their own semantics', async () => {
    await renderWithTheme(
      <Badge testID="badge">
        <View testID="custom" />
      </Badge>,
    );
    expect(screen.getByTestId('custom')).toBeTruthy();
    expect(screen.getByTestId('badge').props.accessible).toBe(false);
  });

  describe('count', () => {
    it('renders the number in the mono variant', async () => {
      await renderWithTheme(<Badge count={7} />);
      const text = screen.getByText('7');
      expect(StyleSheet.flatten(text.props.style).fontVariant).toEqual(['tabular-nums']);
      expect(StyleSheet.flatten(text.props.style).textTransform).toBeUndefined();
    });

    it('caps at 99 by default and reads the real number', async () => {
      await renderWithTheme(<Badge count={120} />);
      expect(screen.getByText('99+')).toBeTruthy();
      expect(screen.getByLabelText('120')).toBeTruthy();
    });

    it('honours max', async () => {
      await renderWithTheme(<Badge count={12} max={9} />);
      expect(screen.getByText('9+')).toBeTruthy();
    });

    it('does not cap a count equal to max', async () => {
      await renderWithTheme(<Badge count={99} />);
      expect(screen.getByText('99')).toBeTruthy();
    });

    it('lets an explicit accessibilityLabel win', async () => {
      await renderWithTheme(<Badge count={3} accessibilityLabel="3 unread" />);
      expect(screen.getByLabelText('3 unread')).toBeTruthy();
    });

    it('shows zero', async () => {
      await renderWithTheme(<Badge count={0} />);
      expect(screen.getByText('0')).toBeTruthy();
    });
  });
});
