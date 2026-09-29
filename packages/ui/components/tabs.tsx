import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  type LayoutChangeEvent,
  type LayoutRectangle,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
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

import { borderWidths, spacing, touchTarget, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface TabsContextState {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextState | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a <Tabs />');
  }
  return context;
}

interface TabsListContextState {
  registerLayout: (value: string, layout: LayoutRectangle) => void;
}

const TabsListContext = createContext<TabsListContextState | undefined>(undefined);

function useTabsListContext() {
  const context = useContext(TabsListContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within a <TabsList />');
  }
  return context;
}

export interface TabsProps extends ViewProps {
  /**
   * The value of the selected tab. Omit for an uncontrolled tab set.
   */
  value?: string;
  /**
   * Initial tab when uncontrolled.
   */
  defaultValue?: string;
  /**
   * Callback fired when a tab is selected.
   */
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

export interface TabsTriggerProps extends Omit<PressableProps, 'onPress' | 'style'> {
  /**
   * The value of the tab. Must match a TabsContent value.
   */
  value: string;
  /**
   * Disables the trigger.
   * @default false
   */
  disabled?: boolean;
  children?: ReactNode;
  /**
   * Container style override. Function styles are not supported here.
   */
  style?: StyleProp<ViewStyle>;
}

export interface TabsContentProps extends ViewProps {
  /**
   * The value that activates this content block.
   */
  value: string;
  children?: ReactNode;
  /**
   * Keep inactive tab content mounted (preserves input/scroll state) while
   * hiding it visually and from assistive tech. @default false
   */
  keepMounted?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function Tabs({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  children,
  style,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = valueProp ?? internalValue;
  const controlled = valueProp !== undefined;

  const context = useMemo<TabsContextState>(
    () => ({
      value,
      onValueChange: (next) => {
        if (!controlled) setInternalValue(next);
        onValueChange?.(next);
      },
    }),
    [value, controlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={context}>
      <View style={cn(styles.root, style)} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, style, ...props }: ViewProps) {
  const { value } = useTabsContext();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});

  const translateX = useSharedValue(0);
  // Plain ref: StrictMode-safe, no worklet involvement.
  const isFirstRender = useRef(true);

  const registerLayout = useCallback((tabValue: string, layout: LayoutRectangle) => {
    setLayouts((prev) => {
      if (prev[tabValue]?.x === layout.x && prev[tabValue]?.width === layout.width) {
        return prev;
      }
      return { ...prev, [tabValue]: layout };
    });
  }, []);
  const listContext = useMemo(() => ({ registerLayout }), [registerLayout]);

  const activeLayout = layouts[value];

  useEffect(() => {
    if (!activeLayout) return;
    // A trigger's layout.x is measured from the list's border box, but the
    // absolutely positioned indicator starts inside the border, so the
    // border width comes off or the indicator sits that far to the right.
    const x = activeLayout.x - borderWidths.heavy;
    if (isFirstRender.current || reduceMotion) {
      translateX.value = x;
      isFirstRender.current = false;
    } else {
      translateX.value = withTiming(x, { duration: 150, easing: Easing.out(Easing.quad) });
    }
  }, [activeLayout, reduceMotion, translateX]);

  // Only translateX is animated. Triggers are flex: 1, so every tab has the
  // same width and the indicator's width is a plain (non-animated) style.
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <TabsListContext.Provider value={listContext}>
      <BrutalSurface
        style={[styles.listWrapper, { marginBottom: SHADOW_OFFSET + spacing.md }, style]}
        surfaceStyle={[styles.listSurface, { backgroundColor: colors.background }]}
        offset={SHADOW_OFFSET}
        borderWidth="heavy"
        pressable={false}
        accessibilityRole="tablist"
        {...props}
      >
        <Animated.View
          style={[
            styles.indicator,
            {
              width: activeLayout?.width ?? 0,
              backgroundColor: colors.foreground,
              borderColor: colors.border,
            },
            animatedIndicatorStyle,
          ]}
        />
        {children}
      </BrutalSurface>
    </TabsListContext.Provider>
  );
}

export function TabsTrigger({ value, disabled = false, children, style, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const { registerLayout } = useTabsListContext();
  const { colors } = useTheme();

  const isSelected = selectedValue === value;

  return (
    <Pressable
      onLayout={(e: LayoutChangeEvent) => registerLayout(value, e.nativeEvent.layout)}
      onPress={() => {
        if (!disabled) onValueChange(value);
      }}
      disabled={disabled}
      style={cn(
        styles.trigger,
        { minHeight: touchTarget, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
        style,
      )}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected, disabled }}
      aria-selected={isSelected}
      aria-disabled={disabled}
      {...props}
    >
      <Text
        style={cn(
          styles.triggerText,
          { fontSize: typography.sm, color: colors.foreground },
          isSelected && { color: colors.background },
          disabled && { color: colors.mutedForeground }
        )}
        numberOfLines={1}
        maxFontSizeMultiplier={1.3}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function TabsContent({ value, children, keepMounted = false, style, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  const isActive = selectedValue === value;

  if (!isActive && !keepMounted) {
    return null;
  }

  return (
    <View
      style={cn(styles.content, style, !isActive && styles.hidden)}
      pointerEvents={isActive ? 'auto' : 'none'}
      accessibilityElementsHidden={!isActive}
      importantForAccessibility={isActive ? 'auto' : 'no-hide-descendants'}
      {...props}
    >
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    flexDirection: 'column',
  },
  // stretch (not width: 100%) so the shadow's margin doesn't push past the parent.
  listWrapper: {
    alignSelf: 'stretch',
  },
  listSurface: {
    flexDirection: 'row',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    borderRightWidth: borderWidths.standard,
    borderLeftWidth: borderWidths.standard,
  },
  trigger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  triggerText: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  content: {
    alignSelf: 'stretch',
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
});
