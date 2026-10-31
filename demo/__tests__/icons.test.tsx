import type { ReactTestRendererJSON } from 'react-test-renderer';
import { render } from '@testing-library/react-native';
import {
  BackIcon,
  BellIcon,
  CheckIcon,
  CloseIcon,
  HomeIcon,
  InfoIcon,
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
};

describe('icons', () => {
  it.each(Object.entries(icons))('%s sits on the 2px DESIGN grid', async (_name, Icon) => {
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

  it.each(Object.entries(icons))('%s draws a circle only where the vocabulary allows', async (name, Icon) => {
    const view = await render(<Icon color="#000" />);
    const circles = countType(view.toJSON(), 'RNSVGCircle');
    expect(circles).toBe(name === 'SearchIcon' || name === 'UserIcon' ? 1 : 0);
  });
});

function countType(node: ReactTestRendererJSON | ReactTestRendererJSON[] | null, type: string): number {
  if (!node) return 0;
  if (Array.isArray(node)) return node.reduce((n, c) => n + countType(c, type), 0);
  const kids = (node.children ?? []).filter((c): c is ReactTestRendererJSON => typeof c !== 'string');
  return (node.type === type ? 1 : 0) + countType(kids, type);
}
