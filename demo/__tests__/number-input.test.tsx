import { useState } from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { NumberInput } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Controlled(props: { min?: number; max?: number; step?: number; onChange?: (n: number) => void; start?: number }) {
  const [v, setV] = useState(props.start ?? 0);
  return (
    <NumberInput
      accessibilityLabel="Qty"
      value={v}
      min={props.min}
      max={props.max}
      step={props.step}
      onValueChange={(n) => {
        props.onChange?.(n);
        setV(n);
      }}
    />
  );
}

const action = (actionName: string) => ({ nativeEvent: { actionName } });

describe('NumberInput', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders in all four palettes with the adjustable role and value', async () => {
    const results = await renderInPalettes(<NumberInput label="Qty" defaultValue={3} min={0} max={9} />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('adjustable').props.accessibilityValue).toEqual({ min: 0, max: 9, now: 3, text: '3' });
      expect(view.getByLabelText('Increase')).toBeTruthy();
      expect(view.getByLabelText('Decrease')).toBeTruthy();
    }
  });

  it('steps with the plus and minus buttons, uncontrolled', async () => {
    const onChange = jest.fn();
    await renderWithTheme(<NumberInput defaultValue={5} onValueChange={onChange} />);
    await fireEvent.press(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenLastCalledWith(6);
    await fireEvent.press(screen.getByLabelText('Decrease'));
    await fireEvent.press(screen.getByLabelText('Decrease'));
    expect(onChange).toHaveBeenLastCalledWith(4);
    expect(screen.getByDisplayValue('4')).toBeTruthy();
  });

  it('follows value when controlled', async () => {
    const onChange = jest.fn();
    await renderWithTheme(<NumberInput value={3} onValueChange={onChange} />);
    await fireEvent.press(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.getByDisplayValue('3')).toBeTruthy();
  });

  it('clamps to max and disables the button at the bound', async () => {
    await renderWithTheme(<Controlled start={9} min={0} max={10} />);
    await fireEvent.press(screen.getByLabelText('Increase'));
    expect(screen.getByDisplayValue('10')).toBeTruthy();
    expect(screen.getByLabelText('Increase').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText('Decrease').props.accessibilityState.disabled).toBe(false);
  });

  it('disables the decrease button at min', async () => {
    await renderWithTheme(<NumberInput defaultValue={0} min={0} />);
    expect(screen.getByLabelText('Decrease').props.accessibilityState.disabled).toBe(true);
  });

  it('disabled field ignores buttons and actions', async () => {
    const onChange = jest.fn();
    await renderWithTheme(<NumberInput disabled defaultValue={1} onValueChange={onChange} />);
    await fireEvent.press(screen.getByLabelText('Increase'));
    await fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', action('increment'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports increment and decrement accessibility actions', async () => {
    const onChange = jest.fn();
    await renderWithTheme(<NumberInput defaultValue={5} step={2} onValueChange={onChange} />);
    const root = screen.getByRole('adjustable');
    expect(root.props.accessibilityActions).toEqual([{ name: 'increment' }, { name: 'decrement' }]);
    await fireEvent(root, 'accessibilityAction', action('increment'));
    expect(onChange).toHaveBeenLastCalledWith(7);
    await fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', action('decrement'));
    await fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', action('decrement'));
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('keeps fractional steps exact', async () => {
    const seen: number[] = [];
    await renderWithTheme(<Controlled step={0.1} onChange={(n) => seen.push(n)} />);
    for (let i = 0; i < 3; i++) await fireEvent.press(screen.getByLabelText('Increase'));
    expect(seen).toEqual([0.1, 0.2, 0.3]);
    expect(screen.getByDisplayValue('0.3')).toBeTruthy();
  });

  it('commits typed text on blur and submit, snapped to step and clamped', async () => {
    const onChange = jest.fn();
    await renderWithTheme(<NumberInput defaultValue={0} min={0} max={10} step={2} onValueChange={onChange} />);
    const field = screen.getByDisplayValue('0');
    await fireEvent(field, 'focus');
    await fireEvent.changeText(field, '5');
    await fireEvent(screen.getByDisplayValue('5'), 'blur');
    expect(onChange).toHaveBeenLastCalledWith(6);
    await fireEvent(screen.getByDisplayValue('6'), 'focus');
    await fireEvent.changeText(screen.getByDisplayValue('6'), '99');
    await fireEvent(screen.getByDisplayValue('99'), 'submitEditing');
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('reverts unparseable text', async () => {
    const onChange = jest.fn();
    await renderWithTheme(<NumberInput defaultValue={4} onValueChange={onChange} />);
    const field = screen.getByDisplayValue('4');
    await fireEvent(field, 'focus');
    await fireEvent.changeText(field, 'abc');
    await fireEvent(screen.getByDisplayValue('abc'), 'blur');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('4')).toBeTruthy();
  });

  describe('hold to repeat', () => {
    it('steps on press in, repeats after 400ms with a shortening interval, and stops on press out', async () => {
      jest.useFakeTimers();
      const seen: number[] = [];
      await renderWithTheme(<Controlled onChange={(n) => seen.push(n)} />);
      await fireEvent(screen.getByLabelText('Increase'), 'pressIn');
      expect(seen).toEqual([1]);
      await act(async () => {
        jest.advanceTimersByTime(399);
      });
      expect(seen).toEqual([1]);
      await act(async () => {
        jest.advanceTimersByTime(1);
      });
      expect(seen).toEqual([1, 2]);
      await act(async () => {
        jest.advanceTimersByTime(150);
      });
      expect(seen).toEqual([1, 2, 3]);
      // The next gap is 150 * 0.85 = 127.5ms, so 127ms is not enough.
      await act(async () => {
        jest.advanceTimersByTime(127);
      });
      expect(seen).toEqual([1, 2, 3]);
      await act(async () => {
        jest.advanceTimersByTime(1);
      });
      expect(seen).toEqual([1, 2, 3, 4]);

      await fireEvent(screen.getByLabelText('Increase'), 'pressOut');
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(seen).toEqual([1, 2, 3, 4]);
    });

    it('does not double-step when onPress follows a press in and out', async () => {
      const onChange = jest.fn();
      await renderWithTheme(<NumberInput defaultValue={0} onValueChange={onChange} />);
      const plus = screen.getByLabelText('Increase');
      await fireEvent(plus, 'pressIn');
      await fireEvent(plus, 'pressOut');
      await fireEvent.press(plus);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('stops repeating at max', async () => {
      jest.useFakeTimers();
      const onChange = jest.fn();
      await renderWithTheme(<Controlled max={2} onChange={onChange} />);
      await fireEvent(screen.getByLabelText('Increase'), 'pressIn');
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(screen.getByLabelText('Increase').props.accessibilityState.disabled).toBe(true);
    });

    it('clears the timer on unmount', async () => {
      jest.useFakeTimers();
      const onChange = jest.fn();
      const view = await renderWithTheme(<NumberInput defaultValue={0} onValueChange={onChange} />);
      await fireEvent(screen.getByLabelText('Increase'), 'pressIn');
      expect(onChange).toHaveBeenCalledTimes(1);
      await view.unmount();
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
