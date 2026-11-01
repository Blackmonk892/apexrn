import { useEffect, useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { borderWidths, spacing, touchTarget } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import { Text } from './text';

export interface SwitchProps extends Omit<PressableProps, 'onPress' | 'onPressIn' | 'onPressOut' | 'children' | 'style'> {
  /** Controlled state. Omit for an uncontrolled switch. */
  checked?: boolean;
  /** Initial state when uncontrolled. @default false */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Renders a pressable row with the label beside the switch; the whole row is the hit target. */
  label?: string;
  /** Style for the outer wrapper. */
  style?: StyleProp<ViewStyle>;
}

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 32;
const TRACK_PADDING = 2;
const THUMB_SIZE = 20;
const TRAVEL = TRACK_WIDTH - borderWidths.control * 2 - TRACK_PADDING * 2 - THUMB_SIZE;
const TRACK_SLOP = Math.ceil((touchTarget - TRACK_HEIGHT) / 2);

const AnimatedView = Animated.createAnimatedComponent(View);

export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  style,
  testID,
  accessibilityLabel,
  ...props
}: SwitchProps) {
  const { colors } = useTheme();
  const { reduceMotion, selection } = useMotion();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const checked = checkedProp ?? internalChecked;
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    const to = checked ? 1 : 0;
    progress.value = reduceMotion ? to : withTiming(to, selection);
    // `selection` is a stable token object per motion mode.
  }, [checked, reduceMotion, progress, selection]);

  const toggle = () => {
    if (disabled) return;
    if (checkedProp === undefined) setInternalChecked(!checked);
    onCheckedChange?.(!checked);
  };

  // Only the thumb travels; the fills swap instantly so the state never reads as "in between".
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRAVEL }],
  }));
  const trackFill = { backgroundColor: checked ? colors.foreground : colors.background };
  const thumbFill = { backgroundColor: checked ? colors.background : colors.foreground };

  const switchState = {
    accessibilityRole: 'switch' as const,
    accessibilityState: { checked, disabled },
    'aria-checked': checked,
    'aria-disabled': disabled,
  };

  const thumb = (
    <AnimatedView
      testID={testID ? `${testID}-thumb` : undefined}
      style={[styles.thumb, { borderColor: colors.border }, thumbFill, thumbStyle]}
    />
  );

  if (!label) {
    return (
      <BrutalSurface
        elevation="control"
        borderWidth="control"
        disabled={disabled}
        hitSlop={{ top: TRACK_SLOP, bottom: TRACK_SLOP }}
        onPress={toggle}
        surfaceStyle={[styles.track, trackFill]}
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        {...switchState}
        {...props}
      >
        {thumb}
      </BrutalSurface>
    );
  }

  // The row is the one switch node; the track inside is decoration and carries no press physics.
  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.row, { gap: spacing.md }, style]}
      {...switchState}
      {...props}
    >
      <BrutalSurface
        elevation="control"
        borderWidth="control"
        disabled={disabled}
        pressable={false}
        surfaceStyle={[styles.track, trackFill]}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        aria-hidden
      >
        {thumb}
      </BrutalSurface>
      <Text variant="body" tone={disabled ? 'muted' : 'default'} style={styles.label} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: TRACK_PADDING,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderWidth: borderWidths.control,
    borderRadius: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTarget,
  },
  label: { flexShrink: 1 },
});

export default Switch;
