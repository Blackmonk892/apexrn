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
  AccessibilityInfo,
  findNodeHandle,
  type GestureResponderEvent,
  Modal,
  Platform,
  Pressable,
  type PressableProps,
  StyleSheet,
  type Text as RNText,
  View,
  type ViewProps,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { spacing } from '../lib/colors';
import { useMotion } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';
import Text, { type TextProps } from './text';

interface DialogContextState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextState | undefined>(undefined);

function useDialogContext(part: string) {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(`${part} must be used within Dialog`);
  }
  return context;
}

export interface DialogProps {
  /** Controlled open state. Omit for an uncontrolled dialog. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface DialogContentProps extends ViewProps {
  /** Runs on a scrim tap instead of closing. The scrim then leaves the screen-reader tree; back still closes. */
  onInteractOutside?: () => void;
  children?: ReactNode;
}

export interface DialogTriggerProps extends Omit<PressableProps, 'children'> {
  /** Clone the single child and inject `onPress` instead of rendering a Pressable. */
  asChild?: boolean;
  children?: ReactNode;
}

export type DialogCloseProps = DialogTriggerProps;

const MAX_WIDTH = 400;
const ENTER_SCALE = 0.96;

export function Dialog({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: DialogProps) {
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

  return <DialogContext.Provider value={context}>{children}</DialogContext.Provider>;
}

// Trigger and Close differ only in the state they set, so they share one press wrapper.
function PressPart({
  part,
  next,
  asChild,
  children,
  onPress,
  ...props
}: DialogTriggerProps & { part: string; next: boolean }) {
  const { setOpen } = useDialogContext(part);

  const handlePress = (e: GestureResponderEvent) => {
    onPress?.(e);
    setOpen(next);
  };

  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error(`${part} with asChild needs a single React element child`);
    }
    const child = children as ReactElement<{ onPress?: (e: GestureResponderEvent) => void }>;
    return cloneElement(child, {
      onPress: (e: GestureResponderEvent) => {
        child.props.onPress?.(e);
        handlePress(e);
      },
    });
  }

  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
}

export function DialogTrigger(props: DialogTriggerProps) {
  return <PressPart part="DialogTrigger" next {...props} />;
}

export function DialogClose(props: DialogCloseProps) {
  return <PressPart part="DialogClose" next={false} {...props} />;
}

export function DialogContent({ children, onInteractOutside, style, ...props }: DialogContentProps) {
  const { open, setOpen } = useDialogContext('DialogContent');
  const { colors, scrimOpacity } = useTheme();
  const { reduceMotion, enter, exit } = useMotion();
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

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value * scrimOpacity }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: reduceMotion ? [] : [{ scale: interpolate(progress.value, [0, 1], [ENTER_SCALE, 1]) }],
  }));

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={mounted}
      animationType="none"
      onRequestClose={() => setOpen(false)}
    >
      {/* Android renders a Modal in its own window, so gestures inside the panel need their own root. */}
      <GestureHandlerRootView style={styles.fill}>
        <View accessibilityViewIsModal style={[styles.fill, styles.center, { padding: spacing.lg }]}>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrimStyle]}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onInteractOutside ?? (() => setOpen(false))}
            accessible={!onInteractOutside}
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
          />
          <Animated.View style={[styles.positioner, panelStyle]} pointerEvents="box-none">
            <BrutalSurface
              style={styles.panel}
              surfaceStyle={{ padding: spacing.xl }}
              elevation="overlay"
              pressable={false}
            >
              <View style={cn({ gap: spacing.md }, style)} {...props}>
                {children}
              </View>
            </BrutalSurface>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

export function DialogHeader({ style, ...props }: ViewProps) {
  return <View style={cn({ gap: spacing.xs }, style)} {...props} />;
}

export function DialogFooter({ style, ...props }: ViewProps) {
  return <View style={cn(styles.footer, { gap: spacing.sm }, style)} {...props} />;
}

export function DialogTitle(props: TextProps) {
  useDialogContext('DialogTitle');
  const ref = useRef<RNText>(null);

  // The title mounts with the Modal content, so mount time is open time.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    // The Modal window must be presented and laid out before native focus can move into it.
    const timer = setTimeout(() => {
      const node = ref.current ? findNodeHandle(ref.current) : null;
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // React 19 passes `ref` through as a prop and Text spreads its props onto the native node.
  return <Text variant="title" accessibilityRole="header" {...props} {...({ ref } as object)} />;
}

export function DialogDescription(props: TextProps) {
  useDialogContext('DialogDescription');
  return <Text tone="muted" {...props} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  positioner: { alignSelf: 'stretch', alignItems: 'center' },
  panel: { width: '100%', maxWidth: MAX_WIDTH },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' },
});
