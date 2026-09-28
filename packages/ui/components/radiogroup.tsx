import { createContext, useContext, useEffect, type ReactNode } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import { usePressPhysics } from '../lib/usePressPhysics';

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
  children?: ReactNode;
}

export interface RadioGroupItemProps extends Omit<PressableProps, 'onPress' | 'style'> {
  /**
   * The value of this specific radio item.
   */
  value: string;
  /**
   * Disables this specific radio item.
   * @default false
   */
  disabled?: boolean;
  /**
   * Container style override. Function styles are not supported here.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Expands the touch target beyond the 24px visual circle.
   * @default 12 (≈48px total target)
   */
  hitSlop?: PressableProps['hitSlop'];
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

export function RadioGroupItem(props: RadioGroupItemProps) {
  const context = useContext(RadioContext);

  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  return <RadioGroupItemInner {...props} context={context} />;
}

function RadioGroupItemInner({
  value,
  disabled = false,
  hitSlop = 12,
  style,
  context,
  ...props
}: RadioGroupItemProps & { context: RadioContextValue }) {
  const { colors } = useTheme();

  const isSelected = context.value === value;
  const isDisabled = context.disabled || disabled;

  const scale = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    scale.value = withTiming(isSelected ? 1 : 0, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  }, [isSelected, scale]);

  const { animatedSurfaceStyle, handlePressIn, handlePressOut } = usePressPhysics({
    offset: 0,
    disabled: isDisabled,
  });

  const handlePress = () => {
    if (isDisabled) return;
    context.onValueChange?.(value);
  };

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: scale.value,
    };
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.item,
        { backgroundColor: colors.background, borderColor: colors.border },
        isDisabled && { backgroundColor: colors.muted, borderColor: colors.mutedForeground },
        animatedSurfaceStyle,
        style,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      accessibilityLabel={props.accessibilityLabel ?? `Option ${value}`}
      disabled={isDisabled}
      hitSlop={hitSlop}
      {...props}
    >
      <AnimatedView
        style={[
          styles.dot,
          { backgroundColor: colors.foreground },
          isDisabled && { backgroundColor: colors.mutedForeground },
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
    borderWidth: borderWidths.heavy,
    borderRadius: 999, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 999,
  },
});

export default RadioGroup;