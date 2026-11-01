import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Checkbox, presets } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const hidden = { includeHiddenElements: true };

function Stateful({ onChange }: { onChange?: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      testID="box"
      accessibilityLabel="Accept terms"
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        onChange?.(next);
      }}
    />
  );
}

describe('Checkbox', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Checkbox accessibilityLabel="Accept terms" defaultChecked />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('checkbox', { name: 'Accept terms' })).toBeChecked();
    }
  });

  describe('controlled', () => {
    it('follows the parent', async () => {
      const onChange = jest.fn();
      await renderWithTheme(<Stateful onChange={onChange} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      await fireEvent.press(screen.getByTestId('box'));
      expect(onChange).toHaveBeenLastCalledWith(true);
      expect(screen.getByRole('checkbox')).toBeChecked();
      await fireEvent.press(screen.getByTestId('box'));
      expect(onChange).toHaveBeenLastCalledWith(false);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('stays unchecked when the parent ignores onCheckedChange', async () => {
      const onChange = jest.fn();
      await renderWithTheme(
        <Checkbox testID="box" accessibilityLabel="Accept terms" checked={false} onCheckedChange={onChange} />,
      );
      await fireEvent.press(screen.getByTestId('box'));
      expect(onChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });
  });

  describe('uncontrolled', () => {
    it('toggles itself from defaultChecked', async () => {
      const onChange = jest.fn();
      await renderWithTheme(
        <Checkbox testID="box" accessibilityLabel="Accept terms" defaultChecked onCheckedChange={onChange} />,
      );
      expect(screen.getByRole('checkbox')).toBeChecked();
      await fireEvent.press(screen.getByTestId('box'));
      expect(onChange).toHaveBeenCalledWith(false);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });
  });

  describe('disabled', () => {
    it('fires nothing and reports the state', async () => {
      const onChange = jest.fn();
      await renderWithTheme(
        <Checkbox testID="box" label="Accept terms" disabled onCheckedChange={onChange} />,
      );
      await fireEvent.press(screen.getByTestId('box'));
      await fireEvent.press(screen.getByText('Accept terms', hidden));
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('keeps the fill of its state instead of a grey one', async () => {
      await renderWithTheme(<Checkbox testID="box" accessibilityLabel="Accept terms" disabled defaultChecked />, {
        preset: 'raw',
      });
      const style = StyleSheet.flatten(screen.getByTestId('box').props.style);
      expect(style.backgroundColor).toBe(presets.raw.light.foreground);
      expect(style.borderStyle).toBe('dashed');
    });
  });

  describe('role and state', () => {
    it('exposes mixed for indeterminate', async () => {
      await renderWithTheme(<Checkbox testID="box" accessibilityLabel="Select all" checked="indeterminate" />);
      const box = screen.getByRole('checkbox', { name: 'Select all' });
      expect(box.props.accessibilityState).toMatchObject({ checked: 'mixed' });
      expect(box).toBePartiallyChecked();
    });

    it('moves from indeterminate to checked on press', async () => {
      const onChange = jest.fn();
      await renderWithTheme(
        <Checkbox testID="box" accessibilityLabel="Select all" defaultChecked="indeterminate" onCheckedChange={onChange} />,
      );
      await fireEvent.press(screen.getByTestId('box'));
      expect(onChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('label', () => {
    it('is announced once, by the checkbox', async () => {
      await renderWithTheme(<Checkbox label="Accept terms" />);
      expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeTruthy();
      expect(screen.queryByText('Accept terms')).toBeNull();
    });

    it('toggles when the label is pressed', async () => {
      const onChange = jest.fn();
      await renderWithTheme(<Checkbox label="Accept terms" onCheckedChange={onChange} />);
      await fireEvent.press(screen.getByText('Accept terms', hidden));
      expect(onChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('reaches the 44 point hit target without a label', async () => {
      await renderWithTheme(<Checkbox testID="box" accessibilityLabel="Accept terms" />);
      const { hitSlop } = screen.getByTestId('box').props;
      expect(24 + 2 * (hitSlop.top ?? hitSlop)).toBeGreaterThanOrEqual(44);
    });
  });
});
