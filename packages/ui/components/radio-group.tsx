import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { spacing, touchTarget } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';
import Text from './text';

export interface RadioGroupProps extends ViewProps {
  /** The controlled value. Omit for an uncontrolled group. */
  value?: string;
  /** Initial value when uncontrolled. Without one nothing is selected. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Disables every item. @default false */
  disabled?: boolean;
  children?: ReactNode;
}

export interface RadioGroupItemProps extends Omit<PressableProps, 'onPress' | 'style' | 'children'> {
  value: string;
  /** Rendered beside the indicator and used as the accessible name. */
  label: string;
  /** Disables this item only. @default false */
  disabled?: boolean;
  /** Style for the pressable row. */
  style?: StyleProp<ViewStyle>;
}

interface RadioContextValue {
  value?: string;
  disabled: boolean;
  select: (value: string) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

const BOX = 24;
const MARK_INSET = 4;
// Border is 2, so the mark sits MARK_INSET inside the border edge.
const MARK = BOX - 2 * 2 - 2 * MARK_INSET;

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
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : internalValue;

  const context = useMemo<RadioContextValue>(
    () => ({
      value,
      disabled,
      select: (next) => {
        if (!controlled) setInternalValue(next);
        onValueChange?.(next);
      },
    }),
    [value, disabled, controlled, onValueChange],
  );

  return (
    <RadioContext.Provider value={context}>
      <View
        accessibilityRole="radiogroup"
        style={cn({ gap: spacing.xs }, style)}
        {...props}
      >
        {children}
      </View>
    </RadioContext.Provider>
  );
}

export function RadioGroupItem({
  value,
  label,
  disabled: disabledProp = false,
  style,
  testID,
  accessibilityLabel,
  ...props
}: RadioGroupItemProps) {
  const context = useContext(RadioContext);
  if (!context) throw new Error('RadioGroupItem must be used within RadioGroup');

  const { colors } = useTheme();
  const { selection, reduceMotion } = useMotion();
  const selected = context.value === value;
  const disabled = context.disabled || disabledProp;

  const progress = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, selection);
  }, [selected, selection, progress]);

  // Reduced motion swaps the scale for a fade only.
  const markStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: reduceMotion ? 1 : 0.4 + 0.6 * progress.value }],
  }));

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={() => context.select(value)}
      testID={testID}
      style={({ pressed }) => [styles.row, { gap: spacing.md }, style as ViewStyle, !disabled && pressed && { backgroundColor: colors.muted }]}
      {...props}
    >
      <BrutalSurface
        pressable={false}
        elevation="flat"
        borderWidth="control"
        disabled={disabled}
        testID={testID ? `${testID}-indicator` : undefined}
        surfaceStyle={styles.box}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {selected ? (
          <AnimatedView
            testID={testID ? `${testID}-mark` : undefined}
            style={[styles.mark, { backgroundColor: colors.foreground }, markStyle]}
          />
        ) : null}
      </BrutalSurface>
      <Text
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={styles.label}
        tone={disabled ? 'muted' : 'default'}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTarget,
  },
  box: {
    width: BOX,
    height: BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { width: MARK, height: MARK },
  label: { flexShrink: 1 },
});

export default RadioGroup;
