import type { ReactNode } from 'react';
import {
  type GestureResponderEvent,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from 'react-native';

import { borderWidths, spacing, touchTarget, typography } from '../lib/colors';
import { BackIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Variant = 'default' | 'primary' | 'accent' | 'inverse';

export interface AppBarProps extends ViewProps {
  /** Screen title. Truncates to one line (two in `large`). */
  title?: string;
  /** Secondary line under the title. */
  subtitle?: string;
  /** Shows a back action in the leading slot. Ignored when `leading` is set. */
  onBack?: () => void;
  /** Accessibility label of the back action. @default 'Go back' */
  backLabel?: string;
  /** Replaces the leading slot, e.g. a menu `AppBarAction` that opens a Drawer. */
  leading?: ReactNode;
  /** Trailing slot: put `AppBarAction`s here. */
  trailing?: ReactNode;
  /** Fill of the bar. Actions always stay on the base surface so they keep contrast. @default 'default' */
  variant?: Variant;
  /**
   * `large` moves the title to its own row under the actions, for top-level
   * screens where the title is the headline.
   * @default 'compact'
   */
  size?: 'compact' | 'large';
  /**
   * Space reserved above the bar for the status bar / notch. Pass
   * `useSafeAreaInsets().top`; the library has no safe-area dependency.
   * @default 0
   */
  topInset?: number;
}

export interface AppBarActionProps {
  /**
   * Icon element, or a function receiving the contrast colour for the current
   * state (active actions invert). Decorative: `label` is what assistive tech reads.
   */
  icon: ReactNode | ((color: string) => ReactNode);
  /** Required: an icon-only control has no other name. */
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  /** Renders as the current state (inverted). */
  active?: boolean;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const ACTION_SHADOW_OFFSET = 2;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
export function AppBar({
  title,
  subtitle,
  onBack,
  backLabel = 'Go back',
  leading,
  trailing,
  variant = 'default',
  size = 'compact',
  topInset = 0,
  style,
  ...props
}: AppBarProps) {
  const { colors } = useTheme();

  // Variants as data, resolved per render so theme changes apply.
  const variants: Record<Variant, { bg: string; fg: string }> = {
    default: { bg: colors.background, fg: colors.foreground },
    primary: { bg: colors.primary, fg: colors.primaryForeground },
    accent: { bg: colors.accent, fg: colors.accentForeground },
    inverse: { bg: colors.foreground, fg: colors.background },
  };
  const v = variants[variant];
  const isLarge = size === 'large';

  const lead =
    leading ??
    (onBack ? (
      <AppBarAction
        label={backLabel}
        onPress={onBack}
        icon={(color) => <BackIcon size={22} color={color} />}
      />
    ) : null);

  const titleBlock = title || subtitle ? (
    <View style={isLarge ? styles.largeTitle : styles.compactTitle}>
      {title ? (
        <Text
          accessibilityRole="header"
          numberOfLines={isLarge ? 2 : 1}
          maxFontSizeMultiplier={1.3}
          style={[
            styles.title,
            {
              color: v.fg,
              fontSize: isLarge ? typography['3xl'] : typography.xl,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
          style={[styles.subtitle, { color: v.fg, fontSize: typography.xs }]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  ) : null;

  return (
    <View
      style={cn(
        styles.root,
        {
          backgroundColor: v.bg,
          borderBottomColor: colors.border,
          paddingTop: topInset + spacing.sm,
          paddingBottom: spacing.sm,
          paddingHorizontal: spacing.md,
        },
        style,
      )}
      {...props}
    >
      <View style={[styles.row, { gap: spacing.md, minHeight: touchTarget }]}>
        {lead}
        {isLarge ? <View style={styles.spacer} /> : titleBlock}
        {trailing ? <View style={[styles.trailing, { gap: spacing.sm }]}>{trailing}</View> : null}
      </View>
      {isLarge ? <View style={{ paddingTop: spacing.sm }}>{titleBlock}</View> : null}
    </View>
  );
}

export function AppBarAction({ icon, label, onPress, active = false, disabled = false }: AppBarActionProps) {
  const { colors } = useTheme();
  const fg = disabled ? colors.mutedForeground : active ? colors.background : colors.foreground;

  return (
    <BrutalSurface
      offset={ACTION_SHADOW_OFFSET}
      borderWidth="standard"
      hasShadow={!disabled}
      disabled={disabled}
      onPress={onPress}
      backgroundColor={disabled ? colors.muted : active ? colors.foreground : colors.background}
      borderColor={disabled ? colors.mutedForeground : colors.border}
      surfaceStyle={[styles.action, { width: touchTarget - 4, height: touchTarget - 4 }]}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      aria-disabled={disabled}
    >
      <View pointerEvents="none">{typeof icon === 'function' ? icon(fg) : icon}</View>
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // The heavy bottom rule is the bar's signature: it separates chrome from
  // content without a blurred shadow.
  root: {
    alignSelf: 'stretch',
    borderBottomWidth: borderWidths.extraHeavy,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTitle: {
    flex: 1,
    justifyContent: 'center',
  },
  largeTitle: {
    alignSelf: 'stretch',
  },
  spacer: {
    flex: 1,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
