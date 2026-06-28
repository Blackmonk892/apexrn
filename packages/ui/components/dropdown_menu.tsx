import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { 
  Modal, 
  Pressable, 
  StyleSheet, 
  View, 
  ViewProps, 
  PressableProps,
  LayoutRectangle,
  Dimensions
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ⚠️ IMPORTANT: Composing the existing ListItem primitive
import ListItem from './listitem';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface DropdownContextState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextState | undefined>(undefined);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown sub-components must be used within a <DropdownMenu />');
  }
  return context;
}

export interface DropdownMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DropdownMenuItemProps extends Omit<PressableProps, 'style'> {
  label: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  const setIsOpen = useCallback((nextOpen: boolean) => {
    onOpenChange(nextOpen);
  }, [onOpenChange]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <DropdownContext.Provider value={{ isOpen: open, setIsOpen, close }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild, ...props }: PressableProps & { asChild?: boolean }) {
  const { isOpen, setIsOpen } = useDropdownContext();
  const triggerRef = useRef<View>(null);

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onPress: handlePress,
      ...props,
    } as any);
  }

  return (
    <Pressable ref={triggerRef} onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
}

export function DropdownMenuContent({ children, style, ...props }: ViewProps) {
  const { isOpen, close } = useDropdownContext();
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Measure the trigger position securely on render
  const triggerRef = useRef<View>(null);

  const handleLayout = () => {
    if (triggerRef.current) {
      triggerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height });
        setIsModalVisible(true);
        
        // Scale and fade in from trigger origin
        scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) });
        opacity.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) });
      });
    }
  };

  const handleClose = () => {
    scale.value = withTiming(0, { duration: 80, easing: Easing.in(Easing.quad) });
    opacity.value = withTiming(0, { duration: 80, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) {
        runOnJS(setIsModalVisible)(false);
        runOnJS(close)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: interpolate(scale.value, [0, 1], [0.8, 1]) }
      ],
    };
  });

  if (!isOpen) return null;

  // Calculate absolute position anchored to trigger
  // Attempt to drop below, fallback to above if near screen bottom
  const topPosition = triggerLayout 
    ? (triggerLayout.y + triggerLayout.height + spacing.xs > SCREEN_HEIGHT - 200 
        ? triggerLayout.y - 150 
        : triggerLayout.y + triggerLayout.height)
    : 100;

  const leftPosition = triggerLayout 
    ? Math.min(Math.max(spacing.md, triggerLayout.x), SCREEN_WIDTH - 220)
    : 20;

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      onShow={handleLayout}
    >
      <View style={styles.portalOverlay}>
        <AnimatedPressable 
          style={styles.backdrop} 
          onPress={handleClose} 
          accessibilityRole="button"
          accessibilityLabel="Dismiss Dropdown"
        />
        
        <Animated.View 
          ref={triggerRef}
          style={[
            styles.menuWrapper, 
            { top: topPosition, left: leftPosition },
            animatedStyle,
            style
          ]}
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

export function DropdownMenuItem({ 
  label, 
  description, 
  leading, 
  trailing, 
  onPress, 
  ...props 
}: DropdownMenuItemProps) {
  const { close } = useDropdownContext();

  const handlePress = (e: any) => {
    onPress?.(e);
    close();
  };

  // Stack of ListItem components ensuring flat interaction flash without translation
  return (
    <ListItem
      title={label}
      description={description}
      leading={leading}
      trailing={trailing}
      onPress={handlePress}
      style={styles.menuItem}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  portalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menuWrapper: {
    position: 'absolute',
    width: 200,
    // Reserve space for hard 4px shadow offset
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
    zIndex: 1,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy, // Thick borders as requested
    borderRadius: 0,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  menuItem: {
    borderBottomWidth: borderWidths.standard,
    borderColor: colors.light.border,
    // Resets padding slightly to keep compact stack proportions
    paddingVertical: spacing.sm, 
    paddingHorizontal: spacing.sm,
  },
});