import { Children, Fragment, isValidElement, useEffect, type ReactNode } from 'react';
import { type GestureResponderEvent, StyleSheet, View, type ViewProps } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { borderWidths, spacing, touchTarget } from '../lib/colors';
import { BackIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';
import { Text } from './text';

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
  /** Trailing slot: put up to two `AppBarAction`s here. More than two warns in development; they crowd the title. */
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
  /**
   * Scroll offset of the screen's list, as a Reanimated shared value. With `size="large"` the large
   * title fades and slides up over `collapseDistance` while the compact title fades in.
   */
  scrollY?: SharedValue<number>;
  /** Scroll distance in px over which the large title collapses. @default 56 */
  collapseDistance?: number;
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
// Components
// ---------------------------------------------------------------------------
function countActions(node: ReactNode): number {
  return Children.toArray(node).reduce<number>(
    (n, child) => n + (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment ? countActions(child.props.children) : 1),
    0,
  );
}

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
  scrollY,
  collapseDistance = 56,
  style,
  ...props
}: AppBarProps) {
  const { colors } = useTheme();
  const isLarge = size === 'large';
  const idle = useSharedValue(0);
  const y = scrollY ?? idle;

  const actionCount = countActions(trailing);
  useEffect(() => {
    if (__DEV__ && actionCount > 2) {
      console.warn(`AppBar: ${actionCount} trailing actions; use at most 2.`);
    }
  }, [actionCount]);

  // Opacity and translate only, so the bar keeps its height and nothing relayouts while scrolling.
  const largeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, collapseDistance * 0.8], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.value, [0, collapseDistance], [0, -collapseDistance / 2], Extrapolation.CLAMP) }],
  }));
  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [collapseDistance * 0.5, collapseDistance], [0, 1], Extrapolation.CLAMP),
  }));

  // Variants as data, resolved per render so theme changes apply.
  const variants: Record<Variant, { bg: string; fg: string }> = {
    default: { bg: colors.background, fg: colors.foreground },
    primary: { bg: colors.primary, fg: colors.primaryForeground },
    accent: { bg: colors.accent, fg: colors.accentForeground },
    inverse: { bg: colors.foreground, fg: colors.background },
  };
  const v = variants[variant];

  const lead =
    leading ??
    (onBack ? (
      <AppBarAction
        label={backLabel}
        onPress={onBack}
        icon={(color) => <BackIcon size={22} color={color} />}
      />
    ) : null);

  const subtitleNode = subtitle ? (
    <Text variant="label" numberOfLines={1} tone="inherit" style={{ color: v.fg }}>
      {subtitle}
    </Text>
  ) : null;

  const compactBlock =
    title || subtitle ? (
      <View style={styles.compactTitle}>
        {title ? (
          <Text variant="title" numberOfLines={1} tone="inherit" style={{ color: v.fg }}>
            {title}
          </Text>
        ) : null}
        {subtitleNode}
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
        {isLarge ? (
          // The large title below is the header for assistive tech; this copy only appears once it has scrolled away.
          <Animated.View
            style={[styles.compactTitle, compactStyle]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
          >
            {title ? (
              <Text variant="title" numberOfLines={1} tone="inherit" accessibilityRole="none" style={{ color: v.fg }}>
                {title}
              </Text>
            ) : null}
          </Animated.View>
        ) : (
          compactBlock
        )}
        {trailing ? <View style={[styles.trailing, { gap: spacing.sm }]}>{trailing}</View> : null}
      </View>
      {isLarge && (title || subtitle) ? (
        <Animated.View style={[{ paddingTop: spacing.sm }, largeStyle]}>
          {title ? (
            <Text variant="display" numberOfLines={2} tone="inherit" style={{ color: v.fg }}>
              {title}
            </Text>
          ) : null}
          {subtitleNode}
        </Animated.View>
      ) : null}
    </View>
  );
}

export function AppBarAction({ icon, label, onPress, active = false, disabled = false }: AppBarActionProps) {
  const { colors } = useTheme();
  const fg = disabled ? colors.mutedForeground : active ? colors.background : colors.foreground;

  return (
    <BrutalSurface
      elevation="control"
      borderWidth="control"
      disabled={disabled}
      onPress={onPress}
      backgroundColor={active && !disabled ? colors.foreground : colors.background}
      borderColor={colors.border}
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
    borderBottomWidth: borderWidths.container,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTitle: {
    flex: 1,
    justifyContent: 'center',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
