import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  type LayoutChangeEvent,
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
import Svg, { Path } from 'react-native-svg';

import { borderWidths, spacing, touchTarget, typography } from '../lib/colors';
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

export interface AccordionTriggerProps extends Omit<PressableProps, 'onPress' | 'children' | 'style'> {
  /**
   * Outer style of the trigger row. Function styles are not supported.
   */
  style?: StyleProp<ViewStyle>;
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

  const { colors } = useTheme();
  const context = useMemo(() => ({ activeValues, toggleValue }), [activeValues, toggleValue]);

  return (
    <AccordionContext.Provider value={context}>
      <View style={cn(styles.root, { borderTopColor: colors.border }, style)} {...props}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children, style, ...props }: AccordionItemProps) {
  const { activeValues } = useAccordionContext();
  const { colors } = useTheme();
  const isOpen = activeValues.includes(value);
  const itemContext = useMemo(() => ({ value, isOpen }), [value, isOpen]);

  return (
    <AccordionItemContext.Provider value={itemContext}>
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
  const reduceMotion = useReducedMotion();

  // Pressed = accent fill with its own foreground (same as ListItem). It
  // switches instantly: tap feedback should not lag the finger.
  const [pressed, setPressed] = useState(false);
  const rotation = useSharedValue(isOpen ? 180 : 0);

  useEffect(() => {
    const to = isOpen ? 180 : 0;
    rotation.value = reduceMotion ? to : withTiming(to, { duration: 200, easing: Easing.out(Easing.quad) });
  }, [isOpen, reduceMotion, rotation]);

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const fg = disabled
    ? colors.mutedForeground
    : pressed
      ? colors.accentForeground
      : colors.foreground;

  return (
    <Pressable
      onPressIn={() => !disabled && setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        if (!disabled) toggleValue(value);
      }}
      disabled={disabled}
      style={[
        styles.trigger,
        {
          minHeight: touchTarget,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          backgroundColor: disabled ? colors.muted : pressed ? colors.accent : colors.background,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen, disabled }}
      aria-expanded={isOpen}
      aria-disabled={disabled}
      {...props}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          style={cn(styles.triggerText, { fontSize: typography.md, color: fg })}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {children}
        </Text>
      ) : (
        children
      )}

      <Animated.View
        style={[styles.chevronContainer, { marginLeft: spacing.md }, animatedChevronStyle]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <Svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={fg}
          strokeWidth="4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        >
          <Path d="M6 9l6 6 6-6" />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

export function AccordionContent({ children, style, ...props }: ViewProps) {
  const { isOpen } = useAccordionItemContext();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [contentHeight, setContentHeight] = useState(0);
  const height = useSharedValue(0);
  const hasMeasured = useRef(false);

  useEffect(() => {
    if (contentHeight <= 0) return;
    const to = isOpen ? contentHeight : 0;
    if (!hasMeasured.current) {
      // First measurement: an item that starts open must appear open, not
      // animate up from zero on mount.
      hasMeasured.current = true;
      height.value = to;
      return;
    }
    height.value = reduceMotion ? to : withTiming(to, { duration: 250, easing: Easing.out(Easing.quad) });
  }, [isOpen, contentHeight, reduceMotion, height]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== contentHeight) {
      setContentHeight(h);
    }
  };

  // Height is animated on purpose: an expanding panel has to push the rows
  // below it, and there is no transform-only way to reflow siblings.
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
        style={cn(styles.contentInner, { padding: spacing.md, borderColor: colors.border }, style)}
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
    alignSelf: 'stretch',
    borderTopWidth: borderWidths.heavy,
  },
  item: {
    borderBottomWidth: borderWidths.heavy,
  },
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerText: {
    flex: 1,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chevronContainer: {
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
    borderTopWidth: borderWidths.standard,
  },
});