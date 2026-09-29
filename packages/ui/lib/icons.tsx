import type { ReactNode } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

// Square-capped, heavy-stroked glyphs so icons match the border weight of the
// blocks that hold them. Decorative: the pressable that wraps an icon owns the
// accessibility label, so these are hidden from assistive tech.
export interface IconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

function Icon({ size = 24, color, strokeWidth = 3, children }: IconProps & { children: ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </Svg>
  );
}

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M3 6H21M3 12H21M3 18H21" />
  </Icon>
);

export const BackIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M20 12H4M11 5L4 12L11 19" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M5 5L19 19M19 5L5 19" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <Rect x="4" y="4" width="11" height="11" />
    <Path d="M15 15L21 21" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M4 12L10 18L20 6" />
  </Icon>
);

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M3 11L12 3L21 11M5 9.5V21H19V9.5" />
  </Icon>
);

export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M5 18V10A7 7 0 0 1 19 10V18M3 18H21M10 21H14" />
  </Icon>
);

export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <Rect x="8" y="3" width="8" height="8" />
    <Path d="M4 21V16H20V21" />
  </Icon>
);
