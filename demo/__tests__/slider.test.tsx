import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { Slider } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const hidden = { includeHiddenElements: true };

const flat = (id: string) => StyleSheet.flatten(screen.getByTestId(id, hidden).props.style);
const act = (node: ReturnType<typeof screen.getByRole>, actionName: string) =>
  fireEvent(node, 'accessibilityAction', { nativeEvent: { actionName } });

describe('Slider', () => {
  it('renders in all four palettes with adjustable semantics', async () => {
    const results = await renderInPalettes(<Slider value={30} accessibilityLabel="Volume" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      const node = view.getByRole('adjustable', { name: 'Volume' });
      expect(node.props.accessibilityValue).toMatchObject({ min: 0, max: 100, now: 30 });
    }
  }, 30000);

  it('exposes increment and decrement actions', async () => {
    await renderWithTheme(<Slider value={30} accessibilityLabel="Volume" />);
    const names = screen.getByRole('adjustable').props.accessibilityActions.map((a: { name: string }) => a.name);
    expect(names).toEqual(['increment', 'decrement']);
  });

  it('steps an uncontrolled slider with accessibility actions', async () => {
    const onValueChange = jest.fn();
    const onSlidingComplete = jest.fn();
    await renderWithTheme(
      <Slider
        defaultValue={10}
        step={5}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        accessibilityLabel="Volume"
      />,
    );
    await act(screen.getByRole('adjustable'), 'increment');
    expect(onValueChange).toHaveBeenLastCalledWith(15);
    expect(onSlidingComplete).toHaveBeenLastCalledWith(15);
    expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(15);
    await act(screen.getByRole('adjustable'), 'decrement');
    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });

  it('clamps to min and max', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(
      <Slider defaultValue={100} onValueChange={onValueChange} accessibilityLabel="Volume" />,
    );
    await act(screen.getByRole('adjustable'), 'increment');
    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });

  it('honours defaultValue and snaps it to the step', async () => {
    await renderWithTheme(<Slider defaultValue={70} min={0} max={100} step={10} accessibilityLabel="Volume" />);
    expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(70);
  });

  it('stays put when a controlled parent ignores the change', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Slider value={20} onValueChange={onValueChange} accessibilityLabel="Volume" />);
    await act(screen.getByRole('adjustable'), 'increment');
    expect(onValueChange).toHaveBeenCalledWith(21);
    expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(20);
  });

  it('ignores actions when disabled and reports the state', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Slider value={20} disabled onValueChange={onValueChange} accessibilityLabel="Volume" />);
    await act(screen.getByRole('adjustable'), 'increment');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('adjustable')).toBeDisabled();
  });

  it('does not produce NaN for a degenerate range', async () => {
    await renderWithTheme(<Slider value={5} min={5} max={5} accessibilityLabel="Volume" />);
    expect(screen.getByRole('adjustable').props.accessibilityValue.now).toBe(5);
  });

  it('passes disabled to the surface: flat, no shadow, no fill', async () => {
    await renderWithTheme(<Slider value={40} disabled testID="sl" accessibilityLabel="Volume" />);
    expect(screen.queryByTestId('brutal-surface-shadow', hidden)).toBeNull();
    expect(screen.queryByTestId('sl-fill', hidden)).toBeNull();
  });

  it('draws a shadow on the thumb when enabled', async () => {
    await renderWithTheme(<Slider value={40} testID="sl" accessibilityLabel="Volume" />);
    expect(screen.getByTestId('brutal-surface-shadow', hidden)).toBeTruthy();
  });

  it('fills the track with scaleX, never width', async () => {
    await renderWithTheme(<Slider value={50} testID="sl" accessibilityLabel="Volume" />);
    const style = flat('sl-fill');
    expect(style.width).toBeUndefined();
    expect((style.transform as object[]).some((t) => 'scaleX' in t)).toBe(true);
  });

  it('has a 44pt hit target', async () => {
    await renderWithTheme(<Slider value={50} accessibilityLabel="Volume" />);
    expect(StyleSheet.flatten(screen.getByRole('adjustable').props.style).height).toBeGreaterThanOrEqual(44);
  });

  describe('value label', () => {
    it('is hidden by default', async () => {
      await renderWithTheme(<Slider value={42} testID="sl" accessibilityLabel="Volume" />);
      expect(screen.queryByTestId('sl-value', hidden)).toBeNull();
    });

    it('shows the formatted value in mono', async () => {
      await renderWithTheme(
        <Slider value={42} showValue formatValue={(v) => `${v}%`} testID="sl" accessibilityLabel="Volume" />,
      );
      expect(screen.getByText('42%', hidden)).toBeTruthy();
      expect(screen.getByRole('adjustable').props.accessibilityValue.text).toBe('42%');
    });
  });

  it('keeps the thumb transform-only under reduced motion', async () => {
    (useReducedMotion as jest.Mock).mockReturnValue(true);
    try {
      await renderWithTheme(<Slider value={50} testID="sl" accessibilityLabel="Volume" />);
      const move = (flat('sl-thumb').transform as object[]).find((t) => 'translateX' in t);
      expect(move).toBeDefined();
    } finally {
      (useReducedMotion as jest.Mock).mockReturnValue(false);
    }
  });
});
