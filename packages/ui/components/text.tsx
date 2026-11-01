import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { textStyles, type TextVariant } from '../lib/colors';
import { useTheme } from '../lib/theme';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** `inherit` sets no colour, for text on a filled control whose parent supplies the pair. */
  tone?: 'default' | 'muted' | 'inherit';
}

export function Text({ variant = 'body', tone = 'default', style, accessibilityRole, ...props }: TextProps) {
  const { colors } = useTheme();
  const color = tone === 'muted' ? colors.mutedForeground : colors.foreground;
  return (
    <RNText
      // Large OS font sizes break fixed-height controls past 1.3x.
      maxFontSizeMultiplier={1.3}
      // Headings are announced as such so screen readers can jump between them.
      accessibilityRole={accessibilityRole ?? (variant === 'display' || variant === 'title' ? 'header' : undefined)}
      style={[textStyles[variant], tone !== 'inherit' && { color }, style]}
      {...props}
    />
  );
}

export default Text;
