import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewProps,
  PressableProps,
  TextProps
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing,
  runOnJS,
  interpolate
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
   * The controlled open state of the dialog.
   */
  open?: boolean;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface DialogContentProps extends ViewProps {
  /**
   * Callback fired when the backdrop is pressed.
   */
  onInteractOutside?: () => void;
  children?: ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const DIALOG_SHADOW_OFFSET = 8;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  
  const setOpen = useCallback((newState: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newState);
    }
    onOpenChange?.(newState);
  }, [isControlled, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
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
    <Pressable onPress={handlePress} {...props}>
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
  const [isVisible, setIsVisible] = useState(open);
  
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      progress.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.quad)
      });
    } else if (isVisible) {
      progress.value = withTiming(0, {
        duration: 100,
        easing: Easing.in(Easing.quad)
      }, (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
        }
      });
    }
    // Deps intentionally `[open]` only: including `isVisible` would restart
    // the open animation when `setIsVisible(true)` re-renders.
  }, [open]);

  const handleBackdropPress = () => {
    if (onInteractOutside) {
      onInteractOutside();
    } else {
      setOpen(false);
    }
  };

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
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
      <View style={styles.modalContainer}>
        <AnimatedPressable
          style={[styles.backdrop, backdropAnimatedStyle]}
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="Close Dialog"
        />

        <Animated.View
          style={[styles.contentPositioner, style, contentAnimatedStyle]}
          {...props}
        >
          <BrutalSurface
            style={styles.dialogWrapper}
            surfaceStyle={[styles.surface, { backgroundColor: colors.background }]}
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
    <View style={cn(styles.header, style)} {...props} />
  );
}

export function DialogFooter({ style, ...props }: ViewProps) {
  return (
    <View style={cn(styles.footer, style)} {...props} />
  );
}

export function DialogTitle({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return (
    <Text 
      style={cn(styles.title, { color: colors.foreground }, style)} 
      accessibilityRole="header" 
      {...props} 
    />
  );
}

export function DialogDescription({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return (
    <Text style={cn(styles.description, { color: colors.mutedForeground }, style)} {...props} />
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
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 0,
  },
  contentPositioner: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
    elevation: 1,
  },
  dialogWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  surface: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    fontSize: typography.md,
  },
});