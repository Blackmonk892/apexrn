import { useEffect, type ReactNode } from 'react';
import { PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { spacing } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import Text from './text';

export interface FABProps extends Omit<PressableProps, 'style' | 'disabled' | 'children' | 'accessibilityLabel'> {
  /** Required: an icon-only button has no other name. Read instead of `label` by screen readers. */
  accessibilityLabel: string;
  /** Glyph shown in the square. It should use `colors.primaryForeground`; it is hidden from assistive tech. */
  icon?: ReactNode;
  /** Makes the button extended. Sentence case, one line. */
  label?: string;
  /** Slides and fades out when false, leaving the accessibility tree and ignoring touches. @default true */
  visible?: boolean;
  /** Which bottom edge position it sits at, inside its positioned parent. @default 'bottom-right' */
  placement?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /**
   * Safe-area insets added to the edge offset. The library has no safe-area dependency:
   * pass values from `useSafeAreaInsets()`.
   */
  insets?: { bottom?: number; left?: number; right?: number };
  disabled?: boolean;
  /** Style for the outer positioned wrapper. */
  style?: StyleProp<ViewStyle>;
}

const SIZE = 56;
// Distance the button travels while fading out; short enough to read as leaving the edge, not the screen.
const SLIDE = 24;

export function FAB({
  accessibilityLabel,
  icon,
  label,
  visible = true,
  placement = 'bottom-right',
  insets,
  disabled = false,
  style,
  testID,
  ...props
}: FABProps) {
  const { colors } = useTheme();
  const { reduceMotion, enter, exit } = useMotion();
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, visible ? enter : exit);
  }, [visible, enter, exit, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: reduceMotion ? [] : [{ translateY: (1 - progress.value) * SLIDE }],
  }));

  const edge = spacing.lg;
  const extended: ViewStyle = { paddingHorizontal: spacing.lg, gap: spacing.sm };
  const position: ViewStyle =
    placement === 'bottom-center'
      ? { left: 0, right: 0, alignItems: 'center' }
      : placement === 'bottom-left'
        ? { left: edge + (insets?.left ?? 0) }
        : { right: edge + (insets?.right ?? 0) };

  return (
    <Animated.View
      testID={testID ? `${testID}-root` : undefined}
      pointerEvents={visible ? 'box-none' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      style={[styles.root, { bottom: edge + (insets?.bottom ?? 0) }, position, style, animatedStyle]}
    >
      <BrutalSurface
        testID={testID}
        elevation="overlay"
        borderWidth="container"
        backgroundColor={colors.primary}
        disabled={disabled}
        surfaceStyle={[styles.surface, label ? extended : styles.square]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        hitSlop={spacing.sm}
        {...props}
      >
        {icon ? (
          <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {icon}
          </View>
        ) : null}
        {label ? (
          <Text
            variant="strong"
            tone="inherit"
            numberOfLines={1}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={[styles.label, { color: colors.primaryForeground }]}
          >
            {label}
          </Text>
        ) : null}
      </BrutalSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', zIndex: 10 },
  surface: { height: SIZE, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  square: { width: SIZE },
  label: { flexShrink: 1 },
});

export default FAB;
