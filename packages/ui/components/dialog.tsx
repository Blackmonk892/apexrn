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
  type TextProps,
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

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface DialogContextState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextState | undefined>(undefined);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a <Dialog />');
  }
  return context;
}

export interface DialogProps {
  /**
   * The controlled open state of the dialog. Omit for an uncontrolled dialog.
   */
  open?: boolean;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface DialogContentProps extends ViewProps {
  /**
   * Callback fired when the backdrop is pressed. Replaces the default
   * behaviour of closing the dialog.
   */
  onInteractOutside?: () => void;
  children?: ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const DIALOG_SHADOW_OFFSET = 8;
const SCRIM_OPACITY = 0.5;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function Dialog({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;

  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback((newState: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newState);
    }
    onOpenChange?.(newState);
  }, [isControlled, onOpenChange]);

  const context = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <DialogContext.Provider value={context}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({
  children,
  onPress,
  asChild,
  ...props
}: PressableProps & { asChild?: boolean }) {
  const { setOpen } = useDialogContext();

  const handlePress = (e: GestureResponderEvent) => {
    setOpen(true);
    onPress?.(e);
  };

  if (asChild && isValidElement(children)) {
    // Chain the child's own onPress instead of dropping it, and only
    // inject press handling (never blindly spread PressableProps into an
    // arbitrary child whose props may not accept them).
    const child = children as ReactElement<{
      onPress?: (e: GestureResponderEvent) => void;
    }>;
    return cloneElement(child, {
      onPress: (e: GestureResponderEvent) => {
        child.props.onPress?.(e);
        handlePress(e);
      },
    });
  }

  // `onPress` is destructured above, so spreading `props` here cannot
  // clobber the open handler.
  return (
    <Pressable accessibilityRole="button" onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DialogContent({
  children,
  onInteractOutside,
  style,
  ...props
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  // The Modal stays mounted until the exit animation finishes.
  const [isVisible, setIsVisible] = useState(open);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      progress.value = withTiming(1, { duration: reduceMotion ? 0 : 150, easing: Easing.out(Easing.quad) });
    } else {
      // Also runs on first mount while closed: 0 -> 0 finishes immediately
      // and unmounting an already-hidden Modal is a no-op.
      progress.value = withTiming(0, { duration: reduceMotion ? 0 : 100, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
        }
      });
    }
  }, [open, reduceMotion, progress]);

  const handleBackdropPress = () => {
    if (onInteractOutside) {
      onInteractOutside();
    } else {
      setOpen(false);
    }
  };

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value * SCRIM_OPACITY,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.9, 1.0]) }
    ],
  }));

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={() => setOpen(false)}
      accessibilityViewIsModal
    >
      <View style={[styles.modalContainer, { padding: spacing.lg }]}>
        <AnimatedPressable
          style={[styles.backdrop, { backgroundColor: colors.scrim }, backdropAnimatedStyle]}
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="Close Dialog"
        />

        {/* paddingRight makes room for the hard shadow's margin so the
            surface + shadow together are centred, not the surface alone. */}
        <Animated.View
          style={[styles.contentPositioner, { paddingRight: DIALOG_SHADOW_OFFSET }, style, contentAnimatedStyle]}
          {...props}
        >
          <BrutalSurface
            style={styles.dialogWrapper}
            surfaceStyle={[styles.surface, { padding: spacing.xl, gap: spacing.md, backgroundColor: colors.background }]}
            offset={DIALOG_SHADOW_OFFSET}
            borderWidth="extraHeavy"
            pressable={false}
          >
            {children}
          </BrutalSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function DialogHeader({ style, ...props }: ViewProps) {
  return (
    <View style={cn(styles.header, { gap: spacing.xs }, style)} {...props} />
  );
}

export function DialogFooter({ style, ...props }: ViewProps) {
  return (
    <View style={cn(styles.footer, { gap: spacing.sm, marginTop: spacing.md }, style)} {...props} />
  );
}

export function DialogTitle({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={cn(styles.title, { fontSize: typography.xl, color: colors.foreground }, style)}
      accessibilityRole="header"
      maxFontSizeMultiplier={1.3}
      {...props}
    />
  );
}

export function DialogDescription({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={cn({ fontSize: typography.md, color: colors.mutedForeground }, style)}
      maxFontSizeMultiplier={1.3}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  contentPositioner: {
    alignSelf: 'stretch',
    alignItems: 'center',
    zIndex: 1,
    elevation: 1,
  },
  dialogWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  surface: {},
  header: {
    flexDirection: 'column',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  title: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
