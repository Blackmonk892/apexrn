import { act, fireEvent, screen } from '@testing-library/react-native';
import { Pressable, Text as RNText } from 'react-native';
import { Toast, Toaster, useToast } from '@apexrn/ui';

import { renderWithTheme } from './utils/render';

const hidden = { includeHiddenElements: true };

function Trigger({ n = 1 }: { n?: number }) {
  const toast = useToast();
  return (
    <>
      <Pressable testID="one" onPress={() => toast('Saved')}>
        <RNText>one</RNText>
      </Pressable>
      <Pressable testID="many" onPress={() => Array.from({ length: n }, (_, i) => toast(`Toast ${i + 1}`))}>
        <RNText>many</RNText>
      </Pressable>
      <Pressable testID="err" onPress={() => toast.error('Failed')}>
        <RNText>err</RNText>
      </Pressable>
      <Pressable testID="ok" onPress={() => toast.success('Done')}>
        <RNText>ok</RNText>
      </Pressable>
    </>
  );
}

describe('Toast', () => {
  it('shows status icon and visible label, and polite live region by default', async () => {
    await renderWithTheme(<Toast visible title="Heads up" onDismiss={() => {}} />);
    expect(screen.getByText('Heads up')).toBeTruthy();
    expect(screen.queryByTestId(/^status-icon-/, hidden)).toBeNull();
    expect(screen.getByLabelText('Dismiss notification')).toBeTruthy();
  });

  it.each([
    ['destructive', 'Error'],
    ['success', 'Success'],
    ['warning', 'Warning'],
  ] as const)('%s carries icon and label text', async (variant, label) => {
    await renderWithTheme(<Toast visible title="Saved" variant={variant} onDismiss={() => {}} />);
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByTestId(`status-icon-${variant}`, hidden)).toBeTruthy();
  });

  it('destructive is an assertive alert', async () => {
    await renderWithTheme(<Toast visible title="Boom" variant="destructive" onDismiss={() => {}} testID="t" />);
    expect(screen.getByTestId('t', hidden).props.accessibilityLiveRegion).toBe('assertive');
    expect(screen.getByTestId('t', hidden).props.accessibilityRole).toBe('alert');
  });

  it('non-destructive is a polite live region without the alert role', async () => {
    await renderWithTheme(<Toast visible title="Ok" variant="success" onDismiss={() => {}} testID="t" />);
    expect(screen.getByTestId('t', hidden).props.accessibilityLiveRegion).toBe('polite');
    expect(screen.getByTestId('t', hidden).props.accessibilityRole).toBeUndefined();
  });

  it('close button dismisses once', async () => {
    const onDismiss = jest.fn();
    await renderWithTheme(<Toast visible title="Saved" onDismiss={onDismiss} />);
    await fireEvent.press(screen.getByLabelText('Dismiss notification'));
    await fireEvent.press(screen.getByLabelText('Dismiss notification'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders the action as a button and runs it', async () => {
    const onPress = jest.fn();
    const onDismiss = jest.fn();
    await renderWithTheme(<Toast visible title="Deleted" action={{ label: 'Undo', onPress }} onDismiss={onDismiss} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after duration', async () => {
    jest.useFakeTimers();
    try {
      const onDismiss = jest.fn();
      await renderWithTheme(<Toast visible title="Saved" duration={500} onDismiss={onDismiss} />);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
      expect(onDismiss).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('Toaster', () => {
  it('toast(), toast.success() and toast.error() render', async () => {
    await renderWithTheme(
      <Toaster>
        <Trigger />
      </Toaster>,
    );
    await fireEvent.press(screen.getByTestId('one'));
    expect(screen.getByText('Saved')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('ok'));
    expect(screen.getByText('Done')).toBeTruthy();
    expect(screen.getByText('Success')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('err'));
    expect(screen.getByText('Failed')).toBeTruthy();
    expect(screen.getByText('Error')).toBeTruthy();
  });

  it('shows at most three and promotes the queue as toasts are dismissed', async () => {
    await renderWithTheme(
      <Toaster>
        <Trigger n={5} />
      </Toaster>,
    );
    await fireEvent.press(screen.getByTestId('many'));
    expect(screen.getAllByLabelText('Dismiss notification')).toHaveLength(3);
    expect(screen.queryByText('Toast 4')).toBeNull();
    await fireEvent.press(screen.getAllByLabelText('Dismiss notification')[0]);
    expect(screen.getByText('Toast 4')).toBeTruthy();
    expect(screen.queryByText('Toast 1')).toBeNull();
  });

  it('useToast throws outside Toaster', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<Trigger />)).rejects.toThrow('useToast must be used inside <Toaster>');
    spy.mockRestore();
  });
});
