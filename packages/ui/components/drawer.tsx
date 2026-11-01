import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  type PressableProps,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewProps,
} from 'react-native';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { borderWidths, controlHeight, spacing } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import Badge from './badge';
import BrutalSurface from './brutal-surface';
import Text from './text';

export interface DrawerProps {
  /** Controlled open state. Omit for an uncontrolled drawer. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Open amount, 0 (closed) to 1 (open), driven on the UI thread. For `variant="push"`, translate your
   * screen with it: `translateX: progress.value * width` (negate for `side="right"`). It stays at 0 under
   * reduced motion, where the panel fades instead of sliding.
   */
  progress?: SharedValue<number>;
  children: ReactNode;
}

export interface DrawerContentProps extends ViewProps {
  /** Edge the drawer slides from. @default 'left' */
  side?: 'left' | 'right';
  /** `overlay` dims the screen; `push` leaves it undimmed for you to translate with `progress`. @default 'overlay' */
  variant?: 'overlay' | 'push';
  /** Panel width, capped at 85% of the window. @default 320 */
  width?: number;
  /** Status bar / notch inset. Pass `useSafeAreaInsets().top`. @default 0 */
  topInset?: number;
  /** Home-indicator inset. Pass `useSafeAreaInsets().bottom`. @default 0 */
  bottomInset?: number;
  /** Swipe the panel towards its edge to close. @default true */
  swipeToClose?: boolean;
  /** Width of the screen-edge strip that opens the drawer on swipe. 0 turns it off. Off on iOS, where it fights swipe-back. @default 20 (0 on iOS) */
  edgeWidth?: number;
  /** Accessibility label of the scrim's close action. @default 'Close menu' */
  dismissLabel?: string;
  children?: ReactNode;
}

export interface DrawerHeaderProps extends ViewProps {
  title: string;
  subtitle?: string;
}

export interface DrawerListProps extends ScrollViewProps {
  children?: ReactNode;
}

export interface DrawerSectionProps extends ViewProps {
  label: string;
}

export interface DrawerFooterProps extends ViewProps {
  children?: ReactNode;
}

export interface DrawerItemProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  /** Position in the index, shown in mono ahead of the label. */
  number?: number | string;
  /** Icon element, or a function receiving the colour for the current state. */
  icon?: ReactNode | ((color: string) => ReactNode);
  /** Trailing count. A string or number renders as a Badge. */
  badge?: string | number | ReactNode;
  /** Marks the current destination: the inverted block slides to it. */
  active?: boolean;
  /** Close the drawer after the press. @default true */
  closeOnPress?: boolean;
}

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  progress?: SharedValue<number>;
}

interface Box {
  y: number;
  height: number;
}

interface ListContextValue {
  report: (id: string, box: Box) => void;
  setActive: (id: string | null) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);
// DrawerHeader reaches under the status bar, so it needs the inset DrawerContent reserved.
const InsetContext = createContext(0);
const ListContext = createContext<ListContextValue | null>(null);

function useDrawer(part: string) {
  const context = useContext(DrawerContext);
  if (!context) throw new Error(`${part} must be used within Drawer`);
  return context;
}

const MAX_WIDTH_RATIO = 0.85;
const SCRIM_OPACITY = 0.5;
// The active block is drawn at a fixed height and stretched with scaleY, so the slide animates transforms only.
const BASE = 100;
const CLOSE_VELOCITY = 500;

export function Drawer({ open: openProp, defaultOpen = false, onOpenChange, progress, children }: DrawerProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const context = useMemo(() => ({ open, setOpen, progress }), [open, setOpen, progress]);
  return <DrawerContext.Provider value={context}>{children}</DrawerContext.Provider>;
}

