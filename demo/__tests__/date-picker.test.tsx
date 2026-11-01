import { act, fireEvent, screen } from '@testing-library/react-native';
import { DatePicker, DatePickerContent, DatePickerTrigger } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Picker(props: Partial<React.ComponentProps<typeof DatePicker>>) {
  return (
    <DatePicker locale="en-GB" {...props}>
      <DatePickerTrigger testID="trigger" label="Delivery date" />
      <DatePickerContent />
    </DatePicker>
  );
}

const NOV_3 = new Date(2026, 10, 3);

async function settle() {
  await act(async () => {
    jest.advanceTimersByTime(600);
  });
}

describe('DatePicker', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Picker defaultValue={NOV_3} defaultOpen />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByText('November 2026')).toBeTruthy();
      expect(view.getByLabelText('Tuesday, 3 November 2026')).toBeTruthy();
    }
  });

  it('shows the formatted date on the trigger', async () => {
    await renderWithTheme(<Picker defaultValue={NOV_3} />);
    expect(screen.getByDisplayValue('3 November 2026', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Delivery date' })).toBeTruthy();
  });

  it('uncontrolled: tapping a day selects it, fires onValueChange and closes', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Picker defaultValue={NOV_3} onValueChange={onValueChange} />);
    expect(screen.queryByText('November 2026')).toBeNull();
    await fireEvent.press(screen.getByTestId('trigger'));
    await fireEvent.press(screen.getByLabelText('Friday, 13 November 2026'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toEqual(new Date(2026, 10, 13));
    expect(screen.getByDisplayValue('13 November 2026', { includeHiddenElements: true })).toBeTruthy();
    await settle();
    expect(screen.queryByText('November 2026')).toBeNull();
  });

  it('controlled: a parent that ignores onValueChange keeps the display', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Picker value={NOV_3} onValueChange={onValueChange} defaultOpen />);
    await fireEvent.press(screen.getByLabelText('Friday, 13 November 2026'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue('3 November 2026', { includeHiddenElements: true })).toBeTruthy();
  });

  it('month buttons navigate', async () => {
    await renderWithTheme(<Picker defaultValue={NOV_3} defaultOpen />);
    await fireEvent.press(screen.getByLabelText('Next month'));
    expect(screen.getByText('December 2026')).toBeTruthy();
    expect(screen.getByLabelText('Thursday, 3 December 2026')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Previous month'));
    await fireEvent.press(screen.getByLabelText('Previous month'));
    expect(screen.getByText('October 2026')).toBeTruthy();
  });

  it('min and max disable days and the month buttons beyond them', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(
      <Picker
        defaultValue={NOV_3}
        min={new Date(2026, 10, 2)}
        max={new Date(2026, 10, 20)}
        onValueChange={onValueChange}
        defaultOpen
      />,
    );
    expect(screen.getByLabelText('Previous month').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText('Next month').props.accessibilityState.disabled).toBe(true);
    const before = screen.getByLabelText('Sunday, 1 November 2026');
    const after = screen.getByLabelText('Saturday, 21 November 2026');
    expect(before.props.accessibilityState.disabled).toBe(true);
    expect(after.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(before);
    await fireEvent.press(after);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Tuesday, 3 November 2026').props.accessibilityState.disabled).toBe(false);
  });

  it('isDateDisabled blocks days', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(
      <Picker defaultValue={NOV_3} isDateDisabled={(d) => d.getDay() === 0} onValueChange={onValueChange} defaultOpen />,
    );
    const sunday = screen.getByLabelText('Sunday, 8 November 2026');
    expect(sunday.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(sunday);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('marks the selected day', async () => {
    await renderWithTheme(<Picker defaultValue={NOV_3} defaultOpen />);
    expect(screen.getByLabelText('Tuesday, 3 November 2026').props.accessibilityState.selected).toBe(true);
    expect(screen.getByLabelText('Wednesday, 4 November 2026').props.accessibilityState.selected).toBe(false);
  });

  it('weekStartsOn reorders the weekday header', async () => {
    await renderWithTheme(<Picker defaultValue={NOV_3} weekStartsOn={1} defaultOpen />);
    const names = screen.getAllByText(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/, { includeHiddenElements: true }).map((n) => n.props.children);
    expect(names).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('disabled trigger does not open', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(
      <DatePicker locale="en-GB" onOpenChange={onOpenChange}>
        <DatePickerTrigger testID="trigger" disabled />
        <DatePickerContent />
      </DatePicker>,
    );
    await fireEvent.press(screen.getByTestId('trigger'));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('trigger').props.accessibilityState.disabled).toBe(true);
  });

  it('invalid trigger shows its message', async () => {
    await renderWithTheme(
      <DatePicker locale="en-GB">
        <DatePickerTrigger invalid errorMessage="Choose a later date." />
        <DatePickerContent />
      </DatePicker>,
    );
    expect(screen.getByText('Choose a later date.', { includeHiddenElements: true })).toBeTruthy();
  });

  it('parts throw outside DatePicker', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<DatePickerTrigger />)).rejects.toThrow('DatePickerTrigger must be used within DatePicker');
    await expect(renderWithTheme(<DatePickerContent />)).rejects.toThrow('DatePickerContent must be used within DatePicker');
    spy.mockRestore();
  });
});
