import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  ViewProps, 
  PressableProps,
  LayoutChangeEvent,
  LayoutRectangle
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

import { borderWidths, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

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
   * The value of the currently selected tab.
   */
  value: string;
  /**
   * Callback fired when a tab is selected.
   */
  onValueChange: (value: string) => void;
  children?: React.ReactNode;
}

export interface TabsTriggerProps extends Omit<PressableProps, 'onPress'> {
  /**
   * The value of the tab. Must match a TabsContent value.
   */
  value: string;
  /**
   * Disables the trigger.
   * @default false
   */
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface TabsContentProps extends ViewProps {
  /**
   * The value that activates this content block.
   */
  value: string;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function Tabs({ value, onValueChange, children, style, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View style={cn(styles.root, style)} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, style, ...props }: ViewProps) {
  const { value } = useTabsContext();
  const { colors } = useTheme();
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
  
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const isFirstRender = useSharedValue(true);

  const registerLayout = useCallback((tabValue: string, layout: LayoutRectangle) => {
    setLayouts((prev) => {
      if (prev[tabValue]?.x === layout.x && prev[tabValue]?.width === layout.width) {
        return prev;
      }
      return { ...prev, [tabValue]: layout };
    });
  }, []);

  useEffect(() => {
    const activeLayout = layouts[value];
    
    if (activeLayout) {
      if (isFirstRender.value) {
        translateX.value = activeLayout.x;
        indicatorWidth.value = activeLayout.width;
        isFirstRender.value = false;
      } else {
        translateX.value = withTiming(activeLayout.x, { 
          duration: 150, 
          easing: Easing.out(Easing.quad) 
        });
        indicatorWidth.value = withTiming(activeLayout.width, { 
          duration: 150, 
          easing: Easing.out(Easing.quad) 
        });
      }
    }
  }, [value, layouts, translateX, indicatorWidth, isFirstRender]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <TabsListContext.Provider value={{ registerLayout }}>
      <BrutalSurface
        style={[styles.listWrapper, style]}
        surfaceStyle={[styles.listSurface, { backgroundColor: colors.background }]}
        offset={SHADOW_OFFSET}
        borderWidth="heavy"
        pressable={false}
        accessibilityRole="tablist"
        {...props}
      >
        <Animated.View style={[styles.indicator, { backgroundColor: colors.foreground, borderColor: colors.border }, animatedIndicatorStyle]} />
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

  const handleLayout = (e: LayoutChangeEvent) => {
    registerLayout(value, e.nativeEvent.layout);
  };

  const handlePress = () => {
    if (!disabled) {
      onValueChange(value);
    }
  };

  return (
    <Pressable
      onLayout={handleLayout}
      onPress={handlePress}
      disabled={disabled}
      style={cn(styles.trigger, style)}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected, disabled }}
      {...props}
    >
      <Text 
        style={cn(
          styles.triggerText, 
          { color: colors.foreground },
          isSelected && { color: colors.background },
          disabled && { color: colors.mutedForeground }
        )}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function TabsContent({ value, children, style, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  
  if (selectedValue !== value) {
    return null;
  }

  return (
    <View 
      style={cn(styles.content, style)} 
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
    width: '100%',
    flexDirection: 'column',
  },
  listWrapper: {
    width: '100%',
    marginBottom: SHADOW_OFFSET + spacing.md,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  triggerText: {
    fontSize: typography.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  content: {
    width: '100%',
  },
});