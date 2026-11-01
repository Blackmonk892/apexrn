import { Text, View } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@apexrn/ui';

import { renderInPalettes, renderWithTheme } from './utils/render';

// The jest host View never answers measureInWindow, so the trigger would never open.
beforeEach(() => {
  jest.spyOn(View.prototype as unknown as { measureInWindow: () => void }, 'measureInWindow').mockImplementation(function (
    this: unknown,
    ...args: unknown[]
  ) {
    (args[0] as (x: number, y: number, w: number, h: number) => void)(20, 100, 120, 48);
  } as never);
});

afterEach(() => jest.restoreAllMocks());

function Sample(props: Partial<React.ComponentProps<typeof DropdownMenu>> & { onSelect?: () => void }) {
  const { onSelect, ...rest } = props;
  return (
    <DropdownMenu {...rest}>
      <DropdownMenuTrigger asChild>
        <Button title="Actions" testID="open" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem label="Edit" onSelect={onSelect} testID="edit" />
        <DropdownMenuItem label="Export" disabled onSelect={onSelect} testID="export" />
        <DropdownMenuItem label="Delete" destructive onSelect={onSelect} testID="delete" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('renders open in all four palettes with menuitem roles', async () => {
    const results = await renderInPalettes(<Sample defaultOpen />);
    expect(results).toHaveLength(4);
    for (const { view } of results) {
      expect(view.getByRole('menuitem', { name: 'Edit' })).toBeTruthy();
      expect(view.getAllByRole('menuitem')).toHaveLength(3);
    }
  });

  it('opens from the trigger and closes after an item select (uncontrolled)', async () => {
    const onOpenChange = jest.fn();
    const onSelect = jest.fn();
    await renderWithTheme(<Sample onOpenChange={onOpenChange} onSelect={onSelect} />);
    expect(screen.queryByText('Edit')).toBeNull();
    await fireEvent.press(screen.getByTestId('open'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await fireEvent.press(screen.getByTestId('edit'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('controlled: display follows open, not presses', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Sample open={false} onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByTestId('open'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText('Edit')).toBeNull();
  });

  it('disabled item fires nothing and does not close', async () => {
    const onOpenChange = jest.fn();
    const onSelect = jest.fn();
    await renderWithTheme(<Sample defaultOpen onOpenChange={onOpenChange} onSelect={onSelect} />);
    await fireEvent.press(screen.getByTestId('export'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('menuitem', { name: 'Export' }).props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('destructive item shows its label and a status icon', async () => {
    await renderWithTheme(<Sample defaultOpen />);
    expect(screen.getByText('Delete')).toBeTruthy();
    type Json = { type: string; props: { testID?: string }; children: Json[] | null };
    const find = (n: Json, id: string): Json | null =>
      n.props?.testID === id ? n : (n.children ?? []).map((c) => (typeof c === 'string' ? null : find(c, id))).find(Boolean) ?? null;
    const hasSvg = (n: Json | null): boolean =>
      !!n && (/svg/i.test(n.type) || (n.children ?? []).some((c) => typeof c !== 'string' && hasSvg(c)));
    const tree = [screen.toJSON()].flat() as Json[];
    const item = (id: string) => tree.map((t) => find(t, id)).find(Boolean) ?? null;
    expect(hasSvg(item('delete'))).toBe(true);
    expect(hasSvg(item('edit'))).toBe(false);
  });

  it('outside press and the Modal back request both ask to close', async () => {
    const onOpenChange = jest.fn();
    await renderWithTheme(<Sample open onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Close menu' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    onOpenChange.mockClear();
    let node = screen.getByText('Edit').parent;
    while (node && !node.props.onRequestClose) node = node.parent;
    expect(node).toBeTruthy();
    node!.props.onRequestClose();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('compound parts throw outside DropdownMenu', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderWithTheme(<DropdownMenuTrigger><Text>x</Text></DropdownMenuTrigger>)).rejects.toThrow(
      'DropdownMenuTrigger must be used within DropdownMenu',
    );
    await expect(renderWithTheme(<DropdownMenuContent />)).rejects.toThrow('DropdownMenuContent must be used within DropdownMenu');
    await expect(renderWithTheme(<DropdownMenuItem label="x" />)).rejects.toThrow('DropdownMenuItem must be used within DropdownMenu');
    spy.mockRestore();
  });
});
