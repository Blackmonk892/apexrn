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
  Modal,
  Pressable,
  type PressableProps,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewProps,
} from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { borderWidths, opacity, spacing } from '../lib/colors';
import { CloseIcon } from '../lib/icons';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import Text from './text';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DropdownContextState {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchor: Rect | null;
  setAnchor: (rect: Rect) => void;
}

const DropdownContext = createContext<DropdownContextState | undefined>(undefined);

function useDropdownContext(part: string) {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(`${part} must be used within DropdownMenu`);
  }
  return context;
}

export interface DropdownMenuProps {
  /** Controlled open state. Omit for an uncontrolled menu. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface DropdownMenuTriggerProps extends Omit<PressableProps, 'children'> {
  /** Clone the single child and inject `onPress` instead of rendering a Pressable. */
  asChild?: boolean;
  children?: ReactNode;
}

export interface DropdownMenuItemProps extends Omit<PressableProps, 'style' | 'children' | 'onPress'> {
  label: string;
  description?: string;
  /** Leading icon or glyph. A destructive item shows its status icon here instead. */
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Runs when the item is chosen, before the menu closes. */
  onSelect?: () => void;
  /** Destructive text plus a status icon; colour is never the only signal. */
  destructive?: boolean;
}

// The panel grows to its widest item up to the window edge; height is capped so long menus scroll.
const MENU_MIN_WIDTH = 220;
const MENU_MAX_HEIGHT = 320;
const ITEM_MIN_HEIGHT = 48;
const ENTER_OFFSET = 6;

export function DropdownMenu({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const context = useMemo(() => ({ open, setOpen, anchor, setAnchor }), [open, setOpen, anchor]);

  return <DropdownContext.Provider value={context}>{children}</DropdownContext.Provider>;
}

export function DropdownMenuTrigger({ asChild, children, onPress, ...props }: DropdownMenuTriggerProps) {
  const { open, setOpen, setAnchor } = useDropdownContext('DropdownMenuTrigger');
  const ref = useRef<View>(null);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const node = ref.current;
    if (!node) {
      setOpen(true);
      return;
    }
    // Window coordinates match the Modal's coordinate space; plain measure() is parent-relative on some platforms.
    node.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error('DropdownMenuTrigger with asChild needs a single React element child');
    }
    const child = children as ReactElement<{ onPress?: (e: GestureResponderEvent) => void }>;
    // Function components such as Button don't forward a ref, so measure a wrapper that hugs the child.
    return (
      <View ref={ref} collapsable={false} style={styles.wrapper}>
        {cloneElement(child, {
          onPress: (e: GestureResponderEvent) => {
            child.props.onPress?.(e);
            toggle();
          },
        })}
      </View>
    );
  }

  return (
    <Pressable
      ref={ref}
      collapsable={false}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      aria-haspopup="menu"
      hitSlop={8}
      {...props}
      onPress={(e) => {
        onPress?.(e);
        toggle();
      }}
    >
      {children}
    </Pressable>
  );
}

export function DropdownMenuContent({ children, style, ...props }: ViewProps) {
  const { open, setOpen, anchor } = useDropdownContext('DropdownMenuContent');
  const { colors, elevation } = useTheme();
  const { reduceMotion, enter, exit } = useMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  // The Modal stays mounted until the exit animation finishes.
  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      progress.value = withTiming(1, enter);
    } else {
      // On a first closed render 0 -> 0 completes at once and unmounting a hidden Modal is a no-op.
      progress.value = withTiming(0, exit, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
    // enter/exit change identity only when reduced motion flips, which is already a dependency.
  }, [open, reduceMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  const reserve = elevation.overlay;
  const gap = spacing.xs;
  const edge = spacing.sm;

  // Below the trigger by default; above it when the capped panel doesn't fit below and there is more room above.
  let position: { left: number; top?: number; bottom?: number };
  let maxHeight = MENU_MAX_HEIGHT;
  let flipped = false;
  if (anchor) {
    const left = Math.max(edge, Math.min(anchor.x, windowWidth - MENU_MIN_WIDTH - reserve - edge));
    const below = windowHeight - (anchor.y + anchor.height) - gap - reserve - edge;
    const above = anchor.y - gap - edge;
    flipped = below < MENU_MAX_HEIGHT && above > below;
    maxHeight = Math.min(MENU_MAX_HEIGHT, Math.max(ITEM_MIN_HEIGHT, flipped ? above : below));
    position = flipped
      ? { left, bottom: windowHeight - anchor.y + gap }
      : { left, top: anchor.y + anchor.height + gap };
  } else {
    position = { left: spacing.lg, top: windowHeight / 4 };
  }

  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: reduceMotion ? [] : [{ translateY: (1 - progress.value) * ENTER_OFFSET * (flipped ? 1 : -1) }],
  }));

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={mounted}
      animationType="none"
      onRequestClose={() => setOpen(false)}
    >
      <View accessibilityViewIsModal style={StyleSheet.absoluteFill}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        />
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.panel,
            position,
            { minWidth: MENU_MIN_WIDTH + reserve, maxWidth: windowWidth - edge * 2 },
            panelStyle,
          ]}
        >
          <BrutalSurface
            pressable={false}
            elevation="overlay"
            backgroundColor={colors.background}
            surfaceStyle={{ overflow: 'hidden', maxHeight }}
          >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {/* Each item draws a bottom divider; the negative margin lets the last one sit under the surface border. */}
              <View accessibilityRole="menu" style={[{ marginBottom: -borderWidths.control }, style]} {...props}>
                {children}
              </View>
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
  onSelect,
  destructive = false,
  disabled,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownContext('DropdownMenuItem');
  const { colors } = useTheme();

  const select = () => {
    onSelect?.();
    setOpen(false);
  };

  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={select}
      {...props}
      style={({ pressed }) => [
        styles.item,
        {
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomColor: colors.border,
          backgroundColor: pressed ? (destructive ? colors.destructive : colors.foreground) : colors.background,
          opacity: disabled ? opacity.disabled : 1,
        },
      ]}
    >
      {({ pressed }) => {
        const ink = pressed
          ? destructive ? colors.destructiveForeground : colors.background
          : destructive ? colors.destructive : colors.foreground;
        return (
          <>
            {destructive ? <CloseIcon size={20} color={ink} /> : leading}
            <View style={styles.text}>
              <Text tone="inherit" style={{ color: ink }}>
                {label}
              </Text>
              {description ? (
                <Text tone="inherit" style={{ color: ink }}>
                  {description}
                </Text>
              ) : null}
            </View>
            {trailing}
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'flex-start' },
  panel: { position: 'absolute' },
  item: {
    minHeight: ITEM_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: borderWidths.control,
  },
  text: { flex: 1 },
});
