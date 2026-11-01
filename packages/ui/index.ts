// Theme & Provider
export { ApexRNProvider, useTheme, type ThemeMode, type ThemeContextType } from './lib/theme';
export { presets, spacing, typography, borderWidths, focusRing, fontFamilies, textStyles, touchTarget, controlHeight, opacity, type ColorScheme, type PresetName, type TextVariant, type Preset, type Elevation } from './lib/colors';
export { motion, useMotion } from './lib/motion';
export { variants, type VariantProps, type VariantsConfig, type VariantSelection } from './lib/variants';
export { scale, verticalScale, moderateScale, normalize, screenWidth, screenHeight } from './lib/metrics';
export { usePressPhysics, type UsePressPhysicsOptions } from './lib/use-press-physics';
export { LoadingBlocks } from './lib/loading-blocks';
export { cn } from './lib/utils';
export { MenuIcon, BackIcon, CloseIcon, SearchIcon, CheckIcon, HomeIcon, BellIcon, UserIcon, WarningIcon, InfoIcon, PlusIcon, ChevronDownIcon, type IconProps } from './lib/icons';

// Components
export * from './components';
