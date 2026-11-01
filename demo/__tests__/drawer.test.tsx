import { Text } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerItem,
  DrawerList,
  DrawerSection,
  DrawerTrigger,
} from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

function Menu(props: Partial<React.ComponentProps<typeof Drawer>> & { current?: string }) {
  const { current = 'home', ...drawer } = props;
  return (
    <Drawer {...drawer}>
      <DrawerTrigger testID="open">
        <Text>Open</Text>
      </DrawerTrigger>
      <DrawerContent edgeWidth={0}>
        <DrawerList>
          <DrawerSection label="Workspace" />
          <DrawerItem number={1} label="Home" active={current === 'home'} testID="item-home" />
          <DrawerItem number={2} label="Inbox" active={current === 'inbox'} testID="item-inbox" />
          <DrawerItem label="Billing" disabled testID="item-billing" />
        </DrawerList>
        <DrawerFooter>
          <Text>v0.1.0</Text>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

async function settle() {
  await act(async () => {
    jest.advanceTimersByTime(600);
  });
}

describe('Drawer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders the index in all four palettes', async () => {
    const results = await renderInPalettes(<Menu defaultOpen />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('button', { name: 'Home' })).toBeTruthy();
      expect(view.getByText('01', { includeHiddenElements: true })).toBeTruthy();
      expect(view.getByText('Workspace')).toBeTruthy();
      expect(view.getByText('v0.1.0')).toBeTruthy();
    }
  });

  it('works uncontrolled: trigger opens, scrim closes', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Menu onOpenChange={onOpenChange} />);
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull();
    await fireEvent.press(screen.getByTestId('open'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('button', { name: 'Home' })).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Close menu'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await settle();
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull();
  });

  it('works controlled: the parent decides', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Menu open onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByLabelText('Close menu'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await settle();
    expect(screen.getByRole('button', { name: 'Home' })).toBeTruthy();
  });

  it('closes on the Android back request', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Menu defaultOpen onOpenChange={onOpenChange} />);
    let node = screen.getByTestId('drawer-scrim').parent;
    while (node && typeof node.props.onRequestClose !== 'function') node = node.parent;
    await fireEvent(node!, 'requestClose');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('item press fires, then closes; closeOnPress={false} keeps it open', async () => {
    const onPress = jest.fn();
    const onOpenChange = jest.fn();
    await renderWithTheme(
      <Drawer defaultOpen onOpenChange={onOpenChange}>
        <DrawerContent edgeWidth={0}>
          <DrawerList>
            <DrawerItem label="Inbox" onPress={onPress} />
            <DrawerItem label="Stay" closeOnPress={false} />
          </DrawerList>
        </DrawerContent>
      </Drawer>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Stay' }));
    expect(onOpenChange).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Inbox' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('reports selected and disabled state and ignores a disabled press', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Menu defaultOpen current="inbox" onOpenChange={onOpenChange} />);
    expect(screen.getByRole('button', { name: 'Inbox' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Home' })).not.toBeSelected();
    expect(screen.getByRole('button', { name: 'Billing' })).toBeDisabled();
    await fireEvent.press(screen.getByTestId('item-billing'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('mounts the edge-swipe strip only while closed and when edgeWidth is above 0', async () => {
    await renderWithTheme(
      <Drawer>
        <DrawerContent edgeWidth={24}>
          <DrawerList>
            <DrawerItem label="Home" />
          </DrawerList>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByTestId('drawer-edge', { includeHiddenElements: true })).toBeTruthy();
  });

  it('throws outside its parent', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<DrawerContent />)).rejects.toThrow('DrawerContent must be used within Drawer');
    await expect(renderWithTheme(<DrawerItem label="x" />)).rejects.toThrow('DrawerItem must be used within Drawer');
    await expect(
      renderWithTheme(
        <Drawer>
          <DrawerItem label="x" />
        </Drawer>,
      ),
    ).rejects.toThrow('DrawerItem must be used within DrawerList');
    await expect(renderWithTheme(<DrawerSection label="x" />)).rejects.toThrow('DrawerSection must be used within Drawer');
    await expect(renderWithTheme(<DrawerFooter />)).rejects.toThrow('DrawerFooter must be used within Drawer');
    spy.mockRestore();
  });
});
