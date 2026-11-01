import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { borderWidths, spacing, touchTarget, type ColorScheme } from '../lib/colors';
import { CheckIcon } from '../lib/icons';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { variants } from '../lib/variants';
import BrutalSurface from './brutal-surface';
import Text from './text';

export type CheckedState = boolean | 'indeterminate';

export interface CheckboxProps {
  /** Controlled state. Omit for an uncontrolled checkbox. */
  checked?: CheckedState;
  /** @default false */
  defaultChecked?: CheckedState;
  /** Receives the next value. An indeterminate box moves to `true`. */
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Pressable text beside the box. Also the accessibility label unless one is given. */
  label?: string;
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Lands on the box itself. */
  testID?: string;
}

const BOX = 24;
const MARK = 16;

// Selected is the inverted block (DESIGN §3): foreground fill, background mark.
const checkboxStyles = (c: ColorScheme) =>
  variants({
    base: {
      box: { width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
    },
    variants: {
      state: {
        off: { box: { backgroundColor: c.background } },
        on: { box: { backgroundColor: c.foreground } },
      },
    },
    defaultVariants: { state: 'off' },
  });

export function Checkbox({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CheckboxProps) {
  const { colors } = useTheme();
  const { reduceMotion, selection } = useMotion();
  const [internal, setInternal] = useState<CheckedState>(defaultChecked);
  const checked = checkedProp ?? internal;
  const selected = checked !== false;
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, selection);
  }, [selected, selection, progress]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: reduceMotion ? 1 : 0.6 + 0.4 * progress.value }],
  }));

  const toggle = () => {
    if (disabled) return;
    const next = checked !== true;
    if (checkedProp === undefined) setInternal(next);
    onCheckedChange?.(next);
  };

  const look = checkboxStyles(colors)({ state: selected ? 'on' : 'off' });
  const slop = Math.max(0, Math.ceil((touchTarget - BOX) / 2));

  return (
    <View style={[styles.row, style]}>
      <BrutalSurface
        testID={testID}
        surfaceStyle={look.box}
        elevation="control"
        borderWidth="control"
        disabled={disabled}
        onPress={toggle}
        hitSlop={slop}
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ checked: checked === 'indeterminate' ? 'mixed' : checked, disabled }}
      >
        <Animated.View style={markStyle}>
          {checked === 'indeterminate' ? (
            <View style={[styles.bar, { backgroundColor: colors.background }]} />
          ) : (
            <CheckIcon size={MARK} color={colors.background} />
          )}
        </Animated.View>
      </BrutalSurface>
      {label ? (
        <Pressable
          onPress={toggle}
          disabled={disabled}
          style={[styles.label, { paddingLeft: spacing.sm }]}
          // The box announces the label; a second node would read it twice.
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <Text tone={disabled ? 'muted' : 'default'}>
            {label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  bar: { width: MARK - 4, height: borderWidths.control },
  label: { flexShrink: 1, minHeight: touchTarget, justifyContent: 'center' },
});

export default Checkbox;
