import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { spacing, touchTarget } from '../lib/colors';
import type { IconProps } from '../lib/icons';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';
import Text from './text';

export interface SegmentedControlItem {
  value: string;
  label: string;
  /** An icon component from the library, drawn in the segment's own pair. */
  icon?: (props: IconProps) => ReactNode;
  /** @default false */
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export interface SegmentedControlProps extends Omit<ViewProps, 'children'> {
  /** Two to five segments. */
  segments: SegmentedControlItem[];
  /** The selected segment. Omit for an uncontrolled control. */
  value?: string;
  /** Initial segment when uncontrolled. Defaults to the first enabled segment. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** @default false */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface Box {
  x: number;
  width: number;
}

// The block is drawn at a fixed width and stretched with scaleX, so the slide animates transforms only.
const BASE = 100;
const ICON_SIZE = 18;

export function SegmentedControl({
  segments,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  style,
  ...props
}: SegmentedControlProps) {
  const { colors } = useTheme();
  const { selection, reduceMotion } = useMotion();
  const [internalValue, setInternalValue] = useState(defaultValue ?? segments.find((s) => !s.disabled)?.value ?? '');
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const placed = useRef(false);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : internalValue;

  if (__DEV__ && (segments.length < 2 || segments.length > 5)) {
    console.warn(`SegmentedControl expects 2 to 5 segments, got ${segments.length}.`);
  }

  const translateX = useSharedValue(0);
  const scaleX = useSharedValue(0);
  const opacity = useSharedValue(0);

  const report = useCallback((key: string, box: Box) => {
    setBoxes((prev) => {
      const old = prev[key];
      return old && old.x === box.x && old.width === box.width ? prev : { ...prev, [key]: box };
    });
  }, []);

  const active = boxes[value];

  useEffect(() => {
    if (!active) {
      opacity.value = 0;
      return;
    }
    const nextX = active.x + active.width / 2 - BASE / 2;
    const nextScale = active.width / BASE;
    opacity.value = 1;
    if (!placed.current || reduceMotion) {
      translateX.value = nextX;
      scaleX.value = nextScale;
      placed.current = true;
    } else {
      translateX.value = withTiming(nextX, selection);
      scaleX.value = withTiming(nextScale, selection);
    }
  }, [active, reduceMotion, selection, translateX, scaleX, opacity]);

  const blockStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scaleX: scaleX.value }],
  }));

  const select = (next: string) => {
    if (next === value) return;
    if (!controlled) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <BrutalSurface
      pressable={false}
      elevation="card"
      borderWidth="container"
      disabled={disabled}
      style={cn({ alignSelf: 'stretch' }, style)}
      surfaceStyle={styles.surface}
      accessibilityRole="radiogroup"
      accessibilityState={{ disabled }}
      {...props}
    >
      <View style={styles.row}>
        <Animated.View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[styles.block, { backgroundColor: colors.foreground }, blockStyle]}
        />
        {segments.map((segment) => {
          const selected = segment.value === value;
          const off = disabled || !!segment.disabled;
          const color = selected ? colors.background : off ? colors.mutedForeground : colors.foreground;
          return (
            <Pressable
              key={segment.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, selected, disabled: off }}
              accessibilityLabel={segment.accessibilityLabel ?? segment.label}
              testID={segment.testID}
              disabled={off}
              onPress={() => select(segment.value)}
              onLayout={(e: LayoutChangeEvent) => report(segment.value, { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })}
              style={[styles.segment, { paddingHorizontal: spacing.xs }]}
            >
              <View
                style={[styles.content, { gap: spacing.xs }]}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
              >
                {segment.icon ? segment.icon({ color, size: ICON_SIZE }) : null}
                <Text variant="label" tone="inherit" numberOfLines={1} style={{ color, flexShrink: 1 }}>
                  {segment.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </BrutalSurface>
  );
}

const styles = StyleSheet.create({
  surface: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  block: { position: 'absolute', top: 0, bottom: 0, left: 0, width: BASE },
  // flexBasis 0 keeps segments equal width whatever their labels, so the block always lands on a clean third or half.
  segment: { flex: 1, flexBasis: 0, minHeight: touchTarget, alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

export default SegmentedControl;
