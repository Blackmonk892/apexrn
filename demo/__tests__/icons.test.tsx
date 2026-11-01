import type { ReactTestRendererJSON } from 'react-test-renderer';
import { render } from '@testing-library/react-native';
import {
  BackIcon,
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  HomeIcon,
  InfoIcon,
  PlusIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  WarningIcon,
} from '@apexrn/ui';

const icons = {
  MenuIcon,
  BackIcon,
  CloseIcon,
  SearchIcon,
  CheckIcon,
  HomeIcon,
  BellIcon,
  UserIcon,
  WarningIcon,
  InfoIcon,
  PlusIcon,
  ChevronDownIcon,
};

const CIRCLES: Record<string, number> = { SearchIcon: 1, UserIcon: 1 };

describe('icons', () => {
  it.each(Object.entries(icons))('%s uses the shared 2px square-cap wrapper', async (_name, Icon) => {
    const view = await render(<Icon color="#000" />);
    expect(view.toJSON()).toMatchObject({
      type: 'RNSVGSvgView',
      props: {
        strokeWidth: 2,
        strokeLinecap: 'square',
        strokeLinejoin: 'miter',
        vbWidth: 24,
        vbHeight: 24,
        minX: 0,
        minY: 0,
        fill: 'none',
        accessible: false,
      },
    });
  });

  it.each(Object.entries(icons))('%s draws circles only where the vocabulary allows', async (name, Icon) => {
    const view = await render(<Icon color="#000" />);
    expect(collect(view.toJSON(), 'RNSVGCircle')).toHaveLength(CIRCLES[name] ?? 0);
  });

  it.each(Object.entries(icons))('%s keeps its strokes inside the 24 grid, unfilled', async (_name, Icon) => {
    const view = await render(<Icon color="#000" />);
    const root = view.toJSON();
    const nodes = collect(root, 'RNSVGPath').concat(collect(root, 'RNSVGCircle'));
    expect(nodes.length).toBeGreaterThan(0);
    // The wrapper's group sets fill none; a shape that listed fill itself would override it.
    expect(collect(root, 'RNSVGGroup').map((g) => g.props.fill)).toEqual([null]);
    for (const node of nodes) {
      expect(node.props.propList ?? []).not.toContain('fill');
      if (node.type === 'RNSVGPath') {
        for (const n of pathCoordinates(node.props.d)) {
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(23);
        }
      } else {
        for (const c of [node.props.cx, node.props.cy]) {
          expect(Number(c) - Number(node.props.r) - 1).toBeGreaterThanOrEqual(0);
          expect(Number(c) + Number(node.props.r) + 1).toBeLessThanOrEqual(24);
        }
      }
    }
  });
});

type Json = ReactTestRendererJSON;

function collect(node: Json | Json[] | null, type: string): Json[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap((c) => collect(c, type));
  const kids = (node.children ?? []).filter((c): c is Json => typeof c !== 'string');
  return (node.type === type ? [node] : []).concat(collect(kids, type));
}

// Arc radii and flags are not points, so only an arc's endpoint is a coordinate.
function pathCoordinates(d: string): number[] {
  const out: number[] = [];
  for (const [, cmd, args] of d.matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (cmd.toUpperCase() === 'A') {
      for (let i = 0; i + 6 < nums.length; i += 7) out.push(nums[i + 5], nums[i + 6]);
    } else {
      out.push(...nums);
    }
  }
  return out;
}
