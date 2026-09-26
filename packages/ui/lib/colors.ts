import { moderateScale } from './metrics';
import { normalize } from './metrics';

export const colors = {
  light: {
    background: '#FFFFFF',
    foreground: '#000000',
    primary: '#FF5252',
    primaryForeground: '#FFFFFF',
    secondary: '#3D5AFE',
    secondaryForeground: '#FFFFFF',
    accent: '#FFD600',
    accentForeground: '#000000',
    muted: '#F5F5F5',
    mutedForeground: '#757575',
    destructive: '#D32F2F',
    destructiveForeground: '#FFFFFF',
    warning: '#F59E0B',
    warningForeground: '#000000',
    success: '#2E7D32',
    successForeground: '#FFFFFF',
    border: '#000000',
    shadow: '#000000',
  },
  dark: {
    background: '#1A1A1A',
    foreground: '#FFFFFF',
    primary: '#FF6B6B',
    primaryForeground: '#FFFFFF',
    secondary: '#536DFE',
    secondaryForeground: '#FFFFFF',
    accent: '#FFEA00',
    accentForeground: '#000000',
    muted: '#2A2A2A',
    mutedForeground: '#9E9E9E',
    destructive: '#EF5350',
    destructiveForeground: '#FFFFFF',
    warning: '#FFB300',
    warningForeground: '#000000',
    success: '#66BB6A',
    successForeground: '#000000',
    border: '#FFFFFF',
    shadow: '#000000',
  },
} as const;

export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  '2xl': moderateScale(32),
  '3xl': moderateScale(48),
} as const;

export const typography = {
  xs: normalize(12),
  sm: normalize(14),
  md: normalize(16),
  lg: normalize(18),
  xl: normalize(20),
  '2xl': normalize(24),
  '3xl': normalize(32),
  '4xl': normalize(40),
} as const;

export const borderWidths = {
  standard: 2,
  heavy: 3,
  extraHeavy: 4,
} as const;

export const shadowOffset = {
  subtle: { width: 2, height: 2 },
  standard: { width: 4, height: 4 },
  elevated: { width: 6, height: 6 },
} as const;

export type ColorScheme = typeof colors.light;