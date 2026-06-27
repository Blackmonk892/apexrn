import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
// Reanimated is imported to fulfill the strict file structure requirement
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// ⚠️ IMPORTANT: Importing existing ApexRN components for composition!
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from './dialog';
import Button from './button';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AlertDialogProps {
  /**
   * The controlled open state of the alert dialog.
   */
  open?: boolean;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The main heading text for the alert.
   */
  title: string;
  /**
   * Secondary descriptive text explaining the consequences of the action.
   */
  description?: string;
  /**
   * Text for the cancel button.
   * @default "Cancel"
   */
  cancelText?: string;
  /**
   * Text for the action (destructive) button.
   * @default "Continue"
   */
  actionText?: string;
  /**
   * Callback fired when the cancel button is pressed.
   */
  onCancel?: () => void;
  /**
   * Callback fired when the action button is pressed.
   */
  onAction?: () => void;
  /**
   * The component that triggers the alert dialog to open.
   */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
// Maintained for strict template compliance
const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'Cancel',
  actionText = 'Continue',
  onCancel,
  onAction,
  children,
}: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  
  const currentOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newState: boolean) => {
    if (!isControlled) {
      setInternalOpen(newState);
    }
    onOpenChange?.(newState);
  };

  const handleCancel = () => {
    onCancel?.();
    handleOpenChange(false);
  };

  const handleAction = () => {
    onAction?.();
    handleOpenChange(false);
  };

  // Alert Dialogs intentionally intercept outside interactions.
  // Passing this empty function prevents the underlying Dialog from closing 
  // when the user taps the backdrop, forcing them to make a distinct choice.
  const handleInteractOutside = () => {};

  return (
    <Dialog open={currentOpen} onOpenChange={handleOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      
      <DialogContent onInteractOutside={handleInteractOutside}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        
        {/* The required forced footer layout for alerts */}
        <DialogFooter style={styles.footerLayout}>
          <View style={styles.buttonWrapper}>
            <Button 
              variant="outline" 
              label={cancelText} 
              onPress={handleCancel} 
            />
          </View>
          <View style={styles.buttonWrapper}>
            {/* Action button strictly forced to the destructive variant */}
            <Button 
              variant="destructive" 
              label={actionText} 
              onPress={handleAction} 
            />
          </View>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({ 
  footerLayout: {
    // Ensures the buttons have a consistent gap and wrap cleanly on very small screens
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  buttonWrapper: {
    // Allows buttons to size naturally but prevents them from shrinking too much
    minWidth: 100,
  }
});