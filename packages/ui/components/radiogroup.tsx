import React, { createContext, useContext, useEffect } from 'react';
import { Pressable, StyleSheet, View, ViewProps, PressableProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
export interface RadioGroupProps extends ViewProps {
  /**
   * The controlled value of the radio group.
   */
  value?: string;
  /**
   * Callback fired when a radio item is selected.
   */
  onValueChange?: (value: string) => void;
  /**
   * Disables the entire radio group.
   * @default false
   */
  disabled?: boolean;
}

export interface RadioGroupItemProps extends Omit<PressableProps, 'onPress' | 'value'> {
  /**
   * The value of this specific radio item.
   */
  value: string;
  /**
   * Disables this specific radio item.
   * @default false
   */
  disabled?: boolean;
}

interface RadioContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioContext = createContext<RadioContextValue | null>(null);

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
// Maintained for strict template compliance, though no shadow is used here
const SHADOW_OFFSET = 4; 
const RADIO_SIZE = 24;
const DOT_SIZE = 12;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export function RadioGroup({
  value,
  onValueChange,
  disabled = false,
  style,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <RadioContext.Provider value={{ value, onValueChange, disabled }}>
      <View 
        style={cn(styles.group, style)} 
        accessibilityRole="radiogroup" 
        {...props}
      >
        {children}
      </View>
    </RadioContext.Provider>
  );
}

export function RadioGroupItem({
  value,
  disabled = false,
  style,
  ...props
}: RadioGroupItemProps) {
  const context = useContext(RadioContext);
  
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const isSelected = context.value === value;
  const isDisabled = context.disabled || disabled;
  
  const scale = useSharedValue(isSelected ? 1 : 0);

  // Sync internal animated value with external selection state
  useEffect(() => {
    scale.value = withTiming(isSelected ? 1 : 0, { 
      duration: 150, 
      easing: Easing.out(Easing.quad) 
    });
  }, [isSelected, scale]);

  const handlePress = () => {
    if (isDisabled) return;
    context.onValueChange?.(value);
  };

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: scale.value, // Smooth fade alongside the scale
    };
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.item,
        isDisabled && styles.itemDisabled,
        style,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      {...props}
    >
      <AnimatedView 
        style={[
          styles.dot, 
          isDisabled && styles.dotDisabled,
          animatedDotStyle
        ]} 
      />
    </AnimatedPressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  group: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  item: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy, // Thick borders as requested
    // The visual hack to make the standard Brutalist square look circular
    borderRadius: 999, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDisabled: {
    backgroundColor: colors.light.muted,
    borderColor: colors.light.mutedForeground,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    backgroundColor: colors.light.foreground,
    borderRadius: 999,
  },
  dotDisabled: {
    backgroundColor: colors.light.mutedForeground,
  },
});