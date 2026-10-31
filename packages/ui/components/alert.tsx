import { createContext, useContext, type ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { spacing, type ColorScheme } from '../lib/colors';
import { CheckIcon, CloseIcon, InfoIcon, WarningIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import { variants } from '../lib/variants';
import BrutalSurface from './brutal-surface';
import Text, { type TextProps } from './text';

export interface AlertProps extends ViewProps {
  /** @default 'default' */
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  /** Shorthand for an `AlertTitle` child. */
  title?: string;
  /** Shorthand for an `AlertDescription` child. */
  description?: string;
  /** Replaces the status icon. Decorative: hidden from assistive tech. */
  icon?: ReactNode;
  /** Sits under the text, usually a `Button`. */
  action?: ReactNode;
  children?: ReactNode;
}

const GLYPH_SIZE = 22;
const ICON_SIZE = 16;

const STATUS = {
  default: { Icon: InfoIcon, name: 'info', spoken: '' },
  destructive: { Icon: CloseIcon, name: 'destructive', spoken: 'Error. ' },
  warning: { Icon: WarningIcon, name: 'warning', spoken: 'Warning. ' },
  success: { Icon: CheckIcon, name: 'success', spoken: 'Success. ' },
} as const;

type Tone = { fill: keyof ColorScheme; ink: keyof ColorScheme };

// Fill role and the foreground role that is contrast-checked against it.
const look = variants({
  base: { tone: { fill: 'background', ink: 'foreground' } as Tone },
  variants: {
    variant: {
      default: {},
      destructive: { tone: { fill: 'destructive', ink: 'destructiveForeground' } },
      warning: { tone: { fill: 'warning', ink: 'warningForeground' } },
      success: { tone: { fill: 'success', ink: 'successForeground' } },
    },
  },
  defaultVariants: { variant: 'default' },
});

interface AlertContextValue {
  ink: string;
  spoken: string;
}

const AlertContext = createContext<AlertContextValue | null>(null);

function useAlert(part: string) {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error(`${part} must be used within Alert`);
  return ctx;
}

export function Alert({
  variant = 'default',
  title,
  description,
  icon,
  action,
  children,
  style,
  ...props
}: AlertProps) {
  const { colors } = useTheme();
  const { tone } = look({ variant });
  const fill = colors[tone.fill];
  const ink = colors[tone.ink];
  const status = STATUS[variant];
  const announces = variant === 'destructive' || variant === 'warning';

  return (
    <AlertContext.Provider value={{ ink, spoken: status.spoken }}>
      <BrutalSurface
        style={[styles.container, style]}
        surfaceStyle={[styles.surface, { padding: spacing.md }]}
        backgroundColor={fill}
        elevation="flat"
        borderWidth="container"
        pressable={false}
        // Only urgent variants interrupt; info and success are read in focus order.
        accessibilityRole={announces ? 'alert' : undefined}
        accessibilityLiveRegion={announces ? 'assertive' : undefined}
        {...props}
      >
        <View
          style={{ marginRight: spacing.sm }}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          {icon ?? (
            <View testID={`status-icon-${status.name}`} style={[styles.glyph, { backgroundColor: ink }]}>
              <status.Icon size={ICON_SIZE} color={fill} />
            </View>
          )}
        </View>

        <View style={[styles.content, { gap: spacing.xs }]}>
          {title ? <AlertTitle>{title}</AlertTitle> : null}
          {description ? <AlertDescription>{description}</AlertDescription> : null}
          {children}
          {action ? <View style={{ marginTop: spacing.sm }}>{action}</View> : null}
        </View>
      </BrutalSurface>
    </AlertContext.Provider>
  );
}

export function AlertTitle({ children, style, accessibilityLabel, ...props }: TextProps) {
  const { ink, spoken } = useAlert('AlertTitle');
  return (
    <Text
      variant="label"
      tone="inherit"
      numberOfLines={2}
      accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? `${spoken}${children}` : undefined)}
      style={[{ color: ink }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Full ink, not mutedForeground: muted drops below 4.5:1 on the coloured fills.
export function AlertDescription({ style, ...props }: TextProps) {
  const { ink } = useAlert('AlertDescription');
  return <Text variant="body" tone="inherit" style={[{ color: ink }, style]} {...props} />;
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch' },
  surface: { flexDirection: 'row', alignItems: 'flex-start' },
  glyph: { width: GLYPH_SIZE, height: GLYPH_SIZE, alignItems: 'center', justifyContent: 'center' },
  // minWidth 0 lets long text wrap inside the row instead of pushing past the border.
  content: { flex: 1, minWidth: 0 },
});

export default Alert;
