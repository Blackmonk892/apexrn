import type { ReactNode } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { borderWidths, spacing, touchTarget, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { usePressPhysics } from '../lib/use-press-physics';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ListItemProps extends Omit<PressableProps, 'style'> {
  /**
   * The main primary text of the list item.
   */
  title: string;
  /**
   * Optional secondary descriptive text below the title.
   */
  description?: string;
  /**
   * Optional React node to display on the leading (left) edge.
   */
  leading?: ReactNode;
  /**
   * Optional React node to display on the trailing (right) edge.
   */
  trailing?: ReactNode;
  /**
   * Disables the list item.
   * @default false
   */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ListItem({
  title,
  description,
  leading,
  trailing,
  disabled = false,
  style,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: ListItemProps) {
  const { colors } = useTheme();
  const isPressable = typeof onPress === 'function';
  const interactive = isPressable && !disabled;

  const { pressed, handlePressIn, handlePressOut } = usePressPhysics({
    offset: 0,
    disabled: !interactive,
    haptics: false,
  });

  const handlePressInInternal = (e: GestureResponderEvent) => {
    handlePressIn();
    onPressIn?.(e);
  };

  const handlePressOutInternal = (e: GestureResponderEvent) => {
    handlePressOut();
    onPressOut?.(e);
  };

  // Pressed = the accent fill with its own foreground. A muted-on-white tint
  // is nearly invisible, and accent text colours keep contrast in both themes.
  const animatedRowStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(pressed.value, [0, 1], [colors.background, colors.accent]),
  }));
  const animatedTitleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(pressed.value, [0, 1], [colors.foreground, colors.accentForeground]),
  }));
  const animatedDescriptionStyle = useAnimatedStyle(() => ({
    color: interpolateColor(pressed.value, [0, 1], [colors.mutedForeground, colors.accentForeground]),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressInInternal}
      onPressOut={handlePressOutInternal}
      disabled={disabled || !isPressable}
      style={[
        styles.container,
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          minHeight: isPressable ? touchTarget : undefined,
          borderColor: colors.border,
        },
        animatedRowStyle,
        // Disabled styling wins over the press animation so a disabled
        // item never renders the enabled background.
        disabled && { backgroundColor: colors.muted },
        style,
      ]}
      accessibilityRole={isPressable ? 'button' : undefined}
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      {...props}
    >
      {leading ? (
        <View style={[styles.slot, { marginRight: spacing.md }]}>{leading}</View>
      ) : null}

      <View style={[styles.contentContainer, { gap: spacing.xs }]}>
        <Animated.Text
          style={[
            styles.title,
            { fontSize: typography.md },
            animatedTitleStyle,
            disabled && { color: colors.mutedForeground },
          ]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Animated.Text>

        {description ? (
          <Animated.Text
            style={[styles.description, { fontSize: typography.sm }, animatedDescriptionStyle]}
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            {description}
          </Animated.Text>
        ) : null}
      </View>

      {trailing ? (
        <View style={[styles.slot, { marginLeft: spacing.md }]}>{trailing}</View>
      ) : null}
    </AnimatedPressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderBottomWidth: borderWidths.standard,
    borderRadius: 0,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  slot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {},
});

export default ListItem;
