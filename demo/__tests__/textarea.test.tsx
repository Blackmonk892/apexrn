import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Textarea, presets, spacing } from '@apexrn/ui';
import { renderInPalettes, renderWithTheme } from './utils/render';

const HIDDEN = { includeHiddenElements: true };
const LINE = 22;

// BrutalSurface keeps its fill and border on a wrapper above the TextInput.
function surfaceStyle(testID: string) {
  let node = screen.getByTestId(testID).parent;
  while (node) {
    const style = StyleSheet.flatten(node.props.style);
    if (style?.borderWidth) return style;
    node = node.parent;
  }
  throw new Error('no surface above the textarea');
}

const PAD = () => spacing.sm;
const fieldHeight = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style).height;
const grow = (testID: string, height: number) =>
  fireEvent(screen.getByTestId(testID), 'contentSizeChange', { nativeEvent: { contentSize: { width: 100, height } } });

describe('Textarea', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Textarea testID="bio" label="Bio" placeholder="About you" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByTestId('bio')).toBeTruthy();
      expect(view.getByText('Bio', HIDDEN)).toBeTruthy();
    }
  });

  it('is multiline with top-aligned text, and reads ink and border from its pairs in raw dark', async () => {
    const colors = presets.raw.dark;
    await renderWithTheme(<Textarea testID="bio" placeholder="x" />, { preset: 'raw', mode: 'dark' });
    const field = screen.getByTestId('bio');
    expect(field.props.multiline).toBe(true);
    expect(field.props.textAlignVertical).toBe('top');
    expect(field.props.placeholderTextColor).toBe(colors.mutedForeground);
    expect(StyleSheet.flatten(field.props.style).color).toBe(colors.foreground);
    expect(surfaceStyle('bio').borderColor).toBe(colors.input);
  });

  it('is uncontrolled with defaultValue and reports changes', async () => {
    const onValueChange = jest.fn();
    const onChangeText = jest.fn();
    await renderWithTheme(
      <Textarea testID="bio" defaultValue="ada" onValueChange={onValueChange} onChangeText={onChangeText} />,
    );
    expect(screen.getByDisplayValue('ada')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('bio'), 'ada\nlovelace');
    expect(onValueChange).toHaveBeenCalledWith('ada\nlovelace');
    expect(onChangeText).toHaveBeenCalledWith('ada\nlovelace');
  });

  it('keeps its display when controlled and the parent ignores the change', async () => {
    await renderWithTheme(<Textarea testID="bio" value="ada" onValueChange={jest.fn()} />);
    await fireEvent.changeText(screen.getByTestId('bio'), 'grace');
    expect(screen.getByTestId('bio').props.value).toBe('ada');
  });

  it('shows the focus ring on focus, drops it on blur, and forwards both', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await renderWithTheme(<Textarea testID="bio" onFocus={onFocus} onBlur={onBlur} />);
    const field = screen.getByTestId('bio');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
    await fireEvent(field, 'focus');
    expect(screen.getByTestId('brutal-surface-ring', HIDDEN)).toBeTruthy();
    await fireEvent(field, 'blur');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('is not editable when disabled, fires nothing, and shows a dashed border', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Textarea testID="bio" disabled onValueChange={onValueChange} />);
    const field = screen.getByTestId('bio');
    expect(field.props.editable).toBe(false);
    expect(field.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.changeText(field, 'x');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(surfaceStyle('bio').borderStyle).toBe('dashed');
    await fireEvent(field, 'focus');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
  });

  it('marks the field invalid with a destructive border, and not by default', async () => {
    const { rerender } = await renderWithTheme(<Textarea testID="bio" />);
    expect(screen.getByTestId('bio').props['aria-invalid']).toBeUndefined();
    await rerender(<Textarea testID="bio" invalid />);
    expect(screen.getByTestId('bio').props['aria-invalid']).toBe(true);
    expect(surfaceStyle('bio').borderColor).toBe(presets.neo.light.destructive);
  });

  it('shows the error row only while invalid, and reads it with the field once', async () => {
    const { rerender } = await renderWithTheme(<Textarea testID="bio" errorMessage="Too short." />);
    expect(screen.queryByTestId('textarea-error-icon', HIDDEN)).toBeNull();
    await rerender(<Textarea testID="bio" accessibilityHint="Plain text" invalid errorMessage="Too short." />);
    expect(screen.getByTestId('textarea-error-icon', HIDDEN)).toBeTruthy();
    expect(screen.getByTestId('bio').props.accessibilityHint).toBe('Plain text. Too short.');
    expect(screen.queryByText('Too short.')).toBeNull();
    const message = screen.getByText('Too short.', HIDDEN);
    expect(StyleSheet.flatten(message.props.style).color).toBe(presets.neo.light.destructive);
  });

  it('names the field from its label, and announces required', async () => {
    const { rerender } = await renderWithTheme(<Textarea testID="bio" label="Bio" />);
    const label = screen.getByText('Bio', HIDDEN);
    expect(screen.getByTestId('bio').props.accessibilityLabelledBy).toBe(label.props.nativeID);
    expect(screen.getByTestId('bio').props.accessibilityLabel).toBe('Bio');
    await rerender(<Textarea testID="bio" label="Bio" required />);
    expect(screen.getByTestId('bio').props.accessibilityLabel).toBe('Bio, required');
    await rerender(<Textarea testID="bio" label="Bio" accessibilityLabel="About you" />);
    expect(screen.getByTestId('bio').props.accessibilityLabel).toBe('About you');
  });

  it('starts at minRows and clamps growth between minRows and maxRows', async () => {
    await renderWithTheme(<Textarea testID="bio" minRows={2} maxRows={4} />);
    expect(fieldHeight('bio')).toBe(2 * LINE + PAD() * 2);
    await grow('bio', 3 * LINE);
    expect(fieldHeight('bio')).toBe(3 * LINE + PAD() * 2);
    await grow('bio', 10 * LINE);
    expect(fieldHeight('bio')).toBe(4 * LINE + PAD() * 2);
    await grow('bio', LINE);
    expect(fieldHeight('bio')).toBe(2 * LINE + PAD() * 2);
  });

  it('grows without a limit when maxRows is unset, and forwards onContentSizeChange', async () => {
    const onContentSizeChange = jest.fn();
    await renderWithTheme(<Textarea testID="bio" onContentSizeChange={onContentSizeChange} />);
    expect(fieldHeight('bio')).toBe(3 * LINE + PAD() * 2);
    await grow('bio', 20 * LINE);
    expect(fieldHeight('bio')).toBe(20 * LINE + PAD() * 2);
    expect(onContentSizeChange).toHaveBeenCalledTimes(1);
  });

  it('shows a counter only when maxLength is set, uncontrolled and controlled', async () => {
    await renderWithTheme(<Textarea testID="bio" />);
    expect(screen.queryByTestId('textarea-counter')).toBeNull();
    await renderWithTheme(<Textarea testID="bio" maxLength={20} defaultValue="abc" />);
    expect(screen.getByTestId('textarea-counter').props.children).toBe('3 / 20');
    await fireEvent.changeText(screen.getByTestId('bio'), 'abcdef');
    expect(screen.getByTestId('textarea-counter').props.children).toBe('6 / 20');
    expect(screen.getByTestId('bio').props.maxLength).toBe(20);
    await renderWithTheme(<Textarea testID="bio" maxLength={20} value="hi" />);
    expect(screen.getByTestId('textarea-counter').props.children).toBe('2 / 20');
  });

  it('merges inputStyle onto the text input and surfaceStyle onto the surface', async () => {
    await renderWithTheme(<Textarea testID="bio" inputStyle={{ letterSpacing: 2 }} surfaceStyle={{ alignItems: 'flex-start' }} />);
    expect(StyleSheet.flatten(screen.getByTestId('bio').props.style).letterSpacing).toBe(2);
    expect(surfaceStyle('bio').alignItems).toBe('flex-start');
  });
});
