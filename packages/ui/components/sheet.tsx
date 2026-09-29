import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewProps,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

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
   * Controls the open/closed state of the bottom sheet. Controlled on purpose:
   * the Modal owns Sheet's children, so there is nowhere to put a trigger.
   * Keep `const [open, setOpen] = useState(false)` next to your own button.
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
   * The height the sheet snaps to when pulled up. Capped at 90% of the
   * window height so it never covers the whole screen.
   * @default 400
   */
  sheetHeight?: number;
  children?: ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SCRIM_OPACITY = 0.5;
const MAX_HEIGHT_RATIO = 0.9;

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

  const context = useMemo(
    () => ({ open, close, onDismissAnimationFinished }),
    [open, close, onDismissAnimationFinished],
  );

  const childrenRender = typeof children === 'function'
    ? children({ open, handleDismiss: close })
    : children;

  return (
    <SheetContext.Provider value={context}>
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={close}
        accessibilityViewIsModal
      >
        {/* Android renders a Modal in its own window, outside the app's root
            GestureHandlerRootView, so the drag-to-dismiss needs its own. */}
        <GestureHandlerRootView style={styles.root}>{childrenRender}</GestureHandlerRootView>
      </Modal>
    </SheetContext.Provider>
  );
}

export function SheetContent({
  sheetHeight,
  children,
  style,
  ...props
}: SheetContentProps) {
  const { open, close, onDismissAnimationFinished } = useSheetContext();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const { height: windowHeight } = useWindowDimensions();
  const resolvedHeight = Math.min(sheetHeight ?? 400, windowHeight * MAX_HEIGHT_RATIO);
  const ms = (duration: number) => (reduceMotion ? 0 : duration);

  // TranslateY: 0 is open/docked, resolvedHeight is fully closed/hidden
  const translateY = useSharedValue(resolvedHeight);
  const backdropOpacity = useSharedValue(0);
  const contextY = useSharedValue(0);

  const isClosingRef = useRef(false);

  // Animate in/out when `open` state changes
  useEffect(() => {
    if (open) {
      isClosingRef.current = false;
      translateY.value = withTiming(0, { duration: ms(250), easing: Easing.out(Easing.quad) });
      backdropOpacity.value = withTiming(SCRIM_OPACITY, { duration: ms(250) });
    } else {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      translateY.value = withTiming(resolvedHeight, {
        duration: ms(200),
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(onDismissAnimationFinished)();
        }
      });
      backdropOpacity.value = withTiming(0, { duration: ms(200) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ms only reads reduceMotion
  }, [open, resolvedHeight, reduceMotion, translateY, backdropOpacity, onDismissAnimationFinished]);

  const triggerClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    translateY.value = withTiming(resolvedHeight, {
      duration: ms(200),
      easing: Easing.in(Easing.quad),
    }, (finished) => {
      if (finished) {
        runOnJS(close)();
        runOnJS(onDismissAnimationFinished)();
      }
    });
    backdropOpacity.value = withTiming(0, { duration: ms(200) });
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
        translateY.value = withTiming(0, { duration: ms(150), easing: Easing.out(Easing.quad) });
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
        style={[styles.backdrop, { backgroundColor: colors.scrim }, animatedBackdropStyle]}
        onPress={triggerClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss Sheet"
      />

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
        {/* The drag-to-dismiss gesture lives on the handle strip only. A pan
            over the whole sheet would fight any ScrollView inside it (Select,
            DatePicker) for vertical drags. Backdrop, back button and Escape
            remain as gesture-free ways to close. */}
        <GestureDetector gesture={pan}>
          <View
            style={[styles.handleContainer, { paddingVertical: spacing.md }]}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
          >
            <View style={[styles.handleBar, { backgroundColor: colors.foreground }]} />
          </View>
        </GestureDetector>

        <View style={[styles.content, { paddingHorizontal: spacing.md, paddingBottom: spacing.md }]}>
          {children}
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
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
    alignSelf: 'stretch',
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
  },
});
