import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  type GestureResponderEvent,
  Modal,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
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
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { borderWidths, controlHeight, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import Badge from './badge';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface DrawerContextState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextState | undefined>(undefined);

function useDrawerContext() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer components must be used within a <Drawer />');
  }
  return context;
}

// DrawerHeader reaches under the status bar, so it needs the inset that
// DrawerContent reserved.
const DrawerLayoutContext = createContext<{ topInset: number }>({ topInset: 0 });

export interface DrawerProps {
  /** Controlled open state. Omit for an uncontrolled drawer. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface DrawerContentProps extends ViewProps {
  /** Edge the drawer slides from. @default 'left' */
  side?: 'left' | 'right';
  /** Panel width. Capped at 85% of the window. @default 320 */
  width?: number;
  /** Status bar / notch inset. Pass `useSafeAreaInsets().top`. @default 0 */
  topInset?: number;
  /** Home-indicator inset. Pass `useSafeAreaInsets().bottom`. @default 0 */
  bottomInset?: number;
  /** Swipe the panel towards its edge to close. @default true */
  swipeToClose?: boolean;
  /** Accessibility label of the scrim's close action. @default 'Close menu' */
  dismissLabel?: string;
  children?: ReactNode;
}

export interface DrawerHeaderProps extends ViewProps {
  title: string;
  subtitle?: string;
}

export interface DrawerItemProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  /** Icon element, or a function receiving the contrast colour for the current state. */
  icon?: ReactNode | ((color: string) => ReactNode);
  /** Trailing count/tag. A string or number renders as a Badge. */
  badge?: string | number | ReactNode;
  /** Marks the current destination: inverted fill plus an accent stripe. */
  active?: boolean;
  /** Close the drawer after the press. @default true */
  closeOnPress?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_WIDTH = 6;
const MAX_WIDTH_RATIO = 0.85;
const SCRIM_OPACITY = 0.5;
const STRIPE_WIDTH = 8;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
export function Drawer({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const context = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return <DrawerContext.Provider value={context}>{children}</DrawerContext.Provider>;
}

export function DrawerTrigger({
  children,
  onPress,
  asChild,
  ...props
}: PressableProps & { asChild?: boolean }) {
  const { setOpen } = useDrawerContext();

  const handlePress = (e: GestureResponderEvent) => {
    setOpen(true);
    onPress?.(e);
  };

  if (asChild && isValidElement(children)) {
    // Chain the child's own onPress instead of replacing it.
    const child = children as ReactElement<{ onPress?: (e: GestureResponderEvent) => void }>;
    return cloneElement(child, {
      onPress: (e: GestureResponderEvent) => {
        child.props.onPress?.(e);
        handlePress(e);
      },
    });
  }

  return (
    <Pressable accessibilityRole="button" onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DrawerContent({
  side = 'left',
  width = 320,
  topInset = 0,
  bottomInset = 0,
  swipeToClose = true,
  dismissLabel = 'Close menu',
  children,
  style,
  ...props
}: DrawerContentProps) {
  const { open, setOpen } = useDrawerContext();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();

  const panelWidth = Math.min(width, windowWidth * MAX_WIDTH_RATIO);
  // The hard shadow strip travels with the panel, so the slide distance
  // includes it or a sliver of shadow would stay on screen when closed.
  const travel = panelWidth + SHADOW_WIDTH;
  const sign = side === 'left' ? -1 : 1;
  const closedX = sign * travel;

  // The Modal stays mounted until the exit animation finishes.
  const [isVisible, setIsVisible] = useState(open);
  // 0 = open/docked, closedX = fully off-screen. One value drives the panel,
  // the scrim and the drag, so they can never disagree.
  const x = useSharedValue(closedX);
  const dragStart = useSharedValue(0);
  const duration = reduceMotion ? 0 : 220;

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      x.value = withTiming(0, { duration, easing: Easing.out(Easing.cubic) });
    } else {
      // Also runs on first mount while closed: closed -> closed finishes at
      // once and unmounting an already-hidden Modal is a no-op.
      x.value = withTiming(closedX, { duration: reduceMotion ? 0 : 180, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(setIsVisible)(false);
      });
    }
  }, [open, closedX, duration, reduceMotion, x]);

  const close = useCallback(() => setOpen(false), [setOpen]);

  const pan = Gesture.Pan()
    .enabled(swipeToClose)
    // Horizontal-only: vertical scrolling inside the panel is never stolen.
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      dragStart.value = x.value;
    })
    .onUpdate((event) => {
      const next = dragStart.value + event.translationX;
      // Clamp between docked and closed; the drawer never over-drags open.
      x.value = sign < 0 ? Math.min(0, Math.max(closedX, next)) : Math.max(0, Math.min(closedX, next));
    })
    .onEnd((event) => {
      const closedFraction = Math.abs(x.value) / travel;
      const flungShut = event.velocityX * sign > 500;
      if (closedFraction > 0.33 || flungShut) {
        x.value = withTiming(closedX, { duration: reduceMotion ? 0 : 150 }, (finished) => {
          if (finished) runOnJS(close)();
        });
      } else {
        x.value = withTiming(0, { duration: reduceMotion ? 0 : 150, easing: Easing.out(Easing.cubic) });
      }
    });

  const animatedPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  const animatedScrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [closedX, 0], [0, SCRIM_OPACITY], 'clamp'),
  }));

  const layout = useMemo(() => ({ topInset }), [topInset]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={close}
      accessibilityViewIsModal
    >
      {/* Android renders a Modal in its own window, outside the app's root
          GestureHandlerRootView, so the swipe-to-close needs its own. */}
      <GestureHandlerRootView style={styles.root}>
        <AnimatedPressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, animatedScrimStyle]}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={dismissLabel}
        />

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.panelWrap,
              side === 'left' ? styles.left : styles.right,
              { width: travel, flexDirection: side === 'left' ? 'row' : 'row-reverse' },
              animatedPanelStyle,
            ]}
          >
            <DrawerLayoutContext.Provider value={layout}>
              <View
                style={cn(
                  styles.panel,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    paddingTop: topInset,
                    paddingBottom: bottomInset,
                  },
                  side === 'left'
                    ? { borderRightWidth: borderWidths.extraHeavy }
                    : { borderLeftWidth: borderWidths.extraHeavy },
                  style,
                )}
                {...props}
              >
                {children}
              </View>
            </DrawerLayoutContext.Provider>
            <View style={{ width: SHADOW_WIDTH, backgroundColor: colors.shadow }} />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

