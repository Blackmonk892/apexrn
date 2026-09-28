import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  View,
  ViewProps,
  PressableProps,
  LayoutRectangle,
  useWindowDimensions,
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import ListItem from './listitem';

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);

  const setIsOpen = useCallback((nextOpen: boolean) => {
    onOpenChange(nextOpen);
  }, [onOpenChange]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <DropdownContext.Provider value={{ isOpen: open, setIsOpen, close, triggerLayout, setTriggerLayout }}>
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
    // measurement would silently fall back). Instead measure this wrapper.
    const child = children as ReactElement<{
      onPress?: (e: GestureResponderEvent) => void;
    }>;
    return (
      <View ref={triggerRef} collapsable={false}>
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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      scale.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) });
    } else if (isModalVisible) {
      scale.value = withTiming(0, { duration: 100, easing: Easing.in(Easing.quad) });
      opacity.value = withTiming(0, { duration: 100, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(setIsModalVisible)(false);
        }
      });
    }
  }, [isOpen, isModalVisible, scale, opacity]);

  const handleClose = () => {
    close();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: interpolate(scale.value, [0, 1], [0.85, 1]) }
    ],
  }));

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  // Position anchored to the trigger, clamped on-screen with room for the
  // shadow offset. Falls back to a visible default when unmeasured.
  const MENU_WIDTH = 200;
  const MENU_MAX_HEIGHT = 320;
  const topPosition = triggerLayout
    ? Math.max(
        spacing.sm,
        Math.min(
          triggerLayout.y + triggerLayout.height + spacing.xs,
          SCREEN_HEIGHT - MENU_MAX_HEIGHT - spacing.lg,
        ),
      )
    : 100;

  const leftPosition = triggerLayout
    ? Math.max(spacing.sm, Math.min(triggerLayout.x, SCREEN_WIDTH - MENU_WIDTH - spacing.sm))
    : spacing.lg;

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={styles.portalOverlay}>
        <AnimatedPressable
          style={styles.backdrop}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss Dropdown"
        />

        <Animated.View
          style={[
            styles.menuWrapper,
            style,
            {
              top: topPosition,
              left: leftPosition,
              width: MENU_WIDTH,
              maxHeight: MENU_MAX_HEIGHT,
            },
            animatedStyle,
          ]}
          accessibilityRole="menu"
          {...props}
        >
          <View style={[styles.shadow, { backgroundColor: colors.shadow, borderColor: colors.border }]} />
          
          <View style={[styles.surface, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {children}
          </View>
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
      style={[styles.menuItem, { borderColor: colors.border }]}
      accessibilityRole="menuitem"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
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
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
    zIndex: 1,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    borderWidth: borderWidths.heavy,
    borderRadius: 0,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  menuItem: {
    borderBottomWidth: borderWidths.standard,
    paddingVertical: spacing.sm, 
    paddingHorizontal: spacing.sm,
  },
});