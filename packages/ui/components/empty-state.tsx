import { createContext, useContext, type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import Text, { type TextProps } from './text';

type Align = 'center' | 'start';

export interface EmptyStateProps extends ViewProps {
  children: ReactNode;
  /** @default 'center' */
  align?: Align;
}
export interface EmptyStateIconProps extends Omit<ViewProps, 'children'> {
  /** The glyph, or a function that receives the colour that reads on the block. */
  children: ReactNode | ((color: string) => ReactNode);
}
export type EmptyStateTitleProps = Omit<TextProps, 'variant' | 'tone'>;
export type EmptyStateDescriptionProps = Omit<TextProps, 'variant' | 'tone'>;
export interface EmptyStateActionsProps extends ViewProps {
  children: ReactNode;
}

const EmptyStateContext = createContext<{ align: Align } | null>(null);

function useEmptyState(part: string) {
  const ctx = useContext(EmptyStateContext);
  if (!ctx) throw new Error(`${part} must be used within EmptyState`);
  return ctx;
}

export function EmptyState({ children, align = 'center', style, ...props }: EmptyStateProps) {
  const cross = align === 'center' ? 'center' : 'flex-start';

  return (
    <EmptyStateContext.Provider value={{ align }}>
      <View
        style={[{ alignItems: cross, gap: spacing.sm, padding: spacing.xl }, style]}
        {...props}
      >
        {children}
      </View>
    </EmptyStateContext.Provider>
  );
}

export function EmptyStateIcon({ children, style, ...props }: EmptyStateIconProps) {
  const { colors } = useTheme();
  useEmptyState('EmptyStateIcon');

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ marginBottom: spacing.sm }}
    >
      <BrutalSurface
        pressable={false}
        elevation="flat"
        backgroundColor={colors.muted}
        style={style}
        surfaceStyle={styles.iconBlock}
        {...props}
      >
        {typeof children === 'function' ? children(colors.foreground) : children}
      </BrutalSurface>
    </View>
  );
}

export function EmptyStateTitle({ style, ...props }: EmptyStateTitleProps) {
  const { align } = useEmptyState('EmptyStateTitle');
  return <Text variant="title" style={[align === 'center' && styles.centerText, style]} {...props} />;
}

export function EmptyStateDescription({ style, ...props }: EmptyStateDescriptionProps) {
  const { align } = useEmptyState('EmptyStateDescription');
  return <Text variant="body" tone="muted" style={[align === 'center' && styles.centerText, style]} {...props} />;
}

export function EmptyStateActions({ style, ...props }: EmptyStateActionsProps) {
  const { align } = useEmptyState('EmptyStateActions');
  return (
    <View
      style={[
        styles.actions,
        {
          gap: spacing.md,
          marginTop: spacing.md,
          justifyContent: align === 'center' ? 'center' : 'flex-start',
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  iconBlock: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  centerText: { textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'stretch' },
});

export default EmptyState;
