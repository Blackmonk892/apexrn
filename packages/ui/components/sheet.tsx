import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface SheetContextState {
  open: boolean;
  close: () => void;
  onDismissAnimationFinished: () => void;
}

const SheetContext = createContext<SheetContextState | undefined>(undefined);

function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet sub-components must be used within a <Sheet /> wrapper');
  }
  return context;
}

export interface SheetProps {
  /**
   * Controls the open/closed state of the bottom sheet.
   */
  open: boolean;
  /**
   * Callback fired when the sheet closes (e.g., swiped down or backdrop pressed).
   */
  onOpenChange: (open: boolean) => void;
  children: ReactNode | ((props: { open: boolean; handleDismiss: () => void }) => ReactNode);
}

export interface SheetContentProps extends ViewProps {
  /**
   * The height the sheet snaps to when pulled up.
   * @default 400
   */
  sheetHeight?: number;
  /**
   * @deprecated Use `sheetHeight` instead. Kept for backwards compatibility.
   */
  PointHeight?: number;
  children?: ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  const [isModalVisible, setIsModalVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsModalVisible(true);
    }
  }, [open]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const onDismissAnimationFinished = useCallback(() => {
    // Unmount even if the parent ignored `onOpenChange(false)`: otherwise an
    // invisible overlay keeps intercepting touches. If `open` is still true
    // the effect above remounts and re-runs the open animation.
    setIsModalVisible(false);
  }, []);

  const childrenRender = typeof children === 'function' 
    ? children({ open, handleDismiss: close })
    : children;

  return (
    <SheetContext.Provider value={{ open, close, onDismissAnimationFinished }}>
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={close}
        accessibilityViewIsModal
      >
        {childrenRender}
      </Modal>
    </SheetContext.Provider>
  );
}

export function SheetContent({
  sheetHeight,
  PointHeight,
  children,
  style,
  ...props
}: SheetContentProps) {
  const { open, close, onDismissAnimationFinished } = useSheetContext();
  const { colors } = useTheme();
  const resolvedHeight = sheetHeight ?? PointHeight ?? 400;

  // TranslateY: 0 is open/docked, resolvedHeight is fully closed/hidden
  const translateY = useSharedValue(resolvedHeight);
  const backdropOpacity = useSharedValue(0);
  const contextY = useSharedValue(0);

  const isClosingRef = useRef(false);

  // Animate in/out when `open` state changes
  useEffect(() => {
    if (open) {
      isClosingRef.current = false;
      translateY.value = withTiming(0, { 
        duration: 250, 
        easing: Easing.out(Easing.quad) 
      });
      backdropOpacity.value = withTiming(0.5, { 
        duration: 250 
      });
    } else {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      translateY.value = withTiming(resolvedHeight, {
        duration: 200,
        easing: Easing.in(Easing.quad)
      }, (finished) => {
        if (finished) {
          runOnJS(onDismissAnimationFinished)();
        }
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [open, resolvedHeight, translateY, backdropOpacity, onDismissAnimationFinished]);

  const triggerClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    translateY.value = withTiming(resolvedHeight, {
      duration: 200, 
      easing: Easing.in(Easing.quad) 
    }, (finished) => {
      if (finished) {
        runOnJS(close)();
        runOnJS(onDismissAnimationFinished)();
      }
    });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  };

  const pan = Gesture.Pan()
    // Vertical-only dismiss: horizontal swipes / TextInput touches inside
    // the sheet don't compete with the dismiss gesture.
    .activeOffsetY([-10, 10])
    .failOffsetX([-10, 10])
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      const nextY = Math.max(-20, contextY.value + event.translationY);
      translateY.value = Math.min(nextY, resolvedHeight);
    })
    .onEnd((event) => {
      if (translateY.value > resolvedHeight / 3 || event.velocityY > 500) {
        runOnJS(triggerClose)();
      } else {
        translateY.value = withTiming(0, {
          duration: 150,
          easing: Easing.out(Easing.quad)
        });
      }
    });

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    // Keeps tall sheets with inputs usable when the keyboard opens.
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Backdrop */}
      <AnimatedPressable
        style={[styles.backdrop, animatedBackdropStyle]}
        onPress={triggerClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss Sheet"
      />

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.sheet,
            {
              height: resolvedHeight,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
            style,
            animatedSheetStyle,
          ]}
          {...props}
        >
          {/* Top drag handle (decorative) */}
          <View
            style={styles.handleContainer}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
          >
            <View style={[styles.handleBar, { backgroundColor: colors.foreground }]} />
          </View>

          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 0,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    borderTopWidth: borderWidths.extraHeavy, 
    borderLeftWidth: borderWidths.heavy,
    borderRightWidth: borderWidths.heavy,
    borderRadius: 0,
    flexDirection: 'column',
  },
  handleContainer: {
    width: '100%',
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 0,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
});
