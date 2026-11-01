import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ApexRNProvider, Dialog, DialogContent, DialogTitle, FAB } from '@apexrn/ui';

type Node = { props?: { style?: unknown }; children?: unknown } | string;

// DESIGN forbids soft shadows; on Android any non-zero `elevation` on a filled view draws one.
function elevations(node: Node | Node[] | null, found: number[] = []): number[] {
  if (!node) return found;
  if (Array.isArray(node)) {
    node.forEach((n) => elevations(n, found));
    return found;
  }
  if (typeof node === 'string') return found;
  const flat = StyleSheet.flatten(node.props?.style as never) as { elevation?: number } | undefined;
  if (flat?.elevation) found.push(flat.elevation);
  elevations(node.children as Node[] | null, found);
  return found;
}

describe('no native elevation', () => {
  it('FAB and an open Dialog set no Android elevation', async () => {
    const view = await render(
      <ApexRNProvider defaultMode="light">
        <FAB accessibilityLabel="Add" label="Add" />
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <Text>Body</Text>
          </DialogContent>
        </Dialog>
      </ApexRNProvider>,
    );
    expect(elevations(view.toJSON() as Node | Node[] | null)).toEqual([]);
  });
});
