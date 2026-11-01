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
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  type PressableProps,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewProps,
} from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { borderWidths, spacing, touchTarget } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';
import Text, { type TextProps } from './text';

export interface SheetProps {
  /** Controlled open state. Omit for an uncontrolled sheet. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A render function receives the open state and a `handleDismiss` that closes the sheet. */
  children: ReactNode | ((props: { open: boolean; handleDismiss: () => void }) => ReactNode);
}

export interface SheetContentProps extends ViewProps {
  /**
   * Panel height, capped at 90% of the window.
   * @default 400
   */
  sheetHeight?: number;
  /** Scrim opacity, 0 to 1. @default 0.5 */
  scrimOpacity?: number;
  /** Home-indicator inset. Pass `useSafeAreaInsets().bottom`. @default 0 */
  bottomInset?: number;
  /** Drag the handle down to close. @default true */
  swipeToClose?: boolean;
  /** Accessibility label of the scrim's close action. @default 'Close sheet' */
  dismissLabel?: string;
  children?: ReactNode;
}

export interface SheetHeaderProps extends ViewProps {
  children?: ReactNode;
}

export interface SheetTitleProps extends Omit<TextProps, 'variant'> {
  children?: ReactNode;
}

export interface SheetFooterProps extends ViewProps {
  children?: ReactNode;
}

export interface SheetTriggerProps extends PressableProps {
  asChild?: boolean;
}

export interface SheetCloseProps extends PressableProps {
  asChild?: boolean;
}

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheet(part: string) {
  const context = useContext(SheetContext);
  if (!context) throw new Error(`${part} must be used within Sheet`);
  return context;
}

const MAX_HEIGHT_RATIO = 0.9;
const CLOSE_VELOCITY = 500;

export function Sheet({ open: openProp, defaultOpen = false, onOpenChange, children }: SheetProps) {
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

  const context = useMemo(() => ({ open, setOpen }), [open, setOpen]);
  const content =
    typeof children === 'function' ? children({ open, handleDismiss: () => setOpen(false) }) : children;

  return <SheetContext.Provider value={context}>{content}</SheetContext.Provider>;
}

function asChildAction(
  part: string,
  children: ReactNode,
  action: (e: GestureResponderEvent) => void,
): ReactElement | null {
  if (!isValidElement(children)) {
    throw new Error(`${part} with asChild needs a single element child`);
  }
  const child = children as ReactElement<{ onPress?: (e: GestureResponderEvent) => void }>;
  return cloneElement(child, {
    onPress: (e: GestureResponderEvent) => {
      child.props.onPress?.(e);
      action(e);
    },
  });
}

