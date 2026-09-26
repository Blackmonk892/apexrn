import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
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

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import ListItem from './listitem';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface DropdownContextState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
  triggerLayout: LayoutRectangle | null;
  setTriggerLayout: (layout: LayoutRectangle) => void;
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

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);

  const setIsOpen = useCallback((nextOpen: boolean) => {
    onOpenChange(nextOpen);
  }, [onOpenChange]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <DropdownContext.Provider value={{ isOpen: open, setIsOpen, close, triggerLayout, setTriggerLayout }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild, ...props }: PressableProps & { asChild?: boolean }) {
  const { isOpen, setIsOpen, setTriggerLayout } = useDropdownContext();
  const triggerRef = useRef<View>(null);

  const handlePress = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (triggerRef.current) {
      triggerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height });
        setIsOpen(true);
      });
    } else {
      setIsOpen(true);
    }
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
  const { isOpen, close, triggerLayout } = useDropdownContext();
  const { colors } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      scale.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) });
    } else if (isModalVisible) {
      scale.value = withTiming(0, { duration: 100, easing: Easing.in(Easing.quad) });
      opacity.value = withTiming(0, { duration: 100, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(setIsModalVisible)(false);
        }
      });
    }
  }, [isOpen, isModalVisible, scale, opacity]);

  const handleClose = () => {
    close();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: interpolate(scale.value, [0, 1], [0.85, 1]) }
    ],
  }));

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

  // Position calculation anchored to trigger
  const topPosition = triggerLayout 
    ? (triggerLayout.y + triggerLayout.height + spacing.xs > SCREEN_HEIGHT - 200 
        ? Math.max(10, triggerLayout.y - 150)
        : triggerLayout.y + triggerLayout.height + spacing.xs)
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
    >
      <View style={styles.portalOverlay}>
        <AnimatedPressable
          style={styles.backdrop}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss Dropdown"
        />

        <Animated.View
          style={[
            styles.menuWrapper, 
            { top: topPosition, left: leftPosition },
            animatedStyle,
            style
          ]}
          {...props}
        >
          <View style={[styles.shadow, { backgroundColor: colors.shadow, borderColor: colors.border }]} />
          
          <View style={[styles.surface, { backgroundColor: colors.background, borderColor: colors.border }]}>
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
  disabled,
  ...props 
}: DropdownMenuItemProps) {
  const { close } = useDropdownContext();
  const { colors } = useTheme();

  const handlePress = (e: any) => {
    onPress?.(e);
    close();
  };

  return (
    <ListItem
      title={label}
      description={description}
      leading={leading}
      trailing={trailing}
      disabled={!!disabled}
      onPress={handlePress}
      style={[styles.menuItem, { borderColor: colors.border }]}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  portalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  menuWrapper: {
    position: 'absolute',
    width: 200,
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
    borderWidth: borderWidths.heavy,
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    borderWidth: borderWidths.heavy,
    borderRadius: 0,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  menuItem: {
    borderBottomWidth: borderWidths.standard,
    paddingVertical: spacing.sm, 
    paddingHorizontal: spacing.sm,
  },
});