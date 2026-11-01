import { Text } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Panel(props: Partial<React.ComponentProps<typeof Sheet>>) {
  return (
    <Sheet {...props}>
      <SheetTrigger testID="open">
        <Text>Open</Text>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Order 4821</SheetTitle>
        </SheetHeader>
        <SheetFooter>
          <SheetClose testID="close">
            <Text>Done</Text>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

async function settle() {
  await act(async () => {
    jest.advanceTimersByTime(600);
  });
}

describe('Sheet', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders in all four palettes', async () => {
    const results = await renderInPalettes(<Panel defaultOpen />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('header', { name: 'Order 4821' })).toBeTruthy();
      expect(view.getByText('Done')).toBeTruthy();
    }
  });

  it('works uncontrolled: trigger opens, SheetClose closes', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Panel onOpenChange={onOpenChange} />);
    expect(screen.queryByText('Order 4821')).toBeNull();
    await fireEvent.press(screen.getByTestId('open'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByText('Order 4821')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('close'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await settle();
    expect(screen.queryByText('Order 4821')).toBeNull();
  });

  it('scrim press closes', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Panel defaultOpen onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByLabelText('Close sheet'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('works controlled: the parent decides', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Panel open onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByTestId('close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await settle();
    expect(screen.getByText('Order 4821')).toBeTruthy();
  });

  it('closes on the Android back request', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Panel defaultOpen onOpenChange={onOpenChange} />);
    let node = screen.getByTestId('sheet-scrim').parent;
    while (node && typeof node.props.onRequestClose !== 'function') node = node.parent;
    await fireEvent(node!, 'requestClose');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('asChild clones the single child and keeps its own onPress', async () => {
    const own = jest.fn();
    await renderWithTheme(
      <Sheet>
        <SheetTrigger asChild>
          <Text testID="child" onPress={own} accessibilityRole="button">
            Open
          </Text>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Hello</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    await fireEvent.press(screen.getByTestId('child'));
    expect(own).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('still accepts a render-function child', async () => {
    await renderWithTheme(
      <Sheet open onOpenChange={() => {}}>
        {({ open }) => (
          <SheetContent>
            <Text>{`open: ${String(open)}`}</Text>
          </SheetContent>
        )}
      </Sheet>,
    );
    expect(screen.getByText('open: true')).toBeTruthy();
  });

  it('throws outside its parent', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<SheetContent />)).rejects.toThrow('SheetContent must be used within Sheet');
    await expect(renderWithTheme(<SheetTrigger />)).rejects.toThrow('SheetTrigger must be used within Sheet');
    await expect(renderWithTheme(<SheetClose />)).rejects.toThrow('SheetClose must be used within Sheet');
    await expect(renderWithTheme(<SheetHeader />)).rejects.toThrow('SheetHeader must be used within Sheet');
    await expect(renderWithTheme(<SheetTitle />)).rejects.toThrow('SheetTitle must be used within Sheet');
    await expect(renderWithTheme(<SheetFooter />)).rejects.toThrow('SheetFooter must be used within Sheet');
    spy.mockRestore();
  });
});
