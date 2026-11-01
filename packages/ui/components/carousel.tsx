import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  type AccessibilityActionEvent,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewProps,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { spacing } from '../lib/colors';
import { BackIcon } from '../lib/icons';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';
import Button from './button';

export interface CarouselProps<T = unknown> extends ViewProps {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => ReactNode;
  /** Falls back to the index when omitted. */
  keyExtractor?: (item: T, index: number) => string;
  /** The visible slide. Omit for an uncontrolled carousel. */
  index?: number;
  /** Initial slide when uncontrolled. @default 0 */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Row of square position blocks; the active one is inverted. @default false */
  showIndicators?: boolean;
  /** Previous and next buttons, disabled at the ends. @default false */
  showControls?: boolean;
  /** Defaults to 80% of the window width, so the next slide peeks in. */
  itemWidth?: number;
  /** @default spacing.md */
  gap?: number;
}

const BLOCK = 16;

function IndicatorBlock({ active }: { active: boolean }) {
  const { colors } = useTheme();
  const { selection } = useMotion();
  const fill = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    fill.value = withTiming(active ? 1 : 0, selection);
  }, [active, selection, fill]);

  const fillStyle = useAnimatedStyle(() => ({ opacity: fill.value }));

  return (
    <BrutalSurface
      pressable={false}
      elevation="flat"
      borderWidth="control"
      backgroundColor={colors.background}
      surfaceStyle={styles.block}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.foreground }, fillStyle]} />
    </BrutalSurface>
  );
}

export function Carousel<T>({
  data,
  renderItem,
  keyExtractor,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  showIndicators = false,
  showControls = false,
  itemWidth: itemWidthProp,
  gap = spacing.md,
  style,
  ...props
}: CarouselProps<T>) {
  const { width: windowWidth } = useWindowDimensions();
  const itemWidth = itemWidthProp ?? windowWidth * 0.8;
  const step = itemWidth + gap;
  const last = Math.max(0, data.length - 1);
  const clamp = (n: number) => Math.max(0, Math.min(n, last));

  const [internal, setInternal] = useState(defaultIndex);
  const controlled = indexProp !== undefined;
  const current = clamp(controlled ? indexProp : internal);
  const listRef = useRef<FlatList<T>>(null);
  const mounted = useRef(false);

  const select = useCallback(
    (next: number) => {
      if (next === current) return;
      if (!controlled) setInternal(next);
      onIndexChange?.(next);
    },
    [current, controlled, onIndexChange],
  );

  // Programmatic scrolls do not reliably fire momentum-end, so the index is committed in `select`
  // and the list follows it here. This also pulls a controlled list back when the parent ignores a swipe.
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: current * step, animated: mounted.current });
    mounted.current = true;
  }, [current, step]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = clamp(Math.round(event.nativeEvent.contentOffset.x / step));
    if (next !== current) select(next);
    else listRef.current?.scrollToOffset({ offset: current * step, animated: true });
  };

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    select(clamp(current + (event.nativeEvent.actionName === 'increment' ? 1 : -1)));
  };

  const keyOf = (item: T, i: number) => keyExtractor?.(item, i) ?? String(i);
  const hasIndicators = showIndicators && data.length > 1;

  return (
    <View
      style={cn({ alignSelf: 'stretch', marginBottom: spacing.sm }, style)}
      accessibilityRole="adjustable"
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAccessibilityAction}
      accessibilityLabel={`Carousel, item ${data.length ? current + 1 : 0} of ${data.length}`}
      {...props}
    >
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        // pagingEnabled ignores snapToInterval on iOS and cannot peek the next slide;
        // snapToInterval snaps on iOS, Android and web.
        getItemLayout={(_, i) => ({ length: step, offset: step * i, index: i })}
        snapToInterval={step}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        contentOffset={{ x: current * step, y: 0 }}
        contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap }]}
        keyExtractor={keyOf}
        renderItem={({ item, index: i }) => (
          <View style={{ width: itemWidth }} accessibilityLabel={`Slide ${i + 1} of ${data.length}`}>
            {renderItem({ item, index: i })}
          </View>
        )}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />

      {(hasIndicators || showControls) && (
        <View style={[styles.footer, { gap: spacing.md, marginTop: spacing.sm, paddingHorizontal: spacing.xl }]}>
          {showControls && (
            <Button
              variant="outline"
              accessibilityLabel="Previous slide"
              testID="carousel-prev"
              disabled={current <= 0}
              onPress={() => select(clamp(current - 1))}
              icon={(color) => <BackIcon color={color} />}
            />
          )}
          {hasIndicators && (
            <View
              style={[styles.indicators, { gap: spacing.sm }]}
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              {data.map((item, i) => (
                <IndicatorBlock key={keyOf(item, i)} active={i === current} />
              ))}
            </View>
          )}
          {showControls && (
            <Button
              variant="outline"
              accessibilityLabel="Next slide"
              testID="carousel-next"
              disabled={current >= last}
              onPress={() => select(clamp(current + 1))}
              icon={(color) => (
                <View style={styles.flip}>
                  <BackIcon color={color} />
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  indicators: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexShrink: 1, flexWrap: 'wrap' },
  block: { width: BLOCK, height: BLOCK },
  flip: { transform: [{ rotate: '180deg' }] },
});

export default Carousel;
