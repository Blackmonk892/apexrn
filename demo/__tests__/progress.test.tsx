import { StyleSheet } from 'react-native';
import { screen } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import { Progress } from '@apexrn/ui';
import { renderInPalettes, renderWithTheme } from './utils/render';

describe('Progress', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Progress value={40} label="Upload" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('progressbar')).toBeTruthy();
    }
  });

  it('exposes min, max and now', async () => {
    await renderWithTheme(<Progress value={30} max={50} />);
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({ min: 0, max: 50, now: 30 });
  });

  it('clamps value above max down to max', async () => {
    await renderWithTheme(<Progress value={150} />);
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(100);
  });

  it('clamps negative value up to 0', async () => {
    await renderWithTheme(<Progress value={-20} />);
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(0);
  });

  it('is indeterminate without a value: no now, busy', async () => {
    await renderWithTheme(<Progress />);
    const bar = screen.getByRole('progressbar');
    expect(bar.props.accessibilityValue?.now).toBeUndefined();
    expect(bar.props.accessibilityState).toMatchObject({ busy: true });
    expect(screen.queryByTestId('progress-percent')).toBeNull();
  });

  it('shows the label and a mono percentage', async () => {
    await renderWithTheme(<Progress value={25} label="Uploading" />);
    expect(screen.getByText('Uploading', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('25%', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('progressbar').props.accessibilityLabel).toBe('Uploading');
  });

  it('scales the fill with a transform, never width', async () => {
    await renderWithTheme(<Progress value={50} />);
    const style = StyleSheet.flatten(screen.getByTestId('progress-fill').props.style);
    expect(style.transform).toEqual(expect.arrayContaining([expect.objectContaining({ scaleX: expect.any(Number) })]));
    expect(style.width).toBe('100%');
  });

  it('loops the indeterminate sweep under normal motion', async () => {
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<Progress />);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('holds three static blocks under reduced motion', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<Progress />);
    expect(spy).not.toHaveBeenCalled();
    const fills = screen.getAllByTestId('progress-block').map((f) => StyleSheet.flatten(f.props.style).opacity);
    expect(fills).toEqual([1, 1, 1]);
    spy.mockRestore();
  });
});
