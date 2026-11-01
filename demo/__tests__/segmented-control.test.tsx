import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { HomeIcon, SegmentedControl } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const segments = [
  { value: 'day', label: 'Day', testID: 'seg-day' },
  { value: 'week', label: 'Week', testID: 'seg-week', icon: HomeIcon },
  { value: 'month', label: 'Month', testID: 'seg-month' },
  { value: 'year', label: 'Year', testID: 'seg-year', disabled: true },
];

describe('SegmentedControl', () => {
  it('renders in all four palettes with radiogroup and radio roles', async () => {
    const results = await renderInPalettes(<SegmentedControl segments={segments} defaultValue="day" accessibilityLabel="Range" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByLabelText('Range').props.accessibilityRole).toBe('radiogroup');
      expect(view.getAllByRole('radio')).toHaveLength(4);
    }
  });

  it('works uncontrolled from defaultValue', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<SegmentedControl segments={segments} defaultValue="day" onValueChange={onValueChange} />);
    expect(screen.getByRole('radio', { name: 'Day' })).toBeChecked();
    await fireEvent.press(screen.getByTestId('seg-month'));
    expect(onValueChange).toHaveBeenCalledWith('month');
    expect(screen.getByRole('radio', { name: 'Month' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Day' })).not.toBeChecked();
  });

  it('starts on the first enabled segment without a defaultValue', async () => {
    await renderWithTheme(<SegmentedControl segments={segments} />);
    expect(screen.getByRole('radio', { name: 'Day' })).toBeChecked();
  });

  it('works controlled: selection follows value, not taps', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<SegmentedControl segments={segments} value="day" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('seg-week'));
    expect(onValueChange).toHaveBeenCalledWith('week');
    expect(screen.getByRole('radio', { name: 'Day' })).toBeChecked();
  });

  it('does not fire for the selected segment', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<SegmentedControl segments={segments} defaultValue="day" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('seg-day'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('ignores a disabled segment and reports its state', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<SegmentedControl segments={segments} defaultValue="day" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('seg-year'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Year' })).toBeDisabled();
  });

  it('ignores every press when the whole control is disabled', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<SegmentedControl segments={segments} defaultValue="day" disabled onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('seg-week'));
    expect(onValueChange).not.toHaveBeenCalled();
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });

  it('gives each segment a 44 hit target', async () => {
    await renderWithTheme(<SegmentedControl segments={segments} defaultValue="day" />);
    const style = StyleSheet.flatten(screen.getByTestId('seg-week').props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('warns outside 2 to 5 segments', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await renderWithTheme(<SegmentedControl segments={[{ value: 'a', label: 'A' }]} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('2 to 5 segments'));
    warn.mockRestore();
  });
});
