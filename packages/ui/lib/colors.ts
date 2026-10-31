import { Platform, type TextStyle } from 'react-native';
import { moderateScale, normalize } from './metrics';

export type PresetName = 'neo' | 'raw';

export interface ColorScheme {
  background: string;
  foreground: string;
  surface: string;
  surfaceForeground: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  border: string;
  input: string;
  ring: string;
  shadow: string;
  /** Backdrop behind overlays. Dark in both themes: a light scrim would glow, not dim. */
  scrim: string;
}

export interface Elevation {
  flat: number;
  control: number;
  card: number;
  overlay: number;
}

export interface Preset {
  light: ColorScheme;
  dark: ColorScheme;
  elevation: Elevation;
  scrimOpacity: { light: number; dark: number };
}

const neoLight: ColorScheme = {
  background: '#FFFFFF',
  foreground: '#000000',
  surface: '#FFFFFF',
  surfaceForeground: '#000000',
  muted: '#F5F5F5',
  mutedForeground: '#6B6B6B',
  primary: '#FF5252',
  primaryForeground: '#000000',
  secondary: '#3D5AFE',
  secondaryForeground: '#FFFFFF',
  accent: '#FFD600',
  accentForeground: '#000000',
  destructive: '#D32F2F',
  destructiveForeground: '#FFFFFF',
  success: '#2E7D32',
  successForeground: '#FFFFFF',
  warning: '#F59E0B',
  warningForeground: '#000000',
  border: '#000000',
  input: '#000000',
  ring: '#3D5AFE',
  shadow: '#000000',
  scrim: '#000000',
};

const neoDark: ColorScheme = {
  background: '#1A1A1A',
  foreground: '#FFFFFF',
  surface: '#222222',
  surfaceForeground: '#FFFFFF',
  muted: '#2A2A2A',
  mutedForeground: '#9E9E9E',
  primary: '#FF6B6B',
  primaryForeground: '#000000',
  secondary: '#4D5FF5',
  secondaryForeground: '#FFFFFF',
  accent: '#FFEA00',
  accentForeground: '#000000',
  destructive: '#EF5350',
  destructiveForeground: '#000000',
  success: '#66BB6A',
  successForeground: '#000000',
  warning: '#FFB300',
  warningForeground: '#000000',
  border: '#FFFFFF',
  input: '#FFFFFF',
  ring: '#8C9EFF',
  shadow: '#5A5A5A',
  scrim: '#000000',
};

// Raw has one signal colour (red). Success and warning stay ink on paper so
// status is carried by the glyph and label, never by hue alone. The focus ring
// is ink too: red already means error, so a red ring would read as one.
const rawLight: ColorScheme = {
  background: '#F2F0EB',
  foreground: '#111111',
  surface: '#F2F0EB',
  surfaceForeground: '#111111',
  muted: '#DEDAD2',
  mutedForeground: '#5A5750',
  primary: '#111111',
  primaryForeground: '#F2F0EB',
  secondary: '#DEDAD2',
  secondaryForeground: '#111111',
  accent: '#DEDAD2',
  accentForeground: '#111111',
  destructive: '#C8102E',
  destructiveForeground: '#FFFFFF',
  success: '#DEDAD2',
  successForeground: '#111111',
  warning: '#DEDAD2',
  warningForeground: '#111111',
  border: '#111111',
  input: '#111111',
  ring: '#111111',
  shadow: '#111111',
  scrim: '#111111',
};

const rawDark: ColorScheme = {
  background: '#111111',
  foreground: '#F2F0EB',
  surface: '#111111',
  surfaceForeground: '#F2F0EB',
  muted: '#2B2925',
  mutedForeground: '#A8A399',
  primary: '#F2F0EB',
  primaryForeground: '#111111',
  secondary: '#2B2925',
  secondaryForeground: '#F2F0EB',
  accent: '#2B2925',
  accentForeground: '#F2F0EB',
  destructive: '#FF5A5F',
  destructiveForeground: '#111111',
  success: '#2B2925',
  successForeground: '#F2F0EB',
  warning: '#2B2925',
  warningForeground: '#F2F0EB',
  border: '#F2F0EB',
  input: '#F2F0EB',
  ring: '#F2F0EB',
  shadow: '#5A5750',
  scrim: '#111111',
};

export const presets: Record<PresetName, Preset> = {
  neo: {
    light: neoLight,
    dark: neoDark,
    elevation: { flat: 0, control: 2, card: 4, overlay: 6 },
    scrimOpacity: { light: 0.5, dark: 0.7 },
  },
  // Every raised surface sits the same 2px off its shadow, like a misregistered print.
  raw: {
    light: rawLight,
    dark: rawDark,
    elevation: { flat: 0, control: 2, card: 2, overlay: 2 },
    scrimOpacity: { light: 0.5, dark: 0.7 },
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

export type TextVariant = 'display' | 'title' | 'body' | 'label' | 'mono';

// Firefox ignores the bare ui-monospace keyword and would fall back to a serif, so web gets a stack.
export const fontFamilies = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, Consolas, monospace' }),
};

// Sizes are fixed numbers: OS font scaling is applied by Text, capped by maxFontSizeMultiplier.
export const textStyles: Record<TextVariant, TextStyle> = {
  display: { fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -0.5 },
  title: { fontSize: 20, lineHeight: 24, fontWeight: '800' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontFamily: fontFamilies.mono },
  mono: { fontSize: 14, lineHeight: 20, fontWeight: '500', fontVariant: ['tabular-nums'], fontFamily: fontFamilies.mono },
};

export const borderWidths = {
  control: 2,
  container: 3,
} as const;

export const focusRing = { width: 2, offset: 2 } as const;

/** Minimum comfortable touch target: 44pt (iOS HIG) / 48dp (Material). */
export const touchTarget = Platform.OS === 'android' ? 48 : 44;

/** Control heights shared by pressable controls so rows of mixed controls align. */
export const controlHeight = {
  sm: 40,
  md: 48,
  lg: 56,
} as const;

export const opacity = {
  /** Non-interactive content that must still be legible. */
  disabled: 0.6,
  /** Placeholder / secondary chrome. */
  subtle: 0.75,
} as const;
