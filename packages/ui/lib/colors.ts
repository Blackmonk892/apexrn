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
    border: '#FFFFFF',
    shadow: '#000000',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
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