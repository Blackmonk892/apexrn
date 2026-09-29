import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { spacing } from '../lib/colors';
import { Toast, type ToastProps } from './toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastProps['variant'];
  /** Auto-dismiss in milliseconds. @default 3000 */
  duration?: number;
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

// One toast is on screen at a time; the rest wait in order. Stacking would
// cover the app bar and make later messages unreadable on a phone.
export function Toaster({ children, topInset = 0 }: ToasterProps) {
  const [state, setState] = useState<{ current: QueuedToast | null; queue: QueuedToast[] }>({
    current: null,
    queue: [],
  });

  const show = useCallback((input: string | ToastOptions) => {
    const item: QueuedToast = { id: ++nextId, ...(typeof input === 'string' ? { title: input } : input) };
    setState((prev) => (prev.current ? { ...prev, queue: [...prev.queue, item] } : { current: item, queue: [] }));
  }, []);

  const dismissed = useCallback(() => {
    setState((prev) => ({ current: prev.queue[0] ?? null, queue: prev.queue.slice(1) }));
  }, []);

  const api = useMemo<ToastApi>(() => {
    const fn = ((input) => show(input)) as ToastApi;
    fn.success = (title, description) => show({ title, description, variant: 'success' });
    fn.error = (title, description) => show({ title, description, variant: 'destructive' });
    fn.warning = (title, description) => show({ title, description, variant: 'warning' });
    return fn;
  }, [show]);

  const { current } = state;
  return (
    <ToastContext.Provider value={api}>
      {children}
      {current ? (
        // key: each toast mounts fresh so it slides in again instead of reusing the last one's animation.
        <Toast
          key={current.id}
          visible
          title={current.title}
          description={current.description}
          variant={current.variant}
          duration={current.duration}
          onDismiss={dismissed}
          style={{ top: topInset + spacing.sm }}
        />
      ) : null}
    </ToastContext.Provider>
  );
}

export default Toaster;
