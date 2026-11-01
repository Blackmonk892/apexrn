import { StyleSheet } from 'react-native';
import { screen } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import { Skeleton } from '@apexrn/ui';
import { renderInPalettes, renderWithTheme } from './utils/render';

describe('Skeleton', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Skeleton />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('progressbar')).toBeTruthy();
    }
  });

  it('announces once as a busy progressbar with a default label', async () => {
    await renderWithTheme(<Skeleton />);
    const bar = screen.getByRole('progressbar');
    expect(bar.props.accessibilityLabel).toBe('Loading');
    expect(bar.props.accessibilityState).toMatchObject({ busy: true });
  });

  it('takes a consumer label', async () => {
    await renderWithTheme(<Skeleton accessibilityLabel="Loading invoices" />);
    expect(screen.getByRole('progressbar').props.accessibilityLabel).toBe('Loading invoices');
  });

  it('sizes the block from width and height', async () => {
    await renderWithTheme(<Skeleton width={120} height={48} testID="sk" />);
    expect(StyleSheet.flatten(screen.getByTestId('sk').props.style)).toMatchObject({ width: 120, height: 48 });
  });

  it('moves the band by transform only', async () => {
    await renderWithTheme(<Skeleton />);
    const style = StyleSheet.flatten(screen.getByTestId('skeleton-band', { includeHiddenElements: true }).props.style);
    expect(style.transform).toEqual(expect.arrayContaining([expect.objectContaining({ translateX: expect.any(Number) })]));
    expect(style.left).toBe(0);
  });

  it('keeps the band out of the accessibility tree', async () => {
    await renderWithTheme(<Skeleton />);
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.queryByTestId('skeleton-band')).toBeNull();
    expect(screen.getByTestId('skeleton-band', { includeHiddenElements: true }).props.importantForAccessibility).toBe('no');
  });

  it('loops the sweep under normal motion', async () => {
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<Skeleton />);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does not loop under reduced motion and draws no band', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<Skeleton />);
    expect(spy).not.toHaveBeenCalled();
    expect(screen.queryByTestId('skeleton-band', { includeHiddenElements: true })).toBeNull();
    spy.mockRestore();
  });

  it('does not loop when paused, and is no longer busy', async () => {
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<Skeleton paused />);
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByRole('progressbar').props.accessibilityState).toMatchObject({ busy: false });
    spy.mockRestore();
  });

  describe('lines', () => {
    it('renders n blocks, the last at 60% width', async () => {
      await renderWithTheme(<Skeleton lines={3} />);
      const blocks = screen.getAllByTestId('skeleton-line', { includeHiddenElements: true });
      expect(blocks).toHaveLength(3);
      const widths = blocks.map((b) => StyleSheet.flatten(b.props.style).width);
      expect(widths).toEqual(['100%', '100%', '60%']);
    });

    it('announces the group once and hides the blocks', async () => {
      await renderWithTheme(<Skeleton lines={3} accessibilityLabel="Loading comments" />);
      expect(screen.getAllByRole('progressbar')).toHaveLength(1);
      expect(screen.getByRole('progressbar').props.accessibilityLabel).toBe('Loading comments');
      expect(screen.queryAllByTestId('skeleton-line')).toHaveLength(0);
    });

    it('keeps a single line at full width', async () => {
      await renderWithTheme(<Skeleton lines={1} />);
      const [only] = screen.getAllByTestId('skeleton-line', { includeHiddenElements: true });
      expect(StyleSheet.flatten(only.props.style).width).toBe('100%');
    });
  });
});
