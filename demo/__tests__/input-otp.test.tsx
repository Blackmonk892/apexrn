import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { InputOTP, presets } from '@apexrn/ui';
import { renderInPalettes, renderWithTheme } from './utils/render';

const HIDDEN = { includeHiddenElements: true };

function cellStyle(index: number) {
  const cell = screen.getAllByTestId('input-otp-cell', HIDDEN)[index];
  let node: typeof cell | null = cell;
  while (node) {
    const style = StyleSheet.flatten(node.props.style);
    if (style?.borderWidth) return style;
    node = node.parent;
  }
  throw new Error('no surface for cell');
}

describe('InputOTP', () => {
  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<InputOTP testID="otp" length={6} defaultValue="12" />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByTestId('otp')).toBeTruthy();
      expect(view.getAllByTestId('input-otp-cell', HIDDEN)).toHaveLength(6);
    }
  });

  it('draws one digit per cell and reads fill and border from their own pairs', async () => {
    await renderWithTheme(<InputOTP testID="otp" length={4} defaultValue="12" />);
    expect(screen.getByText('1', HIDDEN)).toBeTruthy();
    expect(screen.getByText('2', HIDDEN)).toBeTruthy();
    expect(cellStyle(0).borderColor).toBe(presets.neo.light.input);
    expect(cellStyle(0).backgroundColor).toBe(presets.neo.light.background);
  });

  it('is uncontrolled with defaultValue and reports changes', async () => {
    const onValueChange = jest.fn();
    const onChangeText = jest.fn();
    await renderWithTheme(
      <InputOTP testID="otp" defaultValue="12" onValueChange={onValueChange} onChangeText={onChangeText} />,
    );
    expect(screen.getByTestId('otp').props.value).toBe('12');
    await fireEvent.changeText(screen.getByTestId('otp'), '123');
    expect(onValueChange).toHaveBeenCalledWith('123');
    expect(onChangeText).toHaveBeenCalledWith('123');
    expect(screen.getByTestId('otp').props.value).toBe('123');
  });

  it('keeps its display when controlled and the parent ignores the change', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<InputOTP testID="otp" value="12" onValueChange={onValueChange} />);
    await fireEvent.changeText(screen.getByTestId('otp'), '123');
    expect(onValueChange).toHaveBeenCalledWith('123');
    expect(screen.getByTestId('otp').props.value).toBe('12');
  });

  it('fires onComplete once when the last cell fills', async () => {
    const onComplete = jest.fn();
    await renderWithTheme(<InputOTP testID="otp" length={4} onComplete={onComplete} />);
    const field = screen.getByTestId('otp');
    await fireEvent.changeText(field, '123');
    expect(onComplete).not.toHaveBeenCalled();
    await fireEvent.changeText(field, '1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
    await fireEvent.changeText(field, '1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('fills every cell from a pasted code and drops separators and overflow', async () => {
    const onComplete = jest.fn();
    await renderWithTheme(<InputOTP testID="otp" length={6} onComplete={onComplete} />);
    await fireEvent.changeText(screen.getByTestId('otp'), '123 456 789');
    expect(screen.getByTestId('otp').props.value).toBe('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('asks the OS for one-time codes', async () => {
    await renderWithTheme(<InputOTP testID="otp" />);
    const field = screen.getByTestId('otp');
    expect(field.props.textContentType).toBe('oneTimeCode');
    expect(field.props.autoComplete).toBe('sms-otp');
    expect(field.props.keyboardType).toBe('number-pad');
  });

  it('shows the focus ring on the active cell only, and drops it on blur', async () => {
    await renderWithTheme(<InputOTP testID="otp" length={4} defaultValue="12" />);
    const field = screen.getByTestId('otp');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
    await fireEvent(field, 'focus');
    expect(screen.getAllByTestId('brutal-surface-ring', HIDDEN)).toHaveLength(1);
    await fireEvent(field, 'blur');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
  });

  it('forwards focus and blur to the consumer', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await renderWithTheme(<InputOTP testID="otp" onFocus={onFocus} onBlur={onBlur} />);
    await fireEvent(screen.getByTestId('otp'), 'focus');
    await fireEvent(screen.getByTestId('otp'), 'blur');
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('is not editable when disabled, shows dashed cells and no ring', async () => {
    await renderWithTheme(<InputOTP testID="otp" disabled defaultValue="1" />);
    const field = screen.getByTestId('otp');
    expect(field.props.editable).toBe(false);
    expect(field.props.accessibilityState).toMatchObject({ disabled: true });
    expect(cellStyle(0).borderStyle).toBe('dashed');
    await fireEvent(field, 'focus');
    expect(screen.queryByTestId('brutal-surface-ring', HIDDEN)).toBeNull();
  });

  it('marks the code invalid with a destructive border on every cell', async () => {
    await renderWithTheme(<InputOTP testID="otp" length={4} invalid />);
    expect(screen.getByTestId('otp').props['aria-invalid']).toBe(true);
    for (let i = 0; i < 4; i++) expect(cellStyle(i).borderColor).toBe(presets.neo.light.destructive);
  });

  it('is not marked invalid by default', async () => {
    await renderWithTheme(<InputOTP testID="otp" />);
    expect(screen.getByTestId('otp').props['aria-invalid']).toBeUndefined();
  });

  it('exposes one labelled input and hides the cells from assistive tech', async () => {
    await renderWithTheme(<InputOTP testID="otp" length={6} defaultValue="12" />);
    expect(screen.getByTestId('otp').props.accessibilityLabel).toBe('One-time code, 2 of 6 digits entered');
    expect(screen.queryAllByTestId('input-otp-cell')).toHaveLength(0);
    expect(screen.getAllByTestId('input-otp-cell', HIDDEN)).toHaveLength(6);
  });

  it('lets an explicit accessibilityLabel win', async () => {
    await renderWithTheme(<InputOTP testID="otp" accessibilityLabel="Verification code" />);
    expect(screen.getByTestId('otp').props.accessibilityLabel).toBe('Verification code');
  });

  it('keeps the touch row at least 44 high', async () => {
    await renderWithTheme(<InputOTP testID="otp" blockSize={28} length={4} />);
    const row = screen.getAllByTestId('input-otp-cell', HIDDEN)[0].parent;
    let node = row;
    let minHeight = 0;
    while (node && !minHeight) {
      minHeight = StyleSheet.flatten(node.props.style)?.minHeight ?? 0;
      node = node.parent;
    }
    expect(minHeight).toBeGreaterThanOrEqual(44);
  });
});
