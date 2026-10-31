// Theme & Provider
export { ApexRNProvider, useTheme, type ThemeMode, type ThemeContextType } from './lib/theme';
export { presets, spacing, typography, borderWidths, focusRing, touchTarget, controlHeight, opacity, type ColorScheme, type PresetName, type Preset, type Elevation } from './lib/colors';
export { motion, useMotion } from './lib/motion';
export { variants, type VariantProps, type VariantsConfig, type VariantSelection } from './lib/variants';
export { scale, verticalScale, moderateScale, normalize, screenWidth, screenHeight } from './lib/metrics';
export { usePressPhysics, type UsePressPhysicsOptions, type PressPhysicsConfig } from './lib/use-press-physics';
export { cn } from './lib/utils';
export { MenuIcon, BackIcon, CloseIcon, SearchIcon, CheckIcon, HomeIcon, BellIcon, UserIcon, type IconProps } from './lib/icons';

// Components
export * from './components';
