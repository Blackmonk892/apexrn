import { createContext, useContext, type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { borderWidths, spacing, type ColorScheme } from '../lib/colors';
import { CheckIcon, CloseIcon, WarningIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import { variants } from '../lib/variants';
import BrutalSurface from './brutal-surface';
import Text, { type TextProps } from './text';

type Variant = 'default' | 'destructive' | 'success' | 'warning';

export interface CardProps extends Omit<ViewProps, 'children'> {
  children: ReactNode;
  /**
   * Status variants add a full-width band at the top with the status colour,
   * icon and word, so colour is never the only signal.
   * @default 'default'
   */
  variant?: Variant;
  /** Replaces the spoken and visible status word (Error, Success, Warning). */
  statusLabel?: string;
  /** Makes the card a button that sinks when pressed. */
  onPress?: () => void;
  /** Only meaningful with `onPress`. */
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export interface CardHeaderProps extends ViewProps {
  children: ReactNode;
}
export interface CardContentProps extends ViewProps {
  children: ReactNode;
}
export interface CardFooterProps extends ViewProps {
  children: ReactNode;
}
export type CardTitleProps = Omit<TextProps, 'variant' | 'tone'>;
export type CardDescriptionProps = Omit<TextProps, 'variant' | 'tone'>;

const ICON_SIZE = 14;

const STATUS = {
  destructive: { Icon: CloseIcon, word: 'Error' },
  success: { Icon: CheckIcon, word: 'Success' },
  warning: { Icon: WarningIcon, word: 'Warning' },
} as const;

type Tone = { rule: keyof ColorScheme | null; ink: keyof ColorScheme | null };

const look = variants({
  base: { tone: { rule: null, ink: null } as Tone },
  variants: {
    variant: {
      default: {},
      destructive: { tone: { rule: 'destructive', ink: 'destructiveForeground' } },
      success: { tone: { rule: 'success', ink: 'successForeground' } },
      warning: { tone: { rule: 'warning', ink: 'warningForeground' } },
    },
  },
  defaultVariants: { variant: 'default' },
});

type CardContextValue = { variant: Variant };

const CardContext = createContext<CardContextValue | null>(null);

function useCard(part: string) {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error(`${part} must be used within Card`);
  return ctx;
}

export function Card({
  children,
  variant = 'default',
  statusLabel,
  onPress,
  disabled,
  accessibilityLabel,
  style,
  ...props
}: CardProps) {
  const { colors } = useTheme();
  const { tone } = look({ variant });
  const isPressable = !!onPress;
  const status = variant === 'default' ? null : STATUS[variant];
  const word = statusLabel ?? status?.word;

  return (
    <CardContext.Provider value={{ variant }}>
      <BrutalSurface
        style={style}
        elevation="card"
        pressable={isPressable}
        disabled={disabled}
        onPress={onPress}
        accessibilityRole={isPressable ? 'button' : undefined}
        // The band's word would otherwise be replaced by the consumer's label.
        accessibilityLabel={word && accessibilityLabel ? `${word}. ${accessibilityLabel}` : accessibilityLabel}
        {...props}
      >
        {status && tone.rule && tone.ink ? (
          <View
            testID="card-status-rule"
            style={[
              styles.band,
              { backgroundColor: colors[tone.rule], paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, gap: spacing.xs },
            ]}
          >
            <View testID={`status-icon-${variant}`} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <status.Icon size={ICON_SIZE} color={colors[tone.ink]} />
            </View>
            <Text variant="label" tone="inherit" style={{ color: colors[tone.ink] }}>
              {word}
            </Text>
          </View>
        ) : null}
        <View style={{ padding: spacing.lg }}>{children}</View>
      </BrutalSurface>
    </CardContext.Provider>
  );
}

// Header and footer bleed out of the card's padding so their rules run edge to
// edge instead of floating inside the content inset.
export function CardHeader({ children, style, ...props }: CardHeaderProps) {
  const { colors } = useTheme();
  useCard('CardHeader');

  return (
    <View
      style={[
        styles.header,
        {
          marginHorizontal: -spacing.lg,
          marginTop: -spacing.lg,
          marginBottom: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.sm,
          gap: spacing.xs,
          borderBottomColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardTitle(props: CardTitleProps) {
  useCard('CardTitle');
  return <Text variant="title" {...props} />;
}

export function CardDescription(props: CardDescriptionProps) {
  useCard('CardDescription');
  return <Text variant="body" tone="muted" {...props} />;
}

export function CardContent({ style, ...props }: CardContentProps) {
  useCard('CardContent');
  return <View style={[{ gap: spacing.sm }, style]} {...props} />;
}

export function CardFooter({ children, style, ...props }: CardFooterProps) {
  const { colors } = useTheme();
  useCard('CardFooter');

  return (
    <View
      style={[
        styles.footer,
        {
          marginHorizontal: -spacing.lg,
          marginBottom: -spacing.lg,
          marginTop: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
          borderTopColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: borderWidths.control },
  footer: { borderTopWidth: borderWidths.control },
  band: { flexDirection: 'row', alignItems: 'center' },
});

export default Card;
