import { Text } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

type ConvenienceProps = Omit<React.ComponentProps<typeof AlertDialog>, 'title' | 'children'> & {
  onAction?: () => void;
};

function Convenience(props: ConvenienceProps) {
  return (
    <AlertDialog title="Delete file" description="This cannot be undone." actionText="Delete" {...props}>
      <Button title="Open" testID="open" />
    </AlertDialog>
  );
}

async function backRequest() {
  let node = screen.getByText('Delete file').parent;
  while (node && !node.props.onRequestClose) node = node.parent;
  expect(node).toBeTruthy();
  await act(async () => {
    node!.props.onRequestClose();
  });
}

describe('AlertDialog', () => {
  it('renders open in all four palettes with a status icon on a destructive title', async () => {
    const results = await renderInPalettes(<Convenience defaultOpen />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('header', { name: 'Delete file' })).toBeTruthy();
      expect(view.getByTestId('status-icon-destructive')).toBeTruthy();
    }
  });

  it('non-destructive drops the title icon', async () => {
    await renderWithTheme(<Convenience defaultOpen destructive={false} />);
    expect(screen.queryByTestId('status-icon-destructive')).toBeNull();
  });

  it('opens from the trigger (uncontrolled) and the action confirms then closes', async () => {
    const onAction = jest.fn();
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    await renderWithTheme(<Convenience onAction={onAction} onCancel={onCancel} onOpenChange={onOpenChange} />);
    expect(screen.queryByText('Delete file')).toBeNull();
    await fireEvent.press(screen.getByTestId('open'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('cancel calls onCancel once and closes', async () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    await renderWithTheme(<Convenience defaultOpen onCancel={onCancel} onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('controlled: display follows open, not presses', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Convenience open onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByText('Delete file')).toBeTruthy();
  });

  it('scrim press does nothing; back is the cancel path', async () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    await renderWithTheme(<Convenience open onCancel={onCancel} onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByLabelText('Close dialog', { hidden: true }));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    await backRequest();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('a handled close does not leak into the next back-press', async () => {
    const onCancel = jest.fn();
    await renderWithTheme(<Convenience onCancel={onCancel} />);
    await fireEvent.press(screen.getByTestId('open'));
    await fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    expect(onCancel).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('open'));
    await backRequest();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('compound parts compose; the action is primary unless the dialog is destructive', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <AlertDialog defaultOpen>
        <AlertDialogTrigger asChild>
          <Button title="Open" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file</AlertDialogTitle>
            <AlertDialogDescription>Gone for good.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel title="Keep" />
            <AlertDialogAction title="Remove" onPress={onPress} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.queryByTestId('status-icon-destructive')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Remove' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('compound parts throw outside AlertDialog', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<AlertDialogTrigger><Text>x</Text></AlertDialogTrigger>)).rejects.toThrow(
      'AlertDialogTrigger must be used within AlertDialog',
    );
    await expect(renderWithTheme(<AlertDialogContent />)).rejects.toThrow('AlertDialogContent must be used within AlertDialog');
    await expect(renderWithTheme(<AlertDialogTitle>t</AlertDialogTitle>)).rejects.toThrow(
      'AlertDialogTitle must be used within AlertDialog',
    );
    await expect(renderWithTheme(<AlertDialogCancel title="c" />)).rejects.toThrow(
      'AlertDialogCancel must be used within AlertDialog',
    );
    await expect(renderWithTheme(<AlertDialogAction title="a" />)).rejects.toThrow(
      'AlertDialogAction must be used within AlertDialog',
    );
    spy.mockRestore();
  });
});
