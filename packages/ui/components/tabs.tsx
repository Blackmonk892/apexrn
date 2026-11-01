import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  type PressableProps,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { spacing, touchTarget, typography } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

export interface TabsProps extends ViewProps {
  /** The selected tab. Omit for an uncontrolled tab set. */
  value?: string;
  /** Initial tab when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

export interface TabsListProps extends ViewProps {
  children?: ReactNode;
}

export interface TabsTriggerProps extends Omit<PressableProps, 'onPress' | 'style' | 'children'> {
  /** Must match a TabsContent value. */
  value: string;
  /** @default false */
  disabled?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface TabsContentProps extends ViewProps {
  /** The tab value that shows this content. */
  value: string;
  children?: ReactNode;
  /** Keep inactive content mounted (state survives), hidden from view and assistive tech. @default false */
  keepMounted?: boolean;
}

interface TabsContextValue {
  value: string;
  select: (value: string) => void;
}

interface Box {
  x: number;
  width: number;
}

interface ListContextValue {
  report: (value: string, box: Box) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);
const ListContext = createContext<ListContextValue | null>(null);

function useTabs(part: string) {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`${part} must be used within Tabs`);
  return context;
}

// The indicator is drawn at a fixed width and stretched with scaleX, so the slide animates transforms only.
const BASE = 100;

export function Tabs({ value: valueProp, defaultValue = '', onValueChange, style, children, ...props }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : internalValue;

  const context = useMemo<TabsContextValue>(
    () => ({
      value,
      select: (next) => {
        if (!controlled) setInternalValue(next);
        onValueChange?.(next);
      },
    }),
    [value, controlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={context}>
      <View style={cn({ alignSelf: 'stretch' }, style)} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, style, ...props }: TabsListProps) {
  const { value } = useTabs('TabsList');
  const { colors } = useTheme();
  const { selection, reduceMotion } = useMotion();
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [viewport, setViewport] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const placed = useRef(false);

  const translateX = useSharedValue(0);
  const scaleX = useSharedValue(0);
  const opacity = useSharedValue(0);

  const report = useCallback((key: string, box: Box) => {
    setBoxes((prev) => {
      const old = prev[key];
      return old && old.x === box.x && old.width === box.width ? prev : { ...prev, [key]: box };
    });
  }, []);
  const listContext = useMemo(() => ({ report }), [report]);

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
    // Keep the selected tab inside the viewport when the list scrolls.
    if (viewport > 0) {
      scrollRef.current?.scrollTo({
        x: Math.max(0, active.x + active.width / 2 - viewport / 2),
        animated: !reduceMotion,
      });
    }
  }, [active, viewport, reduceMotion, selection, translateX, scaleX, opacity]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scaleX: scaleX.value }],
  }));

  return (
    <ListContext.Provider value={listContext}>
      <BrutalSurface
        pressable={false}
        elevation="card"
        borderWidth="container"
        style={cn({ alignSelf: 'stretch', marginBottom: spacing.md }, style)}
        surfaceStyle={styles.surface}
        accessibilityRole="tablist"
        {...props}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={(e: LayoutChangeEvent) => setViewport(e.nativeEvent.layout.width)}
          contentContainerStyle={styles.row}
        >
          <Animated.View
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={[styles.indicator, { backgroundColor: colors.foreground }, indicatorStyle]}
          />
          {children}
        </ScrollView>
      </BrutalSurface>
    </ListContext.Provider>
  );
}

export function TabsTrigger({ value, disabled = false, children, style, accessibilityLabel, ...props }: TabsTriggerProps) {
  const { value: selectedValue, select } = useTabs('TabsTrigger');
  const list = useContext(ListContext);
  if (!list) throw new Error('TabsTrigger must be used within TabsList');
  const { colors } = useTheme();
  const selected = selectedValue === value;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? children : undefined)}
      disabled={disabled}
      onPress={() => select(value)}
      onLayout={(e: LayoutChangeEvent) => {
        const { x, width } = e.nativeEvent.layout;
        list.report(value, { x, width });
      }}
      style={cn(styles.trigger, { paddingHorizontal: spacing.md }, style)}
      {...props}
    >
      <Text
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        numberOfLines={1}
        maxFontSizeMultiplier={1.3}
        style={[
          styles.label,
          { fontSize: typography.sm, color: selected ? colors.background : disabled ? colors.mutedForeground : colors.foreground },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function TabsContent({ value, children, keepMounted = false, style, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabs('TabsContent');
  const active = selectedValue === value;
  if (!active && !keepMounted) return null;

  return (
    <View
      style={cn({ alignSelf: 'stretch' }, style, !active && styles.hidden)}
      pointerEvents={active ? 'auto' : 'none'}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { overflow: 'hidden' },
  row: { flexGrow: 1, flexDirection: 'row', alignItems: 'stretch' },
  indicator: { position: 'absolute', top: 0, bottom: 0, left: 0, width: BASE },
  // flexGrow fills the list when tabs fit; flexShrink 0 lets them overflow into a scroll.
  trigger: {
    flexGrow: 1,
    flexShrink: 0,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  hidden: { height: 0, overflow: 'hidden', opacity: 0 },
});

export default Tabs;
