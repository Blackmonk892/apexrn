import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  type LayoutChangeEvent,
  type LayoutRectangle,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewProps,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { borderWidths, spacing, touchTarget, typography } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

// Above this the label would not fit its slot, so the bar falls back to icons.
const MAX_LABEL_FONT_SCALE = 1.3;

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface BottomNavContextState {
  value: string;
  showLabel: boolean;
  onValueChange: (value: string) => void;
  registerLayout: (value: string, layout: LayoutRectangle) => void;
}

const BottomNavContext = createContext<BottomNavContextState | undefined>(undefined);

function useBottomNavContext() {
  const context = useContext(BottomNavContext);
  if (!context) {
    throw new Error('BottomNavItem must be used within a <BottomNav />');
  }
  return context;
}

export interface BottomNavProps extends ViewProps {
  /** Selected destination. Omit for an uncontrolled bar. */
  value?: string;
  /** Initial destination when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * Home-indicator inset. Pass `useSafeAreaInsets().bottom`. The selected block
   * extends through it so the bar reads as one slab. @default 0
   */
  bottomInset?: number;
  children?: ReactNode;
}

export interface BottomNavItemProps extends Omit<PressableProps, 'onPress' | 'style' | 'children'> {
  /** Destination id reported through `onValueChange`. */
  value: string;
  /** Shown on the selected item only (hidden above 1.3x font scale); always the accessibility label. */
  label: string;
  /** Icon element, or a function receiving the contrast colour for the current state. */
  icon?: ReactNode | ((color: string) => ReactNode);
  /** Count or tag pinned to the icon. `0`/empty hides it. */
  badge?: string | number;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
export function BottomNav({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  bottomInset = 0,
  children,
  style,
  ...props
}: BottomNavProps) {
  const { colors } = useTheme();
  const { selection, reduceMotion } = useMotion();
  const { fontScale } = useWindowDimensions();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : internalValue;
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const placed = useRef(false);

  const registerLayout = useCallback((itemValue: string, layout: LayoutRectangle) => {
    setLayouts((prev) => {
      const old = prev[itemValue];
      if (old && old.x === layout.x && old.width === layout.width) return prev;
      return { ...prev, [itemValue]: layout };
    });
  }, []);

  const context = useMemo<BottomNavContextState>(
    () => ({
      value,
      showLabel: fontScale <= MAX_LABEL_FONT_SCALE,
      registerLayout,
      onValueChange: (next) => {
        if (!controlled) setInternalValue(next);
        onValueChange?.(next);
      },
    }),
    [value, fontScale, controlled, onValueChange, registerLayout],
  );

  const active = layouts[value];

  useEffect(() => {
    if (!active) {
      opacity.value = 0;
      return;
    }
    opacity.value = 1;
    if (!placed.current || reduceMotion) {
      translateX.value = active.x;
      placed.current = true;
    } else {
      translateX.value = withTiming(active.x, selection);
    }
  }, [active, reduceMotion, selection, translateX, opacity]);

  // Items share one width, so the slab's width is a plain style and only translateX animates.
  const slabStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <BottomNavContext.Provider value={context}>
      <BrutalSurface
        pressable={false}
        elevation="flat"
        borderWidth="container"
        style={cn({ alignSelf: 'stretch' }, style)}
        surfaceStyle={[styles.surface, { paddingBottom: bottomInset }]}
        accessibilityRole="tablist"
        {...props}
      >
        <Animated.View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[styles.slab, { width: active?.width ?? 0, backgroundColor: colors.foreground }, slabStyle]}
        />
        <View style={styles.items}>{children}</View>
      </BrutalSurface>
    </BottomNavContext.Provider>
  );
}

export function BottomNavItem({
  value,
  label,
  icon,
  badge,
  disabled = false,
  ...props
}: BottomNavItemProps) {
  const { value: selected, showLabel, onValueChange, registerLayout } = useBottomNavContext();
  const { colors } = useTheme();
  const isSelected = selected === value;
  const fg = disabled ? colors.mutedForeground : isSelected ? colors.background : colors.foreground;
  const showBadge = badge !== undefined && badge !== '' && badge !== 0;

  return (
    <Pressable
      onLayout={(e: LayoutChangeEvent) => registerLayout(value, e.nativeEvent.layout)}
      onPress={() => {
        if (!disabled) onValueChange(value);
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        { minHeight: touchTarget + spacing.lg, paddingVertical: spacing.sm, gap: spacing.xs },
        // The selected slab supplies its own fill; only idle items tint on press.
        pressed && !isSelected && !disabled && { backgroundColor: colors.muted },
      ]}
      accessibilityRole="tab"
      accessibilityLabel={showBadge ? `${label}, ${badge}` : label}
      accessibilityState={{ selected: isSelected, disabled }}
      aria-selected={isSelected}
      aria-disabled={disabled}
      {...props}
    >
      <View style={styles.iconWrap} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {icon ? (typeof icon === 'function' ? icon(fg) : icon) : null}
        {showBadge ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primary,
                borderColor: colors.border,
                paddingHorizontal: spacing.xs,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
              style={[styles.badgeText, { color: colors.primaryForeground, fontSize: typography.xs - 2 }]}
            >
              {typeof badge === 'number' && badge > 99 ? '99+' : badge}
            </Text>
          </View>
        ) : null}
      </View>
      {isSelected && showLabel ? (
        <Text
          numberOfLines={1}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          maxFontSizeMultiplier={1.2}
          style={[styles.label, { color: fg, fontSize: typography.xs }]}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  surface: { overflow: 'hidden' },
  slab: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  items: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badge: {
    position: 'absolute',
    top: -10,
    // Starts at the icon's centre and grows rightwards, so a wide tag like
    // "NEW" never covers the glyph.
    left: 14,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidths.control,
  },
  badgeText: {
    fontWeight: '900',
  },
});
