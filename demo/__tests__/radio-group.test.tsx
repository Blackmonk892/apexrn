import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { RadioGroup, RadioGroupItem, borderWidths } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Shipping(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup accessibilityLabel="Shipping" {...props}>
      <RadioGroupItem value="standard" label="Standard" testID="radio-standard" />
      <RadioGroupItem value="express" label="Express" testID="radio-express" />
      <RadioGroupItem value="pickup" label="Pickup" disabled testID="radio-pickup" />
    </RadioGroup>
  );
}

// The indicator is decorative: the row carries the radio semantics, so it is hidden from the a11y tree.
const hidden = { includeHiddenElements: true };

describe('RadioGroup', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Shipping defaultValue="standard" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getAllByRole('radio')).toHaveLength(3);
      expect(view.getByLabelText('Shipping').props.accessibilityRole).toBe('radiogroup');
    }
  });

  it('works controlled: selection follows value, not taps', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Shipping value="standard" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('radio-express'));
    expect(onValueChange).toHaveBeenCalledWith('express');
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Express' })).not.toBeChecked();
  });

  it('works uncontrolled from defaultValue', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Shipping defaultValue="standard" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('radio-express'));
    expect(onValueChange).toHaveBeenCalledWith('express');
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Standard' })).not.toBeChecked();
  });

  it('selects nothing without a value', async () => {
    await renderWithTheme(<Shipping />);
    for (const name of ['Standard', 'Express']) {
      expect(screen.getByRole('radio', { name })).not.toBeChecked();
    }
  });

  it('ignores a disabled item and reports its state', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Shipping onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('radio-pickup'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Pickup' })).toBeDisabled();
  });

  it('ignores every item when the group is disabled', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Shipping disabled onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('radio-express'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Express' })).toBeDisabled();
  });

  it('gives each item a 44 hit target', async () => {
    await renderWithTheme(<Shipping />);
    expect(StyleSheet.flatten(screen.getByTestId('radio-express').props.style).minHeight).toBeGreaterThanOrEqual(44);
  });

  it('draws a square indicator with a filled inner square only when selected', async () => {
    await renderWithTheme(<Shipping defaultValue="express" />);
    const box = screen.getByTestId('radio-express-indicator', hidden);
    const boxStyle = StyleSheet.flatten(box.props.style);
    expect(boxStyle.borderRadius).toBe(0);
    expect(boxStyle.borderWidth).toBe(borderWidths.control);
    const mark = screen.getByTestId('radio-express-mark', hidden);
    expect(StyleSheet.flatten(mark.props.style).borderRadius ?? 0).toBe(0);
    expect(screen.queryByTestId('radio-standard-mark', hidden)).toBeNull();
  });

  it('throws when an item is used outside a RadioGroup', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<RadioGroupItem value="a" label="A" />)).rejects.toThrow(
      'RadioGroupItem must be used within RadioGroup',
    );
    spy.mockRestore();
  });
});