export function SheetTrigger({ children, onPress, asChild, ...props }: SheetTriggerProps) {
  const { setOpen } = useSheet('SheetTrigger');
  const handlePress = (e: GestureResponderEvent) => {
    setOpen(true);
    onPress?.(e);
  };

  if (asChild) return asChildAction('SheetTrigger', children as ReactNode, handlePress);

  return (
    <Pressable accessibilityRole="button" onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
}

export function SheetClose({ children, onPress, asChild, ...props }: SheetCloseProps) {
  const { setOpen } = useSheet('SheetClose');
  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(e);
    setOpen(false);
  };

  if (asChild) return asChildAction('SheetClose', children as ReactNode, handlePress);

  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SheetContent({
  sheetHeight = 400,
  scrimOpacity = 0.5,
  bottomInset = 0,
  swipeToClose = true,
  dismissLabel = 'Close sheet',
  children,
  style,
  ...props
}: SheetContentProps) {
  const { open, setOpen } = useSheet('SheetContent');
  const { colors, elevation } = useTheme();
  const { enter, exit, reduceMotion } = useMotion();
  const { height: windowHeight } = useWindowDimensions();

  const bw = borderWidths.container;
  const height = Math.min(sheetHeight, windowHeight * MAX_HEIGHT_RATIO);
  // The Modal stays mounted until the exit animation finishes.
  const [visible, setVisible] = useState(open);
  // 0 closed, 1 open. One value drives panel, scrim and drag, so they cannot disagree.
  const p = useSharedValue(open ? 1 : 0);
  const dragStart = useSharedValue(0);
  const openRef = useRef(open);
  openRef.current = open;

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

  const close = useCallback(() => setOpen(false), [setOpen]);

  // A controlled parent may refuse the close; the panel then springs back instead of staying half-dragged.
  const dismissFromDrag = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      if (openRef.current) p.value = withTiming(1, enter);
    }, 0);
  }, [setOpen, p, enter]);

  // The pan lives on the handle strip only: over the whole panel it would fight a ScrollView inside.
  const pan = Gesture.Pan()
    .enabled(swipeToClose)
    .activeOffsetY([-10, 10])
    .failOffsetX([-10, 10])
    .onStart(() => {
      dragStart.value = p.value;
    })
    .onUpdate((event) => {
      const shut = Math.min(1, Math.max(0, event.translationY / height));
      if (!reduceMotion) p.value = dragStart.value - shut;
    })
    .onEnd((event) => {
      const shut = Math.min(1, Math.max(0, event.translationY / height));
      if (shut > 0.33 || event.velocityY > CLOSE_VELOCITY) {
        runOnJS(dismissFromDrag)();
      } else if (!reduceMotion) {
        p.value = withTiming(1, enter);
      }
    });

  const panelStyle = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: p.value }
      : { transform: [{ translateY: (1 - p.value) * (height + elevation.overlay) }] },
  );
  const scrimStyle = useAnimatedStyle(() => ({ opacity: p.value * scrimOpacity }));

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={close}
      accessibilityViewIsModal
    >
      {/* Android renders a Modal in its own window, outside the app's root GestureHandlerRootView. */}
      <GestureHandlerRootView style={styles.root} accessibilityViewIsModal>
        <AnimatedPressable
          testID="sheet-scrim"
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrimStyle]}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={dismissLabel}
        />

        <KeyboardAvoidingView
          pointerEvents="box-none"
          style={styles.dock}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View style={[{ height }, panelStyle]}>
            <BrutalSurface
              pressable={false}
              elevation="overlay"
              borderWidth="container"
              // Side and bottom borders sit off screen; only the top edge shows.
              style={{ flex: 1, marginLeft: -bw, marginRight: -bw, marginBottom: -bw }}
              surfaceStyle={cn({ flex: 1, overflow: 'hidden', paddingBottom: bottomInset + bw }, style)}
              {...props}
            >
              <GestureDetector gesture={pan}>
                <View
                  testID="sheet-handle"
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                  style={styles.handle}
                >
                  <View style={[styles.bar, { backgroundColor: colors.foreground }]} />
                </View>
              </GestureDetector>
              <View style={{ flex: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>{children}</View>
            </BrutalSurface>
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

export function SheetHeader({ style, children, ...props }: SheetHeaderProps) {
  useSheet('SheetHeader');
  return (
    <View style={cn({ gap: spacing.xs, paddingBottom: spacing.md }, style)} {...props}>
      {children}
    </View>
  );
}

export function SheetTitle({ children, ...props }: SheetTitleProps) {
  useSheet('SheetTitle');
  return (
    <Text variant="title" accessibilityRole="header" {...props}>
      {children}
    </Text>
  );
}

export function SheetFooter({ style, children, ...props }: SheetFooterProps) {
  const { colors } = useTheme();
  useSheet('SheetFooter');
  return (
    <View
      style={cn(
        {
          gap: spacing.sm,
          paddingTop: spacing.md,
          borderTopColor: colors.border,
          borderTopWidth: borderWidths.control,
        },
        style,
      )}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dock: { flex: 1, justifyContent: 'flex-end' },
  handle: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', minHeight: touchTarget },
  bar: { width: 48, height: 6 },
});

export default Sheet;
