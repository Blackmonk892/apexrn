import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
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

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

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
  children: React.ReactNode;
}

export interface DialogContentProps extends ViewProps {
  /**
   * Callback fired when the backdrop is pressed.
   */
  onInteractOutside?: () => void;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const DIALOG_SHADOW_OFFSET = 8; // Massive 8px shadow as requested
const DIALOG_BORDER_WIDTH = 4; // Extra heavy border as requested

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

  const handlePress = (e: any) => {
    setOpen(true);
    onPress?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onPress: handlePress,
    } as any);
  }

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
  const [isVisible, setIsVisible] = useState(open);
  
  const progress = useSharedValue(0);

  // Handle entry and exit animations
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      progress.value = withTiming(1, { 
        duration: 150, 
        easing: Easing.out(Easing.quad) 
      });
    } else if (isVisible) {
      // Exit animation
      progress.value = withTiming(0, { 
        duration: 100, 
        easing: Easing.in(Easing.quad) 
      }, (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
        }
      });
    }
  }, [open, isVisible, progress]);

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
      animationType="none" // Reanimated handles the animation natively
      onRequestClose={() => setOpen(false)}
    >
      <View style={styles.modalContainer}>
        {/* Animated 50% opacity backdrop */}
        <AnimatedPressable 
          style={[styles.backdrop, backdropAnimatedStyle]} 
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="Close Dialog"
        />
        
        {/* Scaling Brutalist Dialog Box */}
        <Animated.View 
          style={[
            styles.dialogWrapper, 
            contentAnimatedStyle,
            style
          ]}
          accessibilityRole="dialog"
          accessibilityModal={true}
          {...props}
        >
          <View style={styles.shadow} />
          <View style={styles.surface}>
            {children}
          </View>
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
  return (
    <Text 
      style={cn(styles.title, style)} 
      accessibilityRole="header" 
      {...props} 
    />
  );
}

export function DialogDescription({ style, ...props }: TextProps) {
  return (
    <Text style={cn(styles.description, style)} {...props} />
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 0,
  },
  dialogWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    // Reserve margin for massive 8px shadow
    marginBottom: DIALOG_SHADOW_OFFSET,
    marginRight: DIALOG_SHADOW_OFFSET,
    zIndex: 1,
  },
  shadow: {
    position: 'absolute',
    top: DIALOG_SHADOW_OFFSET,
    left: DIALOG_SHADOW_OFFSET,
    right: -DIALOG_SHADOW_OFFSET,
    bottom: -DIALOG_SHADOW_OFFSET,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: DIALOG_BORDER_WIDTH,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderWidth: DIALOG_BORDER_WIDTH,
    borderRadius: 0,
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
    color: colors.light.foreground,
  },
  description: {
    fontSize: typography.md,
    color: colors.light.mutedForeground,
  },
});