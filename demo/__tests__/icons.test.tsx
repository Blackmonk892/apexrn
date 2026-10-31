import { render } from '@testing-library/react-native';
import {
  BackIcon,
  BellIcon,
  CheckIcon,
  CloseIcon,
  HomeIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
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
});