export function DrawerTrigger({ children, onPress, asChild, ...props }: PressableProps & { asChild?: boolean }) {
  const { setOpen } = useDrawer('DrawerTrigger');

  const handlePress = (e: GestureResponderEvent) => {
    setOpen(true);
    onPress?.(e);
  };

  if (asChild && isValidElement(children)) {
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
  variant = 'overlay',
  width = 320,
  topInset = 0,
  bottomInset = 0,
  swipeToClose = true,
  edgeWidth = Platform.OS === 'ios' ? 0 : 20,
  dismissLabel = 'Close menu',
  children,
  style,
  ...props
}: DrawerContentProps) {
  const { open, setOpen, progress } = useDrawer('DrawerContent');
  const { colors, elevation } = useTheme();
  const { enter, exit, reduceMotion } = useMotion();
  const { width: windowWidth } = useWindowDimensions();

  const bw = borderWidths.container;
  const depth = elevation.overlay;
  const panelWidth = Math.min(width, windowWidth * MAX_WIDTH_RATIO);
  // The hard shadow travels with the panel, so the slide distance includes it or a sliver would stay on screen.
  const travel = panelWidth + depth;
  const toward = side === 'left' ? -1 : 1;

  // The Modal stays mounted until the exit animation finishes.
  const [visible, setVisible] = useState(open);
  // 0 closed, 1 open. One value drives the panel, the scrim and the drag, so they cannot disagree.
  const p = useSharedValue(open ? 1 : 0);
  const dragStart = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setVisible(true);
      p.value = withTiming(1, enter);
    } else {
      p.value = withTiming(0, exit, (finished) => {
        if (finished) runOnJS(setVisible)(false);
      });
    }
  }, [open, enter, exit, p]);

  useAnimatedReaction(
    () => p.value,
    (value) => {
      if (progress && !reduceMotion) progress.value = value;
    },
  );

  const close = useCallback(() => setOpen(false), [setOpen]);
  const openIt = useCallback(() => setOpen(true), [setOpen]);

  const closePan = Gesture.Pan()
    .enabled(swipeToClose)
    // Horizontal only: vertical scrolling inside the panel is never stolen.
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      dragStart.value = p.value;
    })
    .onUpdate((event) => {
      const shut = Math.min(1, Math.max(0, (event.translationX * toward) / travel));
      if (!reduceMotion) p.value = dragStart.value - shut;
    })
    .onEnd((event) => {
      const shut = Math.min(1, Math.max(0, (event.translationX * toward) / travel));
      if (shut > 0.33 || event.velocityX * toward > CLOSE_VELOCITY) {
        runOnJS(close)();
      } else if (!reduceMotion) {
        p.value = withTiming(1, enter);
      }
    });

  const edgePan = Gesture.Pan()
    .enabled(edgeWidth > 0)
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onEnd((event) => {
      const inward = event.translationX * -toward;
      if (inward > 40 || event.velocityX * -toward > CLOSE_VELOCITY) runOnJS(openIt)();
    });

  const panelStyle = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: p.value }
      : { transform: [{ translateX: (1 - p.value) * toward * travel }] },
  );
  const scrimStyle = useAnimatedStyle(() => ({ opacity: p.value * (variant === 'push' ? 0 : SCRIM_OPACITY) }));

  const left = side === 'left';

  return (
    <>
      {edgeWidth > 0 && !open ? (
        <GestureDetector gesture={edgePan}>
          <View
            testID="drawer-edge"
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={[styles.edge, left ? styles.left : styles.right, { width: edgeWidth }]}
          />
        </GestureDetector>
      ) : null}

      <Modal visible={visible} transparent animationType="none" onRequestClose={close} accessibilityViewIsModal>
        {/* Android renders a Modal in its own window, outside the app's root GestureHandlerRootView. */}
        <GestureHandlerRootView style={styles.root} accessibilityViewIsModal>
          <AnimatedPressable
            testID="drawer-scrim"
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrimStyle]}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={dismissLabel}
          />

          <GestureDetector gesture={closePan}>
            <Animated.View
              style={[styles.panelWrap, left ? styles.left : styles.right, { width: travel }, panelStyle]}
            >
              <InsetContext.Provider value={topInset}>
                <BrutalSurface
                  pressable={false}
                  elevation="overlay"
                  borderWidth="container"
                  // Top, bottom and the screen-side border sit off screen; only the inner edge and shadow show.
                  style={{
                    flex: 1,
                    marginTop: -bw,
                    marginBottom: -bw,
                    marginLeft: left ? -bw : depth,
                    marginRight: left ? depth : -bw,
                  }}
                  surfaceStyle={cn(
                    { flex: 1, overflow: 'hidden', paddingTop: topInset + bw, paddingBottom: bottomInset + bw },
                    style,
                  )}
                  {...props}
                >
                  {children}
                </BrutalSurface>
              </InsetContext.Provider>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}

