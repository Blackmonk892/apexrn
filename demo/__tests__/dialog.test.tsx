import { Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Sample(props: Partial<React.ComponentProps<typeof Dialog>>) {
  return (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <Button title="Open" testID="open" />
      </DialogTrigger>
      <DialogContent testID="content">
        <DialogHeader>
          <DialogTitle>Delete file</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button title="Cancel" testID="cancel" />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('renders open in all four palettes with a header title', async () => {
    const results = await renderInPalettes(<Sample defaultOpen />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('header', { name: 'Delete file' })).toBeTruthy();
      expect(view.getByText('This cannot be undone.')).toBeTruthy();
    }
  });

  it('stays closed until the trigger is pressed (uncontrolled)', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Sample onOpenChange={onOpenChange} />);
    expect(screen.queryByText('Delete file')).toBeNull();
    await fireEvent.press(screen.getByTestId('open'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Delete file')).toBeTruthy();
  });

  it('closes from DialogClose', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Sample defaultOpen onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByTestId('cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('works controlled: display follows open, not presses', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Sample open={false} onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByTestId('open'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText('Delete file')).toBeNull();
  });

  it('scrim press and the Modal back request both ask to close', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Sample open onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    onOpenChange.mockClear();
    let node = screen.getByText('Delete file').parent;
    while (node && !node.props.onRequestClose) node = node.parent;
    expect(node).toBeTruthy();
    node!.props.onRequestClose();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('onInteractOutside replaces the scrim close', async () => {
    const onOpenChange = jest.fn();
    const onInteractOutside = jest.fn();
    await renderWithTheme(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent onInteractOutside={onInteractOutside}>
          <DialogTitle>Locked</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    await fireEvent.press(screen.getByLabelText('Close dialog', { hidden: true }));
    expect(onInteractOutside).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('trigger without asChild renders a button and chains onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <Dialog>
        <DialogTrigger onPress={onPress} testID="plain"><Text>Open plain</Text></DialogTrigger>
        <DialogContent><DialogTitle>Plain</DialogTitle></DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole('button', { name: 'Open plain' })).toBeTruthy();
    await fireEvent.press(screen.getByTestId('plain'));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByText('Plain')).toBeTruthy();
  });

  it('compound parts throw outside Dialog', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<DialogTrigger><Text>x</Text></DialogTrigger>)).rejects.toThrow(
      'DialogTrigger must be used within Dialog',
    );
    await expect(renderWithTheme(<DialogContent />)).rejects.toThrow('DialogContent must be used within Dialog');
    await expect(renderWithTheme(<DialogTitle>t</DialogTitle>)).rejects.toThrow('DialogTitle must be used within Dialog');
    await expect(renderWithTheme(<DialogClose><Text>x</Text></DialogClose>)).rejects.toThrow(
      'DialogClose must be used within Dialog',
    );
    spy.mockRestore();
  });
});
