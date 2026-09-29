import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

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

import { spacing } from '../lib/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AlertDialogProps {
  /**
   * The controlled open state of the alert dialog. Omit for uncontrolled use.
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
   * Styles the action button as destructive. Set false for actions that are
   * not destructive (for example "Sign out").
   * @default true
   */
  destructive?: boolean;
  /**
   * Callback fired when the user cancels: the cancel button, the Android back
   * button, or the Escape key.
   */
  onCancel?: () => void;
  /**
   * Callback fired when the action button is pressed.
   */
  onAction?: () => void;
  /**
   * The component that triggers the alert dialog to open.
   */
  children?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AlertDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  cancelText = 'Cancel',
  actionText = 'Continue',
  destructive = true,
  onCancel,
  onAction,
  children,
}: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
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

  // Back button / Escape reach us as a close request from the Dialog. That is
  // a cancel: the cancel button already runs handleCancel itself.
  const handleDialogOpenChange = (newState: boolean) => {
    if (!newState) onCancel?.();
    handleOpenChange(newState);
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
    <Dialog open={currentOpen} onOpenChange={handleDialogOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}

      <DialogContent
        onInteractOutside={handleInteractOutside}
        accessibilityRole="alert"
        accessibilityLabel={description ? `${title}. ${description}` : title}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {/* The required forced footer layout for alerts */}
        <DialogFooter style={[styles.footerLayout, { gap: spacing.sm, marginTop: spacing.md }]}>
          <View style={styles.buttonWrapper}>
            <Button
              variant="outline"
              title={cancelText}
              onPress={handleCancel}
              style={styles.fill}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              title={actionText}
              onPress={handleAction}
              style={styles.fill}
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
  },
  buttonWrapper: {
    // Sized to its label, then grown to share the row. A label that does not
    // fit next to its neighbour wraps to its own row instead of truncating.
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    minWidth: 100,
  },
  fill: {
    alignSelf: 'stretch',
  },
});

export default AlertDialog;
