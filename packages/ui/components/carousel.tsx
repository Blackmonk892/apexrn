import { useRef, useState, type ReactNode } from 'react';
import {
  type AccessibilityActionEvent,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewProps,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CarouselProps<T = unknown> extends ViewProps {
  /**
   * Array of data items to render in the carousel.
   */
  data: T[];
  /**
   * Render function for carousel items.
   */
  renderItem: ({ item, index }: { item: T; index: number }) => ReactNode;
  /**
   * Stable key for each item. Falls back to the index when omitted.
   */
  keyExtractor?: (item: T, index: number) => string;
  /**
   * Toggles the indicator dots below the carousel.
   * @default false
   */
  showIndicators?: boolean;
  /**
   * Width of each item. Defaults to 80% of the screen width.
   */
  itemWidth?: number;
  /**
   * Gap between items.
   * @default spacing.md
   */
  gap?: number;
  /**
   * Callback fired when the settled (visible) item changes.
   */
  onActiveIndexChange?: (index: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Carousel<T>({
  data,
  renderItem,
  keyExtractor,
  showIndicators = false,
  itemWidth: itemWidthProp,
  gap = spacing.md,
  onActiveIndexChange,
  style,
  ...props
}: CarouselProps<T>) {
  const { colors } = useTheme();
  // Live dimensions: item width follows rotation / split-screen instead of
  // a stale import-time snapshot.
  const { width: windowWidth } = useWindowDimensions();
  const itemWidth = itemWidthProp ?? windowWidth * 0.8;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<T>>(null);

  const settleIndex = (contentOffsetX: number) => {
    const index = Math.max(0, Math.min(Math.round(contentOffsetX / (itemWidth + gap)), data.length - 1));
    if (index !== activeIndex) {
      setActiveIndex(index);
      onActiveIndexChange?.(index);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    settleIndex(event.nativeEvent.contentOffset.x);
  };

  // Screen-reader adjust gestures (swipe up/down on the adjustable node).
  // Programmatic scrolls don't reliably fire momentum-end, so the index is
  // committed here directly.
  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    const delta = event.nativeEvent.actionName === 'increment' ? 1 : -1;
    const next = Math.max(0, Math.min(activeIndex + delta, data.length - 1));
    if (next === activeIndex) return;
    flatListRef.current?.scrollToOffset({ offset: next * (itemWidth + gap), animated: true });
    setActiveIndex(next);
    onActiveIndexChange?.(next);
  };

  return (
    <View
      style={cn(styles.container, { marginBottom: spacing.sm }, style)}
      accessibilityRole="adjustable"
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={handleAccessibilityAction}
      accessibilityLabel={`Carousel, item ${Math.min(activeIndex + 1, Math.max(data.length, 1))} of ${data.length}`}
      {...props}
    >
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        // `pagingEnabled` overrides `snapToInterval` on iOS — snap alone
        // gives the peek-and-settle physics this carousel is designed for.
        getItemLayout={(_, index) => ({ length: itemWidth + gap, offset: (itemWidth + gap) * index, index })}
        snapToInterval={itemWidth + gap}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={[
          styles.contentContainer,
          { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap }
        ]}
        keyExtractor={(item, index) => keyExtractor?.(item, index) ?? index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ width: itemWidth }}>
            {renderItem({ item, index })}
          </View>
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />

      {showIndicators && data.length > 1 && (
        // Dots are decorative: the outer label announces position so
        // screen readers don't hear N unlabeled dots.
        <View
          style={[styles.indicatorsContainer, { gap: spacing.sm, marginTop: spacing.sm }]}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          {data.map((item, index) => (
            <View
              key={keyExtractor?.(item, index) ?? index}
              style={[
                styles.dot,
                { backgroundColor: colors.muted, borderColor: colors.border },
                index === activeIndex && { backgroundColor: colors.foreground }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'column',
  },
  contentContainer: {
    alignItems: 'center',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderWidth: borderWidths.standard,
    borderRadius: 0,
  },
});

export default Carousel;
