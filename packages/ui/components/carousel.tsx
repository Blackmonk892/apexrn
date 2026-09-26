import React, { useState, useRef } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  View, 
  ViewProps, 
  NativeSyntheticEvent, 
  NativeScrollEvent,
  Dimensions
} from 'react-native';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CarouselProps extends ViewProps {
  /**
   * Array of data items to render in the carousel.
   */
  data: any[];
  /**
   * Render function for carousel items.
   */
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactNode;
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
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Carousel({
  data,
  renderItem,
  showIndicators = false,
  itemWidth = SCREEN_WIDTH * 0.8,
  gap = spacing.md,
  style,
  ...props
}: CarouselProps) {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (itemWidth + gap));
    if (index !== activeIndex && index >= 0 && index < data.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={cn(styles.container, style)} {...props}>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={itemWidth + gap}
        decelerationRate="fast"
        contentContainerStyle={[
          styles.contentContainer,
          { paddingHorizontal: spacing.xl, gap }
        ]}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ width: itemWidth }}>
            {renderItem({ item, index })}
          </View>
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {showIndicators && data.length > 1 && (
        <View style={styles.indicatorsContainer} accessibilityRole="adjustable">
          {data.map((_, index) => (
            <View 
              key={index} 
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
    width: '100%',
    flexDirection: 'column',
    marginBottom: SHADOW_OFFSET,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: SHADOW_OFFSET * 2,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderWidth: borderWidths.standard,
    borderRadius: 0,
  },
});