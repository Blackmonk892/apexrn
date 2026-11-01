import { fireEvent, screen } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import { Marquee } from '@apexrn/ui';
import { renderInPalettes, renderWithTheme } from './utils/render';

const measure = async () =>
  await fireEvent(screen.getByTestId('marquee-copy', { includeHiddenElements: true }), 'layout', {
    nativeEvent: { layout: { width: 100, height: 20, x: 0, y: 0 } },
  });

describe('Marquee', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Marquee text="Breaking news" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByLabelText('Breaking news')).toBeTruthy();
    }
  });

  it('exposes one accessible node carrying the full message', async () => {
    await renderWithTheme(<Marquee text="Sale ends Sunday" />);
    expect(screen.getAllByLabelText('Sale ends Sunday')).toHaveLength(1);
    expect(screen.queryByText(/Sale ends Sunday/)).toBeNull();
  });

  it('keeps the duplicate copy out of the accessibility tree', async () => {
    await renderWithTheme(<Marquee text="Sale ends Sunday" />);
    expect(screen.getByTestId('marquee-duplicate', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByTestId('marquee-duplicate')).toBeNull();
  });

  it('loops under normal motion once the copy is measured', async () => {
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<Marquee text="Go" />);
    await measure();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('is static, single-line and without a duplicate under reduced motion', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<Marquee text="A long headline" />);
    expect(spy).not.toHaveBeenCalled();
    expect(screen.queryByTestId('marquee-duplicate', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByText('A long headline', { includeHiddenElements: true }).props.numberOfLines).toBe(1);
    spy.mockRestore();
  });

  it('does not loop when disabled', async () => {
    const spy = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<Marquee text="Go" disabled />);
    await measure();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('pauses while pressed and resumes on release', async () => {
    const cancel = jest.spyOn(Reanimated, 'cancelAnimation');
    const repeat = jest.spyOn(Reanimated, 'withRepeat');
    await renderWithTheme(<Marquee text="Go" />);
    await measure();
    const node = screen.getByLabelText('Go');
    repeat.mockClear();
    cancel.mockClear();
    await fireEvent(node, 'pressIn');
    expect(cancel).toHaveBeenCalled();
    expect(repeat).not.toHaveBeenCalled();
    await fireEvent(node, 'pressOut');
    expect(repeat).toHaveBeenCalled();
    cancel.mockRestore();
    repeat.mockRestore();
  });
});
