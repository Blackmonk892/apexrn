import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { spacing, touchTarget } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
export interface RadioGroupProps extends ViewProps {
  /**
   * The controlled value. Omit for an uncontrolled group.
   */
  value?: string;
  /**
   * Initial value when uncontrolled.
   */
  defaultValue?: string;
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
   * Outer wrapper style.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Expands the touch target beyond the 24px visual box.
   * @default enough to reach the platform touch target (44pt iOS / 48dp Android)
   */
  hitSlop?: PressableProps['hitSlop'];
}

interface RadioContextValue {
  value?: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
}

const RadioContext = createContext<RadioContextValue | null>(null);

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const RADIO_SIZE = 24;
const DOT_SIZE = 12;
const SHADOW_OFFSET = 2;
// Radios stay round on purpose: circle vs. square is how people tell a
// single-choice control from a checkbox, so this is a functional radius.
const RADIO_RADIUS = 999;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
const AnimatedView = Animated.createAnimatedComponent(View);

export function RadioGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  style,
  children,
  ...props
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = valueProp ?? internalValue;
  const controlled = valueProp !== undefined;

  const context = useMemo<RadioContextValue>(
    () => ({
      value,
      disabled,
      onValueChange: (next) => {
        if (!controlled) setInternalValue(next);
        onValueChange?.(next);
      },
    }),
    [value, disabled, controlled, onValueChange],
  );

  return (
    <RadioContext.Provider value={context}>
      <View
        style={cn({ flexDirection: 'column', gap: spacing.sm }, style)}
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
  hitSlop = Math.ceil((touchTarget - RADIO_SIZE) / 2),
  style,
  ...props
}: RadioGroupItemProps) {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const isSelected = context.value === value;
  const isDisabled = context.disabled || disabled;
  const dot = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    const to = isSelected ? 1 : 0;
    dot.value = reduceMotion ? to : withTiming(to, { duration: 150, easing: Easing.out(Easing.quad) });
  }, [isSelected, reduceMotion, dot]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dot.value }],
    opacity: dot.value,
  }));

  return (
    <BrutalSurface
      style={style}
      surfaceStyle={styles.surface}
      offset={SHADOW_OFFSET}
      borderWidth="heavy"
      borderRadius={RADIO_RADIUS}
      backgroundColor={isDisabled ? colors.muted : colors.background}
      borderColor={isDisabled ? colors.mutedForeground : colors.border}
      hasShadow={!isDisabled}
      disabled={isDisabled}
      hitSlop={hitSlop}
      onPress={() => context.onValueChange(value)}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      aria-checked={isSelected}
      aria-disabled={isDisabled}
      accessibilityLabel={props.accessibilityLabel ?? `Option ${value}`}
      {...props}
    >
      <AnimatedView
        style={[
          styles.dot,
          { backgroundColor: isDisabled ? colors.mutedForeground : colors.foreground },
          animatedDotStyle,
        ]}
      />
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  surface: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: RADIO_RADIUS,
  },
});

export default RadioGroup;
