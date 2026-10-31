import { fireEvent, screen } from '@testing-library/react-native';
import { Alert, AlertDescription, AlertTitle, Button } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

const hidden = { includeHiddenElements: true };
const variants = ['default', 'destructive', 'warning', 'success'] as const;

describe('Alert', () => {
  it('renders every variant in all four palettes', async () => {
    for (const variant of variants) {
      const results = await renderInPalettes(<Alert variant={variant} title="Heads up" description="Saved to this device." />);
      expect(results).toHaveLength(4);
      for (const { view } of results) {
        expect(view.getByText('Heads up', hidden)).toBeTruthy();
        expect(view.getByText('Saved to this device.', hidden)).toBeTruthy();
      }
    }
  }, 60000);

  it('renders the compound parts in all four palettes', async () => {
    const results = await renderInPalettes(
      <Alert variant="warning">
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>92% of your storage is used.</AlertDescription>
      </Alert>,
    );
    for (const { view } of results) {
      expect(view.getByText('Storage almost full', hidden)).toBeTruthy();
      expect(view.getByText('92% of your storage is used.', hidden)).toBeTruthy();
    }
  });

  it('announces only destructive and warning as an alert', async () => {
    for (const variant of variants) {
      await renderWithTheme(<Alert variant={variant} title="Heads up" testID="alert" />);
      const role = screen.getByTestId('alert', hidden).props.accessibilityRole;
      if (variant === 'destructive' || variant === 'warning') expect(role).toBe('alert');
      else expect(role).not.toBe('alert');
    }
  });

  it('exposes the severity word on the status icon', async () => {
    const words = { destructive: 'Error', warning: 'Warning', success: 'Success' } as const;
    for (const variant of Object.keys(words) as (keyof typeof words)[]) {
      await renderWithTheme(
        <Alert variant={variant}>
          <AlertTitle>Payment failed</AlertTitle>
        </Alert>,
      );
      const icon = screen.getByLabelText(words[variant]);
      expect(icon.props.accessible).toBe(true);
      expect(icon.props.testID).toBe(`status-icon-${variant}`);
    }
  });

  it('reads a string title as written', async () => {
    await renderWithTheme(<Alert variant="destructive" title="Payment failed" />);
    expect(screen.getByText('Payment failed').props.accessibilityLabel).toBeUndefined();
  });

  it('keeps a consumer title label', async () => {
    await renderWithTheme(
      <Alert variant="destructive">
        <AlertTitle accessibilityLabel="Card declined">Payment failed</AlertTitle>
      </Alert>,
    );
    expect(screen.getByLabelText('Card declined')).toBeTruthy();
  });

  it('has no severity node for the default variant or a custom icon', async () => {
    await renderWithTheme(<Alert title="Heads up" />);
    expect(screen.queryByLabelText(/^(Error|Warning|Success)$/, hidden)).toBeNull();
    await renderWithTheme(<Alert variant="destructive" title="Heads up" icon={<></>} />);
    expect(screen.queryByLabelText(/^(Error|Warning|Success)$/, hidden)).toBeNull();
  });

  it('renders the action slot and keeps it pressable', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <Alert variant="destructive" title="Upload failed" action={<Button title="Retry" onPress={onPress} testID="retry" />} />,
    );
    fireEvent.press(screen.getByTestId('retry'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('clamps a long title to two lines and lets the description wrap', async () => {
    await renderWithTheme(<Alert title="A long title" description="A long description" />);
    expect(screen.getByText('A long title', hidden).props.numberOfLines).toBe(2);
    expect(screen.getByText('A long description', hidden).props.numberOfLines).toBeUndefined();
  });

  it('shows a custom icon instead of the status icon', async () => {
    await renderWithTheme(<Alert title="Heads up" icon={<></>} />);
    expect(screen.queryAllByTestId(/^status-icon-/, hidden)).toHaveLength(0);
  });

  it('throws when its parts are used outside Alert', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<AlertTitle>Orphan</AlertTitle>)).rejects.toThrow('AlertTitle must be used within Alert');
    await expect(renderWithTheme(<AlertDescription>Orphan</AlertDescription>)).rejects.toThrow(
      'AlertDescription must be used within Alert',
    );
    error.mockRestore();
  });
});