export function DrawerHeader({ title, subtitle, style, children, ...props }: DrawerHeaderProps) {
  const { colors } = useTheme();
  const { topInset } = useContext(DrawerLayoutContext);

  return (
    <View
      style={cn(
        styles.header,
        {
          backgroundColor: colors.foreground,
          borderBottomColor: colors.border,
          // Pull up over the panel's inset padding so the fill reaches the top edge.
          marginTop: -topInset,
          paddingTop: topInset + spacing.lg,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.lg,
          gap: spacing.xs,
        },
        style,
      )}
      {...props}
    >
      <Text
        accessibilityRole="header"
        numberOfLines={2}
        maxFontSizeMultiplier={1.3}
        style={[styles.headerTitle, { color: colors.background, fontSize: typography['2xl'] }]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
          style={[styles.headerSubtitle, { color: colors.background, fontSize: typography.xs }]}
        >
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function DrawerItem({
  label,
  icon,
  badge,
  active = false,
  closeOnPress = true,
  disabled,
  onPress,
  ...props
}: DrawerItemProps) {
  const { setOpen } = useDrawerContext();
  const { colors } = useTheme();
  const isDisabled = !!disabled;

  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(e);
    if (closeOnPress) setOpen(false);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.item,
        {
          minHeight: controlHeight.lg,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
          borderBottomColor: isDisabled ? colors.mutedForeground : colors.border,
          backgroundColor: active ? colors.foreground : pressed ? colors.muted : colors.background,
        },
        isDisabled && { backgroundColor: colors.muted, borderStyle: 'dashed' },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled: isDisabled }}
      aria-current={active ? 'page' : undefined}
      aria-disabled={isDisabled}
      {...props}
    >
      {({ pressed }) => {
        const fg = isDisabled ? colors.mutedForeground : active ? colors.background : colors.foreground;
        return (
          <>
            {/* The stripe is shape, not just hue: the current item reads in greyscale. */}
            {active ? <View style={[styles.stripe, { backgroundColor: colors.accent }]} /> : null}
            {icon ? (
              <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
                {typeof icon === 'function' ? icon(fg) : icon}
              </View>
            ) : null}
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
              style={[
                styles.itemLabel,
                { color: fg, fontSize: typography.md },
                // Pressed feedback beyond colour: the label nudges toward the stripe side.
                pressed && !active && !isDisabled && styles.itemLabelPressed,
              ]}
            >
              {label}
            </Text>
            {badge !== undefined && badge !== null ? (
              typeof badge === 'string' || typeof badge === 'number' ? (
                <Badge
                  variant={active ? 'accent' : 'primary'}
                  label={typeof badge === 'number' && badge > 99 ? '99+' : String(badge)}
                  style={styles.badge}
                />
              ) : (
                badge
              )
            ) : null}
          </>
        );
      }}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  panelWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
  panel: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    borderBottomWidth: borderWidths.extraHeavy,
  },
  headerTitle: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: borderWidths.standard,
  },
  itemLabel: {
    flex: 1,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemLabelPressed: {
    transform: [{ translateX: 4 }],
  },
  // Badge defaults to flex-start; centre it on the row's cross axis.
  badge: {
    alignSelf: 'center',
  },
  stripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: STRIPE_WIDTH,
  },
});
