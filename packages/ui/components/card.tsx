import { createContext, useContext, type ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native';

import { borderWidths, opacity, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Variant = 'default' | 'primary' | 'accent';

export interface CardProps {
  /** Card content. */
  children: ReactNode;
  /** Visual variant. @default 'default' */
  variant?: Variant;
  /** If provided, the card becomes pressable with the press animation. */
  onPress?: () => void;
  /** Container style override. */
  style?: StyleProp<ViewStyle>;
  /** Accessibility label (for pressable cards). */
  accessibilityLabel?: string;
  /** Accessibility hint (for pressable cards). */
  accessibilityHint?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface CardFooterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface CardTextProps extends Omit<TextProps, 'style'> {
  /** `title` is heavy uppercase; `body` is plain; `muted` is body at reduced emphasis. @default 'body' */
  tone?: 'title' | 'body' | 'muted';
  style?: StyleProp<TextStyle>;
}

// React Native <Text> does not inherit colour, so a card's variant could never
// reach its children. Card publishes its foreground here and CardText reads it,
// which keeps text legible on every variant in both themes.
const CardForegroundContext = createContext<string | null>(null);

/** Text tinted with the enclosing Card's foreground colour. */
export function CardText({ tone = 'body', style, ...rest }: CardTextProps) {
  const fg = useContext(CardForegroundContext);
  if (fg === null) throw new Error('CardText must be used inside <Card>.');
  return (
    <Text
      {...rest}
      style={[
        // Read at render: typography scales with the window, so it can't live in StyleSheet.create.
        tone === 'title'
          ? { fontSize: typography.lg, fontWeight: '900', textTransform: 'uppercase' }
          : { fontSize: typography.sm },
        { color: fg },
        // Fade instead of switching to mutedForeground: that token is tuned for
        // the default background and can fail contrast on primary/accent fills.
        tone === 'muted' && { opacity: opacity.subtle },
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// Header/footer bleed out of the card's padding (negative margins) so their
// dividers run edge to edge instead of floating inside the content inset.
export function CardHeader({ children, style }: CardHeaderProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.header,
        {
          marginHorizontal: -spacing.lg,
          marginTop: -spacing.lg,
          marginBottom: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.sm,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardFooter({ children, style }: CardFooterProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.footer,
        {
          marginHorizontal: -spacing.lg,
          marginBottom: -spacing.lg,
          marginTop: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
          borderTopColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Card({
  children,
  variant = 'default',
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { colors } = useTheme();

  const VARIANTS: Record<Variant, { bg: string; fg: string }> = {
    default: {
      bg: colors.background,
      fg: colors.foreground,
    },
    primary: {
      bg: colors.primary,
      fg: colors.primaryForeground,
    },
    accent: {
      bg: colors.accent,
      fg: colors.accentForeground,
    },
  };

  const v = VARIANTS[variant];
  const isPressable = !!onPress;

  return (
    <BrutalSurface
      style={style}
      surfaceStyle={{ backgroundColor: v.bg }}
      offset={SHADOW_OFFSET}
      pressable={isPressable}
      onPress={onPress}
      accessibilityRole={isPressable ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={isPressable ? accessibilityHint : undefined}
    >
      <CardForegroundContext.Provider value={v.fg}>
        <View style={{ padding: spacing.lg }}>{children}</View>
      </CardForegroundContext.Provider>
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: borderWidths.standard,
  },
  footer: {
    borderTopWidth: borderWidths.standard,
  },
});

export default Card;
