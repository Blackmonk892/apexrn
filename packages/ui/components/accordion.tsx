import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { borderWidths, spacing, touchTarget } from '../lib/colors';
import { ChevronDownIcon } from '../lib/icons';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';
import Text from './text';

export interface AccordionProps extends ViewProps {
  /** `single` keeps at most one item open. @default 'single' */
  type?: 'single' | 'multiple';
  /** Controlled open value(s). Omit for an uncontrolled accordion. */
  value?: string | string[];
  /** Initial open value(s) when uncontrolled. */
  defaultValue?: string | string[];
  /** Receives a string in `single` mode (empty when all are closed) or a string array in `multiple`. */
  onValueChange?: (value: string | string[]) => void;
}

export interface AccordionItemProps extends ViewProps {
  value: string;
  /** Disables this item's trigger and dashes its border. @default false */
  disabled?: boolean;
}

export interface AccordionTriggerProps extends Omit<PressableProps, 'onPress' | 'children' | 'style'> {
  /** Style for the pressable row. */
  style?: StyleProp<ViewStyle>;
  /** Plain strings render in the `strong` text style; any other node renders as-is. */
  children?: ReactNode;
}

interface AccordionContextValue {
  activeValues: string[];
  toggle: (value: string) => void;
}

interface ItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

const AnimatedView = Animated.createAnimatedComponent(View);

const toArray = (v: string | string[] | undefined): string[] =>
  v === undefined || v === '' ? [] : Array.isArray(v) ? v : [v];

function useItem(part: string) {
  const item = useContext(ItemContext);
  if (!item) throw new Error(`${part} must be used within AccordionItem`);
  return item;
}

export function Accordion({ type = 'single', value, defaultValue, onValueChange, style, children, ...props }: AccordionProps) {
  const [internal, setInternal] = useState(() => toArray(defaultValue));
  const controlled = value !== undefined;
  const activeValues = controlled ? toArray(value) : internal;

  const context = useMemo<AccordionContextValue>(
    () => ({
      activeValues,
      toggle: (item) => {
        const isOpen = activeValues.includes(item);
        const next =
          type === 'single'
            ? isOpen ? [] : [item]
            : isOpen ? activeValues.filter((v) => v !== item) : [...activeValues, item];
        if (!controlled) setInternal(next);
        onValueChange?.(type === 'single' ? (next[0] ?? '') : next);
      },
    }),
    [activeValues, type, controlled, onValueChange],
  );

  return (
    <AccordionContext.Provider value={context}>
      <View style={cn({ alignSelf: 'stretch', gap: spacing.sm }, style)} {...props}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, disabled = false, style, children, ...props }: AccordionItemProps) {
  const accordion = useContext(AccordionContext);
  if (!accordion) throw new Error('AccordionItem must be used within Accordion');

  const open = accordion.activeValues.includes(value);
  const context = useMemo(() => ({ value, open, disabled }), [value, open, disabled]);

  return (
    <ItemContext.Provider value={context}>
      <BrutalSurface pressable={false} elevation="flat" borderWidth="control" disabled={disabled} style={style} {...props}>
        {children}
      </BrutalSurface>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({ style, children, ...props }: AccordionTriggerProps) {
  const accordion = useContext(AccordionContext);
  const item = useItem('AccordionTrigger');
  if (!accordion) throw new Error('AccordionTrigger must be used within Accordion');

  const { colors } = useTheme();
  const { selection, reduceMotion } = useMotion();
  const { open, disabled } = item;

  const turn = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    turn.value = withTiming(open ? 1 : 0, selection);
  }, [open, selection, turn]);

  // Reduced motion drops the rotation; the chevron flips at once with the state.
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${reduceMotion ? (open ? 180 : 0) : turn.value * 180}deg` }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open, disabled }}
      disabled={disabled}
      onPress={() => accordion.toggle(item.value)}
      style={({ pressed }) => [
        styles.trigger,
        { gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
        !disabled && pressed && { backgroundColor: colors.muted },
        style as ViewStyle,
      ]}
      {...props}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text variant="strong" tone={disabled ? 'muted' : 'default'} style={styles.label}>
          {children}
        </Text>
      ) : (
        children
      )}
      <AnimatedView
        style={chevronStyle}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <ChevronDownIcon size={20} color={disabled ? colors.mutedForeground : colors.foreground} />
      </AnimatedView>
    </Pressable>
  );
}

export function AccordionContent({ style, children, ...props }: ViewProps) {
  const { open } = useItem('AccordionContent');
  const { colors } = useTheme();
  const { enter, exit, reduceMotion } = useMotion();
  const [measured, setMeasured] = useState(0);

  // An item that starts open appears open instead of growing from zero on mount.
  const progress = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, open ? enter : exit);
  }, [open, enter, exit, progress]);

  const onLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h > 0) setMeasured(h);
  };

  // Height animates because the rows below must be pushed down as the panel opens and no
  // transform can reflow siblings. The panel's own content only fades and slides.
  const clipStyle = useAnimatedStyle(() => ({ height: measured * progress.value }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: reduceMotion ? 0 : (progress.value - 1) * spacing.sm }],
  }));

  return (
    <AnimatedView
      style={[styles.clip, clipStyle]}
      pointerEvents={open ? 'auto' : 'none'}
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
    >
      <AnimatedView
        onLayout={onLayout}
        style={[styles.panel, { padding: spacing.md, borderTopColor: colors.border }, style, panelStyle]}
        {...props}
      >
        {children}
      </AnimatedView>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTarget,
  },
  label: { flex: 1 },
  clip: { overflow: 'hidden' },
  // Absolute so its natural height can be measured while the clip is collapsed.
  panel: { position: 'absolute', left: 0, right: 0, borderTopWidth: borderWidths.control },
});

export default Accordion;
