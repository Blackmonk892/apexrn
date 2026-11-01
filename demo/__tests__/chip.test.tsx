import { fireEvent, screen } from '@testing-library/react-native';
import { Chip } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

describe('Chip', () => {
  it('renders every variant in all four palettes', async () => {
    for (const variant of ['default', 'destructive', 'success', 'warning'] as const) {
      for (const { view } of await renderInPalettes(<Chip label="Design" variant={variant} />)) {
        expect(view.getByText('Design')).toBeTruthy();
      }
    }
  });

  it('toggles uncontrolled and reports the change', async () => {
    const onSelectedChange = jest.fn();
    await renderWithTheme(<Chip label="Design" defaultSelected={false} onSelectedChange={onSelectedChange} />);
    expect(screen.getByRole('button', { name: 'Design' }).props.accessibilityState.selected).toBe(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Design' }));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Design' }).props.accessibilityState.selected).toBe(true);
  });

  it('controlled: the display stays put when the parent ignores the change', async () => {
    const onSelectedChange = jest.fn();
    await renderWithTheme(<Chip label="Design" selected={false} onSelectedChange={onSelectedChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Design' }));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Design' }).props.accessibilityState.selected).toBe(false);
  });

  it('fires onPress for an action chip', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Chip label="Suggest" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Suggest' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled fires nothing and reports its state', async () => {
    const onSelectedChange = jest.fn();
    const onRemove = jest.fn();
    await renderWithTheme(<Chip label="Design" disabled onSelectedChange={onSelectedChange} onRemove={onRemove} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Design' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Remove Design' }));
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Design' }).props.accessibilityState.disabled).toBe(true);
  });

  it('the remove control is labelled and separate', async () => {
    const onRemove = jest.fn();
    await renderWithTheme(<Chip label="ada@x.dev" onRemove={onRemove} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Remove ada@x.dev' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('removeLabel overrides the default label', async () => {
    await renderWithTheme(<Chip label="Design" onRemove={() => {}} removeLabel="Clear design" />);
    expect(screen.getByRole('button', { name: 'Clear design' })).toBeTruthy();
  });

  it('a chip with no handlers is plain text', async () => {
    await renderWithTheme(<Chip label="Static" />);
    expect(screen.getByRole('text', { name: 'Static' })).toBeTruthy();
  });

  it('status chips show a status icon next to the label', async () => {
    await renderWithTheme(<Chip label="Paid" variant="success" />);
    expect(screen.getByTestId('status-icon-success', { includeHiddenElements: true })).toBeTruthy();
  });
});
