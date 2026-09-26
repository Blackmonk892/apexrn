import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, interpolateColor } from 'react-native-reanimated';

import { colors, borderWidths, spacing, typography } from '../lib/colors';
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
   * Optional React node to display on the leading (left) edge (e.g., an Avatar or Icon).
   */
  leading?: React.ReactNode;
  /**
   * Optional React node to display on the trailing (right) edge (e.g., a Chevron or Badge).
   */
  trailing?: React.ReactNode;
  /**
   * Disables the list item, applying muted styles and preventing interactions.
   * @default false
   */
  disabled?: boolean;
  /**
   * Optional style overrides.
   */
  style?: any;
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
  onPressIn,
  onPressOut,
  ...props
}: ListItemProps) {
  // No shadow block on a list row — reuse the shared spring/haptics timing
  // via the raw `pressed` value rather than pulling in BrutalSurface.
  const { pressed, handlePressIn, handlePressOut } = usePressPhysics({
    offset: 0,
    disabled,
    haptics: false,
  });

  const handlePressInInternal = (e: any) => {
    handlePressIn();
    onPressIn?.(e);
  };

  const handlePressOutInternal = (e: any) => {
    handlePressOut();
    onPressOut?.(e);
  };

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        pressed.value,
        [0, 1],
        // Flash to muted color on press
        [colors.light.background, colors.light.muted]
      ),
    };
  });

  return (
    <AnimatedPressable
      onPressIn={handlePressInInternal}
      onPressOut={handlePressOutInternal}
      disabled={disabled}
      style={[
        styles.container,
        disabled && styles.containerDisabled,
        animatedBackgroundStyle,
        style,
      ]}
      accessibilityRole="button"
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
            disabled && styles.textDisabled
          )}
          numberOfLines={1}
        >
          {title}
        </Text>

        {description ? (
          <Text
            style={cn(
              styles.description,
              disabled && styles.textDisabled
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
    borderBottomWidth: borderWidths.standard, // Strict 2px inner divider border
    borderColor: colors.light.border,
    borderRadius: 0,
    width: '100%',
  },
  containerDisabled: {
    backgroundColor: colors.light.muted,
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
    color: colors.light.foreground,
  },
  description: {
    fontSize: typography.sm,
    color: colors.light.mutedForeground,
  },
  textDisabled: {
    color: colors.light.mutedForeground,
  },
});
