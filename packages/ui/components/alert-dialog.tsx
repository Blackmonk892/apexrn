import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';
import { type GestureResponderEvent, StyleSheet, View, type ViewProps } from 'react-native';

import { spacing } from '../lib/colors';
import { CloseIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import Button, { type ButtonProps } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
  type DialogTriggerProps,
} from './dialog';
import type { TextProps } from './text';

interface AlertDialogContextState {
  destructive: boolean;
  /** Cancel and Action mark the close as handled so the close that follows is not reported as a back-press cancel. */
  markHandled: () => void;
  cancel: () => void;
}

const AlertDialogContext = createContext<AlertDialogContextState | undefined>(undefined);

function useAlertDialogContext(part: string) {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error(`${part} must be used within AlertDialog`);
  }
  return context;
}

interface AlertDialogRootProps {
  /** Controlled open state. Omit for an uncontrolled dialog. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Cancel button, Android back or Escape. */
  onCancel?: () => void;
  /** Styles the action as destructive and adds the status icon to the title. @default true with `title`, false with compound parts */
  destructive?: boolean;
}

export interface AlertDialogCompoundProps extends AlertDialogRootProps {
  title?: undefined;
  children?: ReactNode;
}

export interface AlertDialogConvenienceProps extends AlertDialogRootProps {
  title: string;
  description?: string;
  /** @default "Cancel" */
  cancelText?: string;
  /** @default "Continue" */
  actionText?: string;
  onAction?: () => void;
  /** The element that opens the dialog. It receives the press through `asChild`. */
  children?: ReactNode;
}

export type AlertDialogProps = AlertDialogCompoundProps | AlertDialogConvenienceProps;

export function AlertDialog(props: AlertDialogProps) {
  const { open, defaultOpen, onOpenChange, onCancel } = props;
  const destructive = props.destructive ?? props.title !== undefined;
  const handled = useRef(false);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        // Back and Escape reach Dialog as a bare close request; that is the cancel path.
        if (!handled.current) onCancel?.();
        handled.current = false;
      }
      onOpenChange?.(next);
    },
    [onCancel, onOpenChange],
  );

  const context = useMemo(
    () => ({
      destructive,
      markHandled: () => {
        handled.current = true;
      },
      cancel: () => onCancel?.(),
    }),
    [destructive, onCancel],
  );

  return (
    <AlertDialogContext.Provider value={context}>
      <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>
        {props.title !== undefined ? <Convenience {...props} /> : props.children}
      </Dialog>
    </AlertDialogContext.Provider>
  );
}

function Convenience({
  title,
  description,
  cancelText = 'Cancel',
  actionText = 'Continue',
  onAction,
  children,
}: AlertDialogConvenienceProps) {
  return (
    <>
      {children ? <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> : null}
      <AlertDialogContent accessibilityLabel={description ? `${title}. ${description}` : title}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel title={cancelText} />
          <AlertDialogAction title={actionText} onPress={onAction} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </>
  );
}

export function AlertDialogTrigger(props: DialogTriggerProps) {
  useAlertDialogContext('AlertDialogTrigger');
  return <DialogTrigger {...props} />;
}

// A no-op keeps the scrim from closing and takes it out of the screen-reader tree: the user has to choose.
const ignoreOutside = () => {};

export function AlertDialogContent(props: Omit<DialogContentProps, 'onInteractOutside'>) {
  useAlertDialogContext('AlertDialogContent');
  return <DialogContent accessibilityRole="alert" onInteractOutside={ignoreOutside} {...props} />;
}

export function AlertDialogHeader(props: ViewProps) {
  useAlertDialogContext('AlertDialogHeader');
  return <DialogHeader {...props} />;
}

export function AlertDialogTitle({ children, ...props }: TextProps) {
  const { destructive } = useAlertDialogContext('AlertDialogTitle');
  const { colors } = useTheme();

  if (!destructive) return <DialogTitle {...props}>{children}</DialogTitle>;

  return (
    <View style={[styles.titleRow, { gap: spacing.sm }]}>
      <View testID="status-icon-destructive" style={[styles.glyph, { backgroundColor: colors.destructive }]}>
        <CloseIcon size={20} color={colors.destructiveForeground} />
      </View>
      <View style={styles.titleText}>
        <DialogTitle {...props}>{children}</DialogTitle>
      </View>
    </View>
  );
}

export function AlertDialogDescription(props: TextProps) {
  useAlertDialogContext('AlertDialogDescription');
  return <DialogDescription {...props} />;
}

export function AlertDialogFooter({ style, ...props }: ViewProps) {
  useAlertDialogContext('AlertDialogFooter');
  return <DialogFooter style={[{ marginTop: spacing.md }, style]} {...props} />;
}

export type AlertDialogCancelProps = Omit<ButtonProps, 'variant'>;

export function AlertDialogCancel({ onPress, style, ...props }: AlertDialogCancelProps) {
  const { markHandled, cancel } = useAlertDialogContext('AlertDialogCancel');

  const handlePress = (e: GestureResponderEvent) => {
    markHandled();
    cancel();
    onPress?.(e);
  };

  return (
    <View style={styles.buttonWrapper}>
      <DialogClose asChild>
        <Button variant="outline" onPress={handlePress} style={[styles.fill, style]} {...props} />
      </DialogClose>
    </View>
  );
}

export interface AlertDialogActionProps extends Omit<ButtonProps, 'variant'> {
  /** Defaults to destructive when the dialog is destructive, primary otherwise. */
  variant?: 'primary' | 'destructive';
}

export function AlertDialogAction({ variant, onPress, style, ...props }: AlertDialogActionProps) {
  const { destructive, markHandled } = useAlertDialogContext('AlertDialogAction');

  const handlePress = (e: GestureResponderEvent) => {
    markHandled();
    onPress?.(e);
  };

  return (
    <View style={styles.buttonWrapper}>
      <DialogClose asChild>
        <Button
          variant={variant ?? (destructive ? 'destructive' : 'primary')}
          onPress={handlePress}
          style={[styles.fill, style]}
          {...props}
        />
      </DialogClose>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleText: { flex: 1 },
  glyph: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  // Sized to its label, then grown to share the row; a label that does not fit beside its neighbour wraps to its own row.
  buttonWrapper: { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 100 },
  fill: { alignSelf: 'stretch' },
});

export default AlertDialog;
