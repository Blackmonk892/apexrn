import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@apexrn/ui';
import { isHighlightMessage } from './protocol';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Registry {
  register: (slug: string, node: View | null) => void;
}

const HighlightContext = createContext<Registry | null>(null);

// Clear of each part's own border and hard shadow, so the outline reads as a marker, not as the part.
const GAP = 4;
const STROKE = 3;

/**
 * The landing page names parts from outside the phone; this draws the matching outline inside it.
 * Parts register under their component slug, and `apexrn:highlight` picks one (or null to clear).
 */
export function HighlightProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const nodes = useRef(new Map<string, View>());
  const root = useRef<View>(null);
  const [part, setPart] = useState<string | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  const registry = useMemo<Registry>(
    () => ({
      register: (slug, node) => {
        if (node) nodes.current.set(slug, node);
        else nodes.current.delete(slug);
      },
    }),
    [],
  );

  const measure = useCallback(() => {
    const node = part ? nodes.current.get(part) : undefined;
    if (!node || !root.current) {
      setRect(null);
      return;
    }
    const base = root.current;
    base.measureInWindow((rx, ry) => {
      node.measureInWindow((x, y, width, height) => {
        const next = width > 0 && height > 0 ? { x: x - rx, y: y - ry, width, height } : null;
        setRect((prev) =>
          prev && next && prev.x === next.x && prev.y === next.y && prev.width === next.width && prev.height === next.height ? prev : next,
        );
      });
    });
  }, [part]);

  useEffect(() => {
    measure();
    if (!part || Platform.OS !== 'web' || typeof window === 'undefined') return;
    // Parts move when the screen changes under them (a filter, a new tab), so the outline follows.
    const timer = setInterval(measure, 250);
    return () => clearInterval(timer);
  }, [part, measure]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    function onMessage(event: MessageEvent) {
      if (isHighlightMessage(event.data)) setPart(event.data.part);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <HighlightContext.Provider value={registry}>
      <View ref={root} style={styles.root}>
        {children}
        {rect ? (
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.outline,
              {
                borderColor: colors.foreground,
                left: rect.x - GAP - STROKE,
                top: rect.y - GAP - STROKE,
                width: rect.width + 2 * (GAP + STROKE),
                height: rect.height + 2 * (GAP + STROKE),
              },
            ]}
          />
        ) : null}
      </View>
    </HighlightContext.Provider>
  );
}

/** Wraps one part of the showcase so the landing page can outline it by slug. */
export function Part({ slug, style, ...props }: ViewProps & { slug: string }) {
  const registry = useContext(HighlightContext);
  if (!registry) throw new Error('Part must be used within HighlightProvider');
  const ref = useCallback((node: View | null) => registry.register(slug, node), [registry, slug]);
  return <View ref={ref} style={style} {...props} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  outline: { position: 'absolute', borderWidth: STROKE, zIndex: 100 },
});
