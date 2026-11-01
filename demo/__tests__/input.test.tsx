import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Input, presets } from '@apexrn/ui';
import { renderInPalettes, renderWithTheme } from './utils/render';

const HIDDEN = { includeHiddenElements: true };

// BrutalSurface keeps its fill and border on a wrapper above the TextInput.
function surfaceStyle(testID: string) {
  let node = screen.getByTestId(testID).parent;
  while (node) {
    const style = StyleSheet.flatten(node.props.style);
    if (style?.borderWidth) return style;
    node = node.parent;
  }
  throw new Error('no surface above the input');
}

describe('Input', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Input testID="email" label="Email" placeholder="you@example.com" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByTestId('email')).toBeTruthy();
      expect(view.getByText('Email', HIDDEN)).toBeTruthy();
    }
  });

  it('reads fill, ink and placeholder from their own pairs in raw dark', async () => {
    const colors = presets.raw.dark;
    await renderWithTheme(<Input testID="email" placeholder="you@example.com" />, { preset: 'raw', mode: 'dark' });
    const field = screen.getByTestId('email');
    expect(field.props.placeholderTextColor).toBe(colors.mutedForeground);
    expect(StyleSheet.flatten(field.props.style).color).toBe(colors.foreground);
    expect(surfaceStyle('email').backgroundColor).toBe(colors.background);
    expect(surfaceStyle('email').borderColor).toBe(colors.input);
  });

  it('lets a consumer placeholder colour win', async () => {
    await renderWithTheme(<Input testID="email" placeholder="x" placeholderTextColor="#123456" />);
    expect(screen.getByTestId('email').props.placeholderTextColor).toBe('#123456');
  });

  it('is uncontrolled with defaultValue and reports changes', async () => {
    const onValueChange = jest.fn();
    const onChangeText = jest.fn();
    await renderWithTheme(
      <Input testID="email" defaultValue="ada" onValueChange={onValueChange} onChangeText={onChangeText} />,
    );
    expect(screen.getByDisplayValue('ada')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('email'), 'ada@example.com');
    expect(onValueChange).toHaveBeenCalledWith('ada@example.com');
    expect(onChangeText).toHaveBeenCalledWith('ada@example.com');
  });

  it('keeps its display when controlled and the parent ignores the change', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Input testID="email" value="ada" onValueChange={onValueChange} />);
    await fireEvent.changeText(screen.getByTestId('email'), 'grace');
    expect(onValueChange).toHaveBeenCalledWith('grace');
    expect(screen.getByTestId('email').props.value).toBe('ada');
  });

  it('shows the focus ring on focus and drops it on blur', async () => {
    await renderWithTheme(<Input testID="email" />);
    const field = screen.getByTestId('email');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
    await fireEvent(field, 'focus');
    expect(screen.getByTestId('brutal-surface-ring', HIDDEN)).toBeTruthy();
    await fireEvent(field, 'blur');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
  });

  it('forwards focus and blur to the consumer', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await renderWithTheme(<Input testID="email" onFocus={onFocus} onBlur={onBlur} />);
    await fireEvent(screen.getByTestId('email'), 'focus');
    await fireEvent(screen.getByTestId('email'), 'blur');
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('is not editable when disabled, fires nothing, and shows a dashed border without a grey fill', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Input testID="email" disabled onValueChange={onValueChange} />);
    const field = screen.getByTestId('email');
    expect(field.props.editable).toBe(false);
    expect(field.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.changeText(field, 'x');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(surfaceStyle('email').borderStyle).toBe('dashed');
    expect(surfaceStyle('email').backgroundColor).toBe(presets.neo.light.background);
    await fireEvent(field, 'focus');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
  });

  it('marks the field invalid with a destructive border', async () => {
    await renderWithTheme(<Input testID="email" invalid />);
    expect(screen.getByTestId('email').props['aria-invalid']).toBe(true);
    expect(surfaceStyle('email').borderColor).toBe(presets.neo.light.destructive);
  });

  it('is not marked invalid by default', async () => {
    await renderWithTheme(<Input testID="email" />);
    expect(screen.getByTestId('email').props['aria-invalid']).toBeUndefined();
  });

  it('shows the error message with an icon only while invalid', async () => {
    const { rerender } = await renderWithTheme(<Input testID="email" errorMessage="Enter an email address." />);
    expect(screen.queryByTestId('input-error-icon', HIDDEN)).toBeNull();
    await rerender(<Input testID="email" invalid errorMessage="Enter an email address." />);
    expect(screen.getByTestId('input-error-icon', HIDDEN)).toBeTruthy();
    const message = screen.getByText('Enter an email address.', HIDDEN);
    expect(StyleSheet.flatten(message.props.style).color).toBe(presets.neo.light.destructive);
    expect(StyleSheet.flatten(message.props.style).textTransform).toBe('uppercase');
  });

  it('reads the error with the field and does not announce it twice', async () => {
    await renderWithTheme(
      <Input testID="email" label="Email" description="We only use it for receipts." invalid errorMessage="Enter an email address." />,
    );
    const hint = screen.getByTestId('email').props.accessibilityHint as string;
    expect(hint).toContain('Enter an email address.');
    expect(hint).toContain('We only use it for receipts.');
    expect(screen.queryByText('Enter an email address.')).toBeNull();
    expect(screen.getByText('Enter an email address.', HIDDEN)).toBeTruthy();
  });

  it('keeps a consumer hint ahead of the error', async () => {
    await renderWithTheme(<Input testID="email" accessibilityHint="Work address" invalid errorMessage="Required." />);
    expect(screen.getByTestId('email').props.accessibilityHint).toBe('Work address. Required.');
  });

  it('names the field from its label on both platforms', async () => {
    await renderWithTheme(<Input testID="email" label="Email address" />);
    const field = screen.getByTestId('email');
    const label = screen.getByText('Email address', HIDDEN);
    expect(label.props.nativeID).toBeTruthy();
    expect(field.props.accessibilityLabelledBy).toBe(label.props.nativeID);
    expect(field.props.accessibilityLabel).toBe('Email address');
  });

  it('announces a required field as required', async () => {
    await renderWithTheme(<Input testID="email" label="Email address" required />);
    expect(screen.getByTestId('email').props.accessibilityLabel).toBe('Email address, required');
  });

  it('lets an explicit accessibilityLabel win', async () => {
    await renderWithTheme(<Input testID="email" label="Email" accessibilityLabel="Work email" />);
    expect(screen.getByTestId('email').props.accessibilityLabel).toBe('Work email');
  });

  it('renders leading and trailing slots', async () => {
    const { Text } = require('react-native');
    await renderWithTheme(<Input testID="email" leading={<Text>@</Text>} trailing={<Text>.com</Text>} />);
    expect(screen.getByText('@')).toBeTruthy();
    expect(screen.getByText('.com')).toBeTruthy();
  });

  it('sizes the surface 40 / 48 / 56', async () => {
    for (const [size, height] of [['sm', 40], ['md', 48], ['lg', 56]] as const) {
      await renderWithTheme(<Input testID={`f-${size}`} size={size} />);
      expect(surfaceStyle(`f-${size}`).minHeight).toBe(height);
    }
  });

  it('merges inputStyle onto the text input and surfaceStyle onto the surface', async () => {
    await renderWithTheme(
      <Input testID="email" inputStyle={{ letterSpacing: 2 }} surfaceStyle={{ alignItems: 'flex-start' }} />,
    );
    expect(StyleSheet.flatten(screen.getByTestId('email').props.style).letterSpacing).toBe(2);
    expect(surfaceStyle('email').alignItems).toBe('flex-start');
  });
});
