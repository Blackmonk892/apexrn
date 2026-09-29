import type { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AlertProps extends ViewProps {
  /**
   * The visual severity of the alert.
   * @default 'default'
   */
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  /**
   * The main heading text for the alert.
   */
  title: string;
  /**
   * Optional secondary descriptive text.
   */
  description?: string;
  /**
   * Replaces the built-in severity glyph. Decorative — hidden from
   * screen readers (the title/description carry the announcement).
   */
  icon?: ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;
const GLYPH_SIZE = 22;

// Severity is never colour-only: each variant has its own glyph and spoken prefix.
const SEVERITY = {
  default: { glyph: 'i', spoken: '' },
  destructive: { glyph: '✕', spoken: 'Error. ' },
  warning: { glyph: '!', spoken: 'Warning. ' },
  success: { glyph: '✓', spoken: 'Success. ' },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Alert({
  variant = 'default',
  title,
  description,
  icon,
  style,
  ...props
}: AlertProps) {
  const { colors } = useTheme();

  // Same recipe as Toast and Badge: status variants are a flat fill with its
  // matching foreground; default stays the plain surface. No side stripe, so
  // the box reads as one block like Button and Card.
  const tones = {
    default: { bg: colors.background, fg: colors.foreground },
    destructive: { bg: colors.destructive, fg: colors.destructiveForeground },
    warning: { bg: colors.warning, fg: colors.warningForeground },
    success: { bg: colors.success, fg: colors.successForeground },
  };
  const { bg, fg } = tones[variant];
  const severity = SEVERITY[variant];
  const announcement = `${severity.spoken}${description ? `${title}. ${description}` : title}`;

  return (
    <BrutalSurface
      style={cn(styles.container, style)}
      surfaceStyle={[
        styles.surface,
        { padding: spacing.md, backgroundColor: bg, borderColor: colors.border },
      ]}
      offset={SHADOW_OFFSET}
      borderWidth="heavy"
      pressable={false}
      accessibilityRole="alert"
      accessibilityLabel={announcement}
      {...props}
    >
      <View
        style={[styles.iconContainer, { marginRight: spacing.sm }]}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {icon ?? (
          <View style={[styles.glyph, { backgroundColor: fg }]}>
            <Text style={[styles.glyphText, { color: bg }]}>{severity.glyph}</Text>
          </View>
        )}
      </View>

      <View style={[styles.contentContainer, { gap: spacing.xs }]}>
        <Text
          style={[styles.title, { fontSize: typography.sm, color: fg }]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Text>
        {description ? (
          <Text
            // Full foreground, not mutedForeground or a fade: both drop below 4.5:1 on the coloured fills.
            style={[styles.description, { fontSize: typography.sm, color: fg }]}
            maxFontSizeMultiplier={1.3}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 0,
  },
  iconContainer: {
    alignSelf: 'flex-start',
  },
  glyph: {
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {},
});

export default Alert;
