import { moderateScale, normalize } from './metrics';

export interface ColorScheme {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  warning: string;
  warningForeground: string;
  success: string;
  successForeground: string;
  border: string;
  shadow: string;
}

export const colors: { light: ColorScheme; dark: ColorScheme } = {
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
    shadow: '#FFFFFF',
  },
};

/**
 * Spacing tokens. Implemented as getters so every access reads the *current*
 * window dimensions (rotation / foldables / split-screen safe) instead of a
 * stale import-time snapshot. Access API is unchanged (`spacing.md`).
 */
export const spacing: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl', number> = {
  get xs() { return moderateScale(4); },
  get sm() { return moderateScale(8); },
  get md() { return moderateScale(12); },
  get lg() { return moderateScale(16); },
  get xl() { return moderateScale(24); },
  get '2xl'() { return moderateScale(32); },
  get '3xl'() { return moderateScale(48); },
};

/**
 * Typography tokens. Live getters for the same reason as `spacing`, plus
 * `normalize` clamps runaway growth on tablets and respects font-scale.
 */
export const typography: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl', number> = {
  get xs() { return normalize(12); },
  get sm() { return normalize(14); },
  get md() { return normalize(16); },
  get lg() { return normalize(18); },
  get xl() { return normalize(20); },
  get '2xl'() { return normalize(24); },
  get '3xl'() { return normalize(32); },
  get '4xl'() { return normalize(40); },
};

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