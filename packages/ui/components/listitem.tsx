import type { ReactNode } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, interpolateColor } from 'react-native-reanimated';

import { borderWidths, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import { usePressPhysics } from '../lib/usePressPhysics';

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

export default function ListItem({
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

  const { pressed, handlePressIn, handlePressOut } = usePressPhysics({
    offset: 0,
    disabled,
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

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        pressed.value,
        [0, 1],
        [colors.background, colors.muted]
      ),
    };
  });

  const isPressable = typeof onPress === 'function';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressInInternal}
      onPressOut={handlePressOutInternal}
      disabled={disabled}
      style={[
        styles.container,
        { borderColor: colors.border },
        animatedBackgroundStyle,
        // Disabled styling wins over the press animation so a disabled
        // item never renders the enabled background.
        disabled && { backgroundColor: colors.muted },
        style,
      ]}
      accessibilityRole={isPressable ? 'button' : 'none'}
      accessibilityState={{ disabled }}
      {...props}
    >
      {leading && (
        <View style={styles.leadingContainer}>
          {leading}
        </View>
      )}

      <View style={styles.contentContainer}>
        <Text
          style={cn(
            styles.title,
            { color: colors.foreground },
            disabled && { color: colors.mutedForeground }
          )}
          numberOfLines={1}
        >
          {title}
        </Text>

        {description ? (
          <Text
            style={cn(
              styles.description,
              { color: colors.mutedForeground }
            )}
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}
      </View>

      {trailing && (
        <View style={styles.trailingContainer}>
          {trailing}
        </View>
      )}
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: borderWidths.standard,
    borderRadius: 0,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  leadingContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailingContainer: {
    marginLeft: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.md,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    fontSize: typography.sm,
  },
});
