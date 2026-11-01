import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../lib/colors';
import { Toast, type ToastAction, type ToastProps } from './toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastProps['variant'];
  /** Auto-dismiss in milliseconds. @default 3000 */
  duration?: number;
  action?: ToastAction;
}

export interface ToastApi {
  /** `toast('Saved')` or `toast({ title, description, variant, duration })`. */
  (input: string | ToastOptions): void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

export interface ToasterProps {
  children: ReactNode;
  /** Safe-area top inset, so toasts clear the notch. Pass `useSafeAreaInsets().top`. @default 0 */
  topInset?: number;
}

interface QueuedToast extends ToastOptions {
  id: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastApi | null>(null);

/** Returns the `toast()` function. Must be called under <Toaster>. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <Toaster>.');
  return api;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

let nextId = 0;

const MAX_VISIBLE = 3;

// At most three toasts are on screen, stacked top-down in arrival order; the rest wait their turn.
export function Toaster({ children, topInset = 0 }: ToasterProps) {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);

  const show = useCallback((input: string | ToastOptions) => {
    const item: QueuedToast = { id: ++nextId, ...(typeof input === 'string' ? { title: input } : input) };
    setToasts((prev) => [...prev, item]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api = useMemo<ToastApi>(() => {
    const fn = ((input) => show(input)) as ToastApi;
    fn.success = (title, description) => show({ title, description, variant: 'success' });
    fn.error = (title, description) => show({ title, description, variant: 'destructive' });
    fn.warning = (title, description) => show({ title, description, variant: 'warning' });
    return fn;
  }, [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View
        pointerEvents="box-none"
        style={[styles.stack, { top: topInset + spacing.sm, gap: spacing.sm, paddingHorizontal: spacing.md }]}
      >
        {toasts.slice(0, MAX_VISIBLE).map((t) => (
          // key: each toast mounts fresh so it slides in on its own timeline.
          <Toast
            key={t.id}
            visible
            title={t.title}
            description={t.description}
            variant={t.variant}
            duration={t.duration}
            action={t.action}
            onDismiss={() => dismiss(t.id)}
            style={styles.item}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  stack: { position: 'absolute', left: 0, right: 0, zIndex: 9999 },
  // The stack owns position and inset; each toast sits in flow.
  item: { position: 'relative', top: 0, left: 0, right: 0 },
});

export default Toaster;
