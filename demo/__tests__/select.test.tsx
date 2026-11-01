import { act, fireEvent, screen } from '@testing-library/react-native';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const COUNTRIES = ['Argentina', 'Brazil', 'Canada', 'Denmark', 'Egypt', 'France', 'Germany', 'Hungary', 'India', 'Japan'];

function Picker(props: Partial<React.ComponentProps<typeof Select>> & { triggerProps?: object }) {
  const { triggerProps, ...rest } = props;
  return (
    <Select {...rest}>
      <SelectTrigger testID="trigger" label="Framework" placeholder="Choose" {...triggerProps} />
      <SelectContent title="Pick one">
        <SelectItem label="React Native" value="rn" />
        <SelectItem label="Flutter" value="flutter" />
        <SelectItem label="SwiftUI" value="swiftui" disabled />
      </SelectContent>
    </Select>
  );
}

const HIDDEN = { includeHiddenElements: true };

function shown(text: string) {
  return screen.getByTestId('trigger', HIDDEN).props.accessibilityValue?.text === text;
}

async function settle() {
  await act(async () => {
    jest.advanceTimersByTime(600);
  });
}

describe('Select', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Picker defaultValue="rn" defaultOpen />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('radio', { name: 'Flutter' })).toBeTruthy();
      expect(view.getByTestId('trigger', HIDDEN).props.accessibilityValue.text).toBe('React Native');
    }
  });

  it('uncontrolled: shows the label of defaultValue, selecting updates and closes', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Picker defaultValue="rn" onValueChange={onValueChange} />);
    expect(shown('React Native')).toBe(true);
    expect(screen.queryByRole('radio', { name: 'Flutter' })).toBeNull();
    await fireEvent.press(screen.getByTestId('trigger'));
    expect(screen.getByRole('radio', { name: 'React Native', checked: true })).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'Flutter' }));
    expect(onValueChange).toHaveBeenCalledWith('flutter');
    await settle();
    expect(screen.queryByRole('radio', { name: 'Flutter' })).toBeNull();
    expect(shown('Flutter')).toBe(true);
  });

  it('controlled: the display stays put when the parent ignores onValueChange', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Picker value="rn" onValueChange={onValueChange} />);
    await fireEvent.press(screen.getByTestId('trigger'));
    await fireEvent.press(screen.getByRole('radio', { name: 'Flutter' }));
    expect(onValueChange).toHaveBeenCalledWith('flutter');
    await settle();
    expect(shown('React Native')).toBe(true);
  });

  it('disabled trigger does not open', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Picker onOpenChange={onOpenChange} triggerProps={{ disabled: true }} />);
    await fireEvent.press(screen.getByTestId('trigger'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('disabled option does not fire', async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(<Picker onValueChange={onValueChange} defaultOpen />);
    await fireEvent.press(screen.getByRole('radio', { name: 'SwiftUI' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('trigger exposes combobox role with expanded state and the error as hint', async () => {
    await renderWithTheme(<Picker triggerProps={{ invalid: true, errorMessage: 'Pick one.' }} />);
    const trigger = screen.getByTestId('trigger');
    expect(trigger.props.accessibilityRole).toBe('combobox');
    expect(trigger.props.accessibilityState.expanded).toBe(false);
    expect(trigger.props.accessibilityHint).toBe('Pick one.');
    await fireEvent.press(trigger);
    expect(screen.getByTestId('trigger', HIDDEN).props.accessibilityState.expanded).toBe(true);
  });

  it('has no search field under 10 options', async () => {
    await renderWithTheme(<Picker defaultOpen />);
    expect(screen.queryByLabelText('Search')).toBeNull();
  });

  it('searches 10 or more options case-insensitively with a No results row', async () => {
    await renderWithTheme(
      <Select defaultOpen>
        <SelectTrigger placeholder="Country" />
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c} label={c} value={c.toLowerCase()} />
          ))}
        </SelectContent>
      </Select>,
    );
    const search = screen.getByLabelText('Search');
    await fireEvent.changeText(search, 'AR');
    expect(screen.getByRole('radio', { name: 'Argentina' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Denmark' })).toBeTruthy();
    expect(screen.queryByRole('radio', { name: 'Brazil' })).toBeNull();
    await fireEvent.changeText(search, 'zzz');
    expect(screen.getByText('No results')).toBeTruthy();
  });

  it('compound parts throw outside Select', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<SelectTrigger />)).rejects.toThrow('SelectTrigger must be used within Select');
    await expect(renderWithTheme(<SelectItem label="A" value="a" />)).rejects.toThrow('SelectItem must be used within Select');
    spy.mockRestore();
  });
});