export function DrawerHeader({ title, subtitle, style, children, ...props }: DrawerHeaderProps) {
  const { colors } = useTheme();
  const topInset = useContext(InsetContext);

  return (
    <View
      style={cn(
        {
          backgroundColor: colors.foreground,
          borderBottomColor: colors.border,
          borderBottomWidth: borderWidths.container,
          // Pull up over the surface's inset padding so the fill reaches the top edge.
          marginTop: -(topInset + borderWidths.container),
          paddingTop: topInset + borderWidths.container + spacing.lg,
          padding: spacing.lg,
          gap: spacing.xs,
        },
        style,
      )}
      {...props}
    >
      <Text variant="display" numberOfLines={2} style={{ color: colors.background }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="label" numberOfLines={1} style={{ color: colors.background }}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** Scrolling index. Items and sections must be its direct children so the active block can measure them. */
export function DrawerList({ children, contentContainerStyle, ...props }: DrawerListProps) {
  useDrawer('DrawerList');
  const { colors } = useTheme();
  const { selection, reduceMotion } = useMotion();
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  const translateY = useSharedValue(0);
  const scaleY = useSharedValue(0);
  const opacity = useSharedValue(0);

  const report = useCallback((id: string, box: Box) => {
    setBoxes((prev) => {
      const old = prev[id];
      return old && old.y === box.y && old.height === box.height ? prev : { ...prev, [id]: box };
    });
  }, []);
  const context = useMemo(() => ({ report, setActive: setActiveId }), [report]);

  const box = activeId ? boxes[activeId] : undefined;

  useEffect(() => {
    if (!box) {
      opacity.value = 0;
      return;
    }
    const nextY = box.y + box.height / 2 - BASE / 2;
    const nextScale = box.height / BASE;
    opacity.value = 1;
    if (!placed || reduceMotion) {
      translateY.value = nextY;
      scaleY.value = nextScale;
      setPlaced(true);
    } else {
      translateY.value = withTiming(nextY, selection);
      scaleY.value = withTiming(nextScale, selection);
    }
  }, [box, placed, reduceMotion, selection, translateY, scaleY, opacity]);

  const blockStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scaleY: scaleY.value }],
  }));

  return (
    <ListContext.Provider value={context}>
      <ScrollView
        contentContainerStyle={cn({ paddingVertical: spacing.sm }, contentContainerStyle)}
        {...props}
      >
        <Animated.View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[styles.block, { backgroundColor: colors.foreground }, blockStyle]}
        />
        {children}
      </ScrollView>
    </ListContext.Provider>
  );
}

export function DrawerSection({ label, style, ...props }: DrawerSectionProps) {
  useDrawer('DrawerSection');
  const { colors } = useTheme();
  return (
    <View
      style={cn({ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.xs }, style)}
      {...props}
    >
      <Text variant="label" tone="muted" accessibilityRole="header">
        {label}
      </Text>
      <View style={{ height: borderWidths.control, backgroundColor: colors.border }} />
    </View>
  );
}

export function DrawerFooter({ style, children, ...props }: DrawerFooterProps) {
  useDrawer('DrawerFooter');
  const { colors } = useTheme();
  return (
    <View
      style={cn(
        {
          borderTopColor: colors.border,
          borderTopWidth: borderWidths.control,
          padding: spacing.lg,
          gap: spacing.sm,
        },
        style,
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export function DrawerItem({
  label,
  number,
  icon,
  badge,
  active = false,
  closeOnPress = true,
  disabled,
  onPress,
  ...props
}: DrawerItemProps) {
  const { setOpen } = useDrawer('DrawerItem');
  const list = useContext(ListContext);
  if (!list) throw new Error('DrawerItem must be used within DrawerList');
  const { colors } = useTheme();
  const id = useId();
  const isDisabled = !!disabled;
  const { setActive } = list;

  useEffect(() => {
    if (!active) return;
    setActive(id);
    return () => setActive(null);
  }, [active, id, setActive]);

  const fg = isDisabled ? colors.mutedForeground : active ? colors.background : colors.foreground;

  return (
    <Pressable
      onPress={(e) => {
        onPress?.(e);
        if (closeOnPress) setOpen(false);
      }}
      onLayout={(e: LayoutChangeEvent) => list.report(id, e.nativeEvent.layout)}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled: isDisabled }}
      style={({ pressed }) => [
        styles.item,
        {
          minHeight: controlHeight.lg,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
          backgroundColor: pressed && !active && !isDisabled ? colors.muted : 'transparent',
        },
      ]}
      {...props}
    >
      {number !== undefined ? (
        <Text
          variant="mono"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={{ color: fg, minWidth: 24 }}
        >
          {String(number).padStart(2, '0')}
        </Text>
      ) : null}
      {icon ? (
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {typeof icon === 'function' ? icon(fg) : icon}
        </View>
      ) : null}
      <Text
        variant="title"
        accessibilityRole="none"
        numberOfLines={1}
        style={[styles.label, { color: fg }]}
      >
        {label}
      </Text>
      {badge !== undefined && badge !== null ? (
        typeof badge === 'string' || typeof badge === 'number' ? (
          <Badge variant={active ? 'accent' : 'primary'} count={typeof badge === 'number' ? badge : undefined} label={String(badge)} />
        ) : (
          badge
        )
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  panelWrap: { position: 'absolute', top: 0, bottom: 0 },
  left: { left: 0 },
  right: { right: 0 },
  edge: { position: 'absolute', top: 0, bottom: 0, zIndex: 10 },
  block: { position: 'absolute', top: 0, left: 0, right: 0, height: BASE },
  item: { flexDirection: 'row', alignItems: 'center' },
  label: { flex: 1 },
});

export default Drawer;
