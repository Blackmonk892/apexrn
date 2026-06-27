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

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

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
}

export interface TabsContentProps extends ViewProps {
  /**
   * The value that activates this content block.
   */
  value: string;
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
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
  
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const isFirstRender = useSharedValue(true);

  const registerLayout = useCallback((tabValue: string, layout: LayoutRectangle) => {
    setLayouts((prev) => {
      // Prevent unnecessary state updates if layout hasn't changed
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
        // Snap instantly on mount to avoid a sliding-in-from-zero flash
        translateX.value = activeLayout.x;
        indicatorWidth.value = activeLayout.width;
        isFirstRender.value = false;
      } else {
        // Smooth linear transition for subsequent changes
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
      <View style={cn(styles.listWrapper, style)} accessibilityRole="tablist" {...props}>
        <View style={styles.listShadow} />
        <View style={styles.listSurface}>
          {/* The solid black block that translates behind the text.
            We only render it if width > 0 to prevent a 1px artifact on mount.
          */}
          <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
          {children}
        </View>
      </View>
    </TabsListContext.Provider>
  );
}

export function TabsTrigger({ value, disabled = false, children, style, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const { registerLayout } = useTabsListContext();
  
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
          isSelected && styles.triggerTextSelected,
          disabled && styles.triggerTextDisabled
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
      accessibilityRole="tabpanel"
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
    position: 'relative',
    width: '100%',
    // Reserve space so the hard shadow doesn't clip
    marginBottom: SHADOW_OFFSET + spacing.md,
    marginRight: SHADOW_OFFSET,
  },
  listShadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  listSurface: {
    position: 'relative',
    zIndex: 2,
    flexDirection: 'row',
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    borderRadius: 0,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.light.foreground,
    zIndex: 1, // Sits strictly behind the text layer
    // Ensures the indicator has the exact same brutal borders to visually merge
    borderRightWidth: borderWidths.standard,
    borderLeftWidth: borderWidths.standard,
    borderColor: colors.light.border,
  },
  trigger: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // Text layer strictly above the indicator
  },
  triggerText: {
    fontSize: typography.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.light.foreground,
  },
  triggerTextSelected: {
    // Inverts fully when the black active block translates behind it
    color: colors.light.background,
  },
  triggerTextDisabled: {
    color: colors.light.mutedForeground,
  },
  content: {
    width: '100%',
  },
});