import { StyleSheet } from 'react-native';
import { screen } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import { LoadingBlocks } from '@apexrn/ui';
import { renderWithTheme } from './utils/render';

describe('LoadingBlocks', () => {
  it('renders a progressbar labelled Loading with three blocks', async () => {
    await renderWithTheme(<LoadingBlocks color="#123456" />);
    const bar = screen.getByRole('progressbar');
    expect(bar.props.accessibilityLabel).toBe('Loading');
    expect(screen.getAllByTestId('loading-block')).toHaveLength(3);
  });

  it('sizes each block', async () => {
    await renderWithTheme(<LoadingBlocks color="#123456" size={10} />);
    expect(StyleSheet.flatten(screen.getAllByTestId('loading-block')[0].props.style)).toMatchObject({ width: 10, height: 10 });
  });

  it('loops under normal motion', async () => {
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<LoadingBlocks color="#123456" />);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('holds still with the middle block filled under reduced motion', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<LoadingBlocks color="#123456" />);
    expect(spy).not.toHaveBeenCalled();
    const fills = screen.getAllByTestId('loading-fill').map((f) => StyleSheet.flatten(f.props.style).opacity);
    expect(fills).toEqual([0, 1, 0]);
    spy.mockRestore();
  });
});
