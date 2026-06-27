import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View, ViewProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing,
  runOnJS,
  interpolate
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface SheetContextState {
  close: () => void;
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
  children: (props: { open: boolean; handleDismiss: () => void }) => React.ReactNode;
}

export interface SheetContentProps extends ViewProps {
  /**
   * The height the sheet snaps to when pulled up.
   * @default 400
   */
  PointHeight?: number;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    }
    // Closing sequence is handled by the SheetContent component's animation
  }, [open]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // We unmount the Modal entirely after the exit animation completes
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <SheetContext.Provider value={{ close }}>
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={close}
      >
        {/* Children should be SheetContent */}
        {children({ open, handleDismiss })}
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
  const { close } = useSheetContext();
  
  // TranslateY: 0 is open/docked, PointHeight is fully closed/hidden
  const translateY = useSharedValue(PointHeight);
  const backdropOpacity = useSharedValue(0);
  const contextY = useSharedValue(0);

  useEffect(() => {
    // Slide and fade in when mounting
    translateY.value = withTiming(0, { 
      duration: 250, 
      easing: Easing.out(Easing.quad) 
    });
    backdropOpacity.value = withTiming(0.5, { 
      duration: 250 
    });
  }, [PointHeight, translateY, backdropOpacity]);

  const handleClose = () => {
    // Animate out before notifying parent to trigger unmount
    translateY.value = withTiming(PointHeight, { 
      duration: 200, 
      easing: Easing.in(Easing.quad) 
    }, (finished) => {
      if (finished) {
        runOnJS(close)();
      }
    });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Allow pulling down past 0 slightly for resistance, but snap back
      const nextY = Math.max(-20, contextY.value + event.translationY);
      // Don't let them drag past the point height (fully closed threshold)
      translateY.value = Math.min(nextY, PointHeight);
    })
    .onEnd((event) => {
      // If pulled down significantly (past 1/3 of the sheet height) or flicked downwards, close it
      if (translateY.value > PointHeight / 3 || event.velocityY > 500) {
        translateY.value = withTiming(PointHeight, { 
          duration: 200, 
          easing: Easing.in(Easing.quad) 
        }, (finished) => {
          if (finished) {
            runOnJS(close)();
          }
        });
        backdropOpacity.value = withTiming(0, { duration: 200 });
      } else {
        // Snap back to docked/open position
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
      {/* Harsh solid black backdrop */}
      <AnimatedPressable 
        style={[styles.backdrop, animatedBackdropStyle]} 
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss Sheet"
      />
      
      <GestureDetector gesture={pan}>
        <Animated.View 
          style={[
            styles.sheet, 
            { height: PointHeight }, 
            animatedSheetStyle,
            style
          ]}
          {...props}
        >
          {/* Strict brutalist top drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 0,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    // ExtraHeavy top border (4px) per instructions, sides/bottom rest flush
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
    height: 4, // Thick 4px line as requested
    backgroundColor: colors.light.foreground,
    borderRadius: 0,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
});