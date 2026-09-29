import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  type GestureResponderEvent,
  type LayoutRectangle,
  Modal,
  Pressable,
  type PressableProps,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewProps,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import ListItem from './list-item';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface DropdownContextState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
  triggerLayout: LayoutRectangle | null;
  setTriggerLayout: (layout: LayoutRectangle) => void;
}

const DropdownContext = createContext<DropdownContextState | undefined>(undefined);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown sub-components must be used within a <DropdownMenu />');
  }
  return context;
}

export interface DropdownMenuProps {
  /**
   * The controlled open state. Omit for an uncontrolled menu.
   */
  open?: boolean;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface DropdownMenuItemProps extends Omit<PressableProps, 'style'> {
  label: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;
// Minimum width; the menu grows to its widest item, up to the screen edge.
const MENU_WIDTH = 220;
const MENU_MAX_HEIGHT = 320;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
export function DropdownMenu({ open: openProp, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : internalOpen;

  const setIsOpen = useCallback((nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [isControlled, onOpenChange]);

  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  const context = useMemo(
    () => ({ isOpen, setIsOpen, close, triggerLayout, setTriggerLayout }),
    [isOpen, setIsOpen, close, triggerLayout],
  );

  return (
    <DropdownContext.Provider value={context}>
      {children}
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, onPress, asChild, ...props }: PressableProps & { asChild?: boolean }) {
  const { isOpen, setIsOpen, setTriggerLayout } = useDropdownContext();
  const triggerRef = useRef<View>(null);

  const openFromMeasurement = useCallback(() => {
    // measure() is async: capture the node first so a null ref falls back
    // to the default position instead of throwing.
    const node = triggerRef.current;
    if (node) {
      node.measure((_x, _y, width, height, pageX, pageY) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height });
        setIsOpen(true);
      });
    } else {
      setIsOpen(true);
    }
  }, [setIsOpen, setTriggerLayout]);

  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(e);
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    openFromMeasurement();
  };

  if (asChild && isValidElement(children)) {
    // Never inject `ref` into an arbitrary child (e.g. `Button` is a
    // function component without forwardRef — the ref would be null and
    // measurement would silently fall back). Instead measure this wrapper,
    // which hugs the child (flex-start) so its rect is the child's rect.
    const child = children as ReactElement<{
      onPress?: (e: GestureResponderEvent) => void;
    }>;
    return (
      <View ref={triggerRef} collapsable={false} style={styles.triggerWrapper}>
        {cloneElement(child, {
          onPress: (e: GestureResponderEvent) => {
            child.props.onPress?.(e);
            handlePress(e);
          },
        })}
      </View>
    );
  }

  return (
    <Pressable
      ref={triggerRef}
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      {...props}
      onPress={handlePress}
    >
      {children}
    </Pressable>
  );
}

export function DropdownMenuContent({ children, style, ...props }: ViewProps) {
  const { isOpen, close, triggerLayout } = useDropdownContext();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // The Modal stays mounted until the exit animation finishes.
  const [isModalVisible, setIsModalVisible] = useState(isOpen);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      progress.value = withTiming(1, { duration: reduceMotion ? 0 : 120, easing: Easing.out(Easing.quad) });
    } else {
      // Also runs on first mount while closed: 0 -> 0 finishes immediately.
      progress.value = withTiming(0, { duration: reduceMotion ? 0 : 100, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(setIsModalVisible)(false);
        }
      });
    }
  }, [isOpen, reduceMotion, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.9, 1]) }],
  }));

  // Anchored under the trigger, flipped above it when there is not enough
  // room below, and clamped on-screen with room for the hard shadow.
  // Falls back to a visible default when the trigger was not measured.
  const gap = spacing.xs;
  const edge = spacing.sm;
  const left = triggerLayout
    ? Math.max(edge, Math.min(triggerLayout.x, screenWidth - MENU_WIDTH - SHADOW_OFFSET - edge))
    : spacing.lg;
  let vertical: { top: number } | { bottom: number };
  if (!triggerLayout) {
    vertical = { top: 100 };
  } else {
    const below = screenHeight - (triggerLayout.y + triggerLayout.height);
    const above = triggerLayout.y;
    const fitsBelow = below >= MENU_MAX_HEIGHT + SHADOW_OFFSET + gap + edge;
    vertical = fitsBelow || below >= above
      ? { top: Math.max(edge, triggerLayout.y + triggerLayout.height + gap) }
      : { bottom: Math.max(edge, screenHeight - triggerLayout.y + gap) };
  }
  const maxHeight = triggerLayout
    ? Math.min(MENU_MAX_HEIGHT, Math.max(120, 'top' in vertical ? screenHeight - vertical.top - SHADOW_OFFSET - edge : triggerLayout.y - gap - edge))
    : MENU_MAX_HEIGHT;

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      onRequestClose={close}
      accessibilityViewIsModal
    >
      <View style={styles.portalOverlay}>
        <Pressable
          style={styles.backdrop}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Dismiss Dropdown"
        />

        <Animated.View
          style={[
            styles.menuWrapper,
            { left, minWidth: MENU_WIDTH + SHADOW_OFFSET, maxWidth: screenWidth - left - edge, ...vertical },
            style,
            animatedStyle,
          ]}
          accessibilityRole="menu"
          {...props}
        >
          <BrutalSurface
            pressable={false}
            offset={SHADOW_OFFSET}
            borderWidth="heavy"
            backgroundColor={colors.background}
            surfaceStyle={[styles.surface, { maxHeight }]}
          >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {/* Every item draws a bottom divider; the negative margin lets
                  the last one slide under the surface border instead of
                  doubling it. */}
              <View style={{ marginBottom: -borderWidths.standard }}>{children}</View>
            </ScrollView>
          </BrutalSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function DropdownMenuItem({
  label,
  description,
  leading,
  trailing,
  onPress,
  disabled,
  ...props
}: DropdownMenuItemProps) {
  const { close } = useDropdownContext();
  const { colors } = useTheme();

  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(e);
    close();
  };

  return (
    <ListItem
      title={label}
      description={description}
      leading={leading}
      trailing={trailing}
      disabled={!!disabled}
      onPress={handlePress}
      style={[{ borderColor: colors.border, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }]}
      accessibilityRole="menuitem"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  triggerWrapper: {
    alignSelf: 'flex-start',
  },
  portalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  menuWrapper: {
    position: 'absolute',
    zIndex: 1,
  },
  surface: {
    overflow: 'hidden',
    flexDirection: 'column',
  },
});
