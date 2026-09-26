import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View, ViewProps } from 'react-native';
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
import { cn } from '../lib/utils';

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
  children: React.ReactNode | ((props: { open: boolean; handleDismiss: () => void }) => React.ReactNode);
}

export interface SheetContentProps extends ViewProps {
  /**
   * The height the sheet snaps to when pulled up.
   * @default 400
   */
  PointHeight?: number;
  children?: React.ReactNode;
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
      >
        {childrenRender}
      </Modal>
    </SheetContext.Provider>
  );
}

export function SheetContent({ 
  PointHeight = 400, 
  children, 
  style, 
  ...props 
}: SheetContentProps) {
  const { open, close, onDismissAnimationFinished } = useSheetContext();
  const { colors } = useTheme();
  
  // TranslateY: 0 is open/docked, PointHeight is fully closed/hidden
  const translateY = useSharedValue(PointHeight);
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
      translateY.value = withTiming(PointHeight, { 
        duration: 200, 
        easing: Easing.in(Easing.quad) 
      }, (finished) => {
        if (finished) {
          runOnJS(onDismissAnimationFinished)();
        }
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [open, PointHeight, translateY, backdropOpacity, onDismissAnimationFinished]);

  const triggerClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    translateY.value = withTiming(PointHeight, { 
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
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      const nextY = Math.max(-20, contextY.value + event.translationY);
      translateY.value = Math.min(nextY, PointHeight);
    })
    .onEnd((event) => {
      if (translateY.value > PointHeight / 3 || event.velocityY > 500) {
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
    <View style={styles.wrapper}>
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
              height: PointHeight,
              backgroundColor: colors.background,
              borderColor: colors.border,
            }, 
            animatedSheetStyle,
            style
          ]}
          {...props}
        >
          {/* Top drag handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.foreground }]} />
          </View>
          
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
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