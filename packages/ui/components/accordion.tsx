import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  ViewProps, 
  PressableProps,
  LayoutChangeEvent
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { borderWidths, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface AccordionContextState {
  activeValues: string[];
  toggleValue: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextState | undefined>(undefined);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an <Accordion />');
  }
  return context;
}

interface AccordionItemContextState {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextState | undefined>(undefined);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionTrigger and AccordionContent must be used within an <AccordionItem />');
  }
  return context;
}

export interface AccordionProps extends ViewProps {
  /**
   * Defines if multiple items can be open at the same time.
   * @default 'single'
   */
  type?: 'single' | 'multiple';
  /**
   * The controlled value(s) of the open item(s).
   */
  value?: string | string[];
  /**
   * Initial open value(s) for uncontrolled usage.
   */
  defaultValue?: string | string[];
  /**
   * Callback fired when the open state changes. Receives a single string in
   * `'single'` mode (empty string when all items are closed) or a string
   * array in `'multiple'` mode.
   */
  onValueChange?: (value: string | string[]) => void;
}

export interface AccordionItemProps extends ViewProps {
  /**
   * The unique value of the item.
   */
  value: string;
}

export interface AccordionTriggerProps extends Omit<PressableProps, 'onPress' | 'children'> {
  /**
   * Disables the trigger.
   * @default false
   */
  disabled?: boolean;
  /**
   * Trigger content. Plain strings/numbers render in the default heading
   * style; anything else renders as-is (function-as-child is not supported).
   */
  children?: ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Accordion({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...props
}: AccordionProps) {
  const [internalValues, setInternalValues] = useState<string[]>(() =>
    defaultValue === undefined
      ? []
      : Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue],
  );

  const isControlled = value !== undefined;
  
  const activeValues = isControlled 
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : internalValues;

  const toggleValue = useCallback((itemValue: string) => {
    let newValues: string[];
    const isCurrentlyOpen = activeValues.includes(itemValue);

    if (type === 'single') {
      newValues = isCurrentlyOpen ? [] : [itemValue];
    } else {
      newValues = isCurrentlyOpen 
        ? activeValues.filter(v => v !== itemValue)
        : [...activeValues, itemValue];
    }

    if (!isControlled) {
      setInternalValues(newValues);
    }

    if (onValueChange) {
      onValueChange(type === 'single' ? newValues[0] || '' : newValues);
    }
  }, [type, activeValues, isControlled, onValueChange]);

  return (
    <AccordionContext.Provider value={{ activeValues, toggleValue }}>
      <View style={cn(styles.root, style)} {...props}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children, style, ...props }: AccordionItemProps) {
  const { activeValues } = useAccordionContext();
  const { colors } = useTheme();
  const isOpen = activeValues.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <View style={cn(styles.item, { borderColor: colors.border, backgroundColor: colors.background }, style)} {...props}>
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({ disabled = false, children, style, ...props }: AccordionTriggerProps) {
  const { toggleValue } = useAccordionContext();
  const { value, isOpen } = useAccordionItemContext();
  const { colors } = useTheme();
  
  const isPressed = useSharedValue(0);
  const rotation = useSharedValue(isOpen ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(isOpen ? 180 : 0, { 
      duration: 200, 
      easing: Easing.out(Easing.quad) 
    });
  }, [isOpen, rotation]);

  const handlePressIn = () => {
    if (disabled) return;
    isPressed.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    if (disabled) return;
    isPressed.value = withTiming(0, { duration: 80, easing: Easing.in(Easing.quad) });
  };

  const handlePress = () => {
    if (disabled) return;
    toggleValue(value);
  };

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      isPressed.value,
      [0, 1],
      [colors.background, colors.muted]
    ),
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.trigger,
        disabled && { backgroundColor: colors.muted },
        animatedBackgroundStyle,
        style
      ]}
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen, disabled }}
      {...props}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          style={cn(styles.triggerText, { color: disabled ? colors.mutedForeground : colors.foreground })}
          numberOfLines={1}
        >
          {children}
        </Text>
      ) : (
        children
      )}
      
      <Animated.View style={[styles.chevronContainer, animatedChevronStyle]}>
        <Svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={disabled ? colors.mutedForeground : colors.foreground} 
          strokeWidth="4"
          strokeLinecap="square" 
          strokeLinejoin="miter"
        >
          <Path d="M6 9l6 6 6-6" />
        </Svg>
      </Animated.View>
    </AnimatedPressable>
  );
}

export function AccordionContent({ children, style, ...props }: ViewProps) {
  const { isOpen } = useAccordionItemContext();
  const { colors } = useTheme();
  const [contentHeight, setContentHeight] = useState(0);
  const height = useSharedValue(0);

  useEffect(() => {
    if (contentHeight > 0) {
      height.value = withTiming(isOpen ? contentHeight : 0, {
        duration: 250,
        easing: Easing.out(Easing.quad)
      });
    }
  }, [isOpen, contentHeight, height]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== contentHeight) {
      setContentHeight(h);
    }
  };

  const animatedHeightStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[styles.contentWrapper, animatedHeightStyle]}
      pointerEvents={isOpen ? 'auto' : 'none'}
      accessible={!isOpen ? false : undefined}
      accessibilityElementsHidden={!isOpen}
      importantForAccessibility={isOpen ? 'auto' : 'no-hide-descendants'}
    >
      <View 
        onLayout={handleLayout} 
        style={cn(styles.contentInner, { borderColor: colors.border }, style)}
        {...props}
      >
        {children}
      </View>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  item: {
    borderBottomWidth: borderWidths.heavy,
  },
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  triggerText: {
    flex: 1,
    fontSize: typography.md,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chevronContainer: {
    marginLeft: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  contentInner: {
    position: 'absolute',
    width: '100%',
    padding: spacing.md,
    borderTopWidth: borderWidths.standard,
  },
});