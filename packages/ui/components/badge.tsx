import type { ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { spacing, type ColorScheme } from '../lib/colors';
import { CheckIcon, CloseIcon, WarningIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import { variants } from '../lib/variants';
import BrutalSurface from './brutal-surface';
import Text from './text';

export interface BadgeProps extends ViewProps {
  /** @default 'default' */
  variant?: 'default' | 'primary' | 'outline' | 'accent' | 'destructive' | 'success' | 'warning';
  /** Text for the badge. `children` take precedence. */
  label?: string;
  /** A number shown in mono. Takes precedence over `label`; `children` still win. */
  count?: number;
  /** Largest count shown before it reads `<max>+`. @default 99 */
  max?: number;
  children?: ReactNode;
}

const ICON_SIZE = 14;

const STATUS_ICONS = { destructive: CloseIcon, success: CheckIcon, warning: WarningIcon } as const;

type Tone = { fill: keyof ColorScheme; ink: keyof ColorScheme };

// Fill role and the foreground role that is contrast-checked against it.
const look = variants({
  base: { tone: { fill: 'foreground', ink: 'background' } as Tone },
  variants: {
    variant: {
      default: {},
      primary: { tone: { fill: 'primary', ink: 'primaryForeground' } },
      outline: { tone: { fill: 'background', ink: 'foreground' } },
      accent: { tone: { fill: 'accent', ink: 'accentForeground' } },
      destructive: { tone: { fill: 'destructive', ink: 'destructiveForeground' } },
      success: { tone: { fill: 'success', ink: 'successForeground' } },
      warning: { tone: { fill: 'warning', ink: 'warningForeground' } },
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Badge({ variant = 'default', label, count, max = 99, children, style, ...props }: BadgeProps) {
  const { colors } = useTheme();
  const { tone } = look({ variant });
  const ink = colors[tone.ink];

  const isCount = children == null && count != null;
  const content = children ?? (isCount ? (count > max ? `${max}+` : String(count)) : label) ?? '';
  const StatusIcon = variant in STATUS_ICONS ? STATUS_ICONS[variant as keyof typeof STATUS_ICONS] : null;

  return (
    <BrutalSurface
      style={[styles.container, style]}
      surfaceStyle={[styles.surface, { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }]}
      backgroundColor={colors[tone.fill]}
      elevation="flat"
      borderWidth="control"
      pressable={false}
      accessible={typeof content === 'string'}
      accessibilityRole="text"
      // A capped count would read "99+"; screen readers get the real number.
      accessibilityLabel={isCount ? String(count) : undefined}
      {...props}
    >
      {StatusIcon ? (
        <View
          testID={`status-icon-${variant}`}
          style={{ marginRight: spacing.xs }}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <StatusIcon size={ICON_SIZE} color={ink} />
        </View>
      ) : null}
      {typeof content === 'string' ? (
        <Text
          variant={isCount ? 'mono' : 'label'}
          tone="inherit"
          style={[styles.text, { color: ink }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {content}
        </Text>
      ) : (
        content
      )}
    </BrutalSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    // Without a cap, a nowrap label's min-content width defeats truncation.
    maxWidth: '100%',
  },
  // Row + shrinkable text so long labels truncate instead of overflowing.
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flexShrink: 1 },
});

export default Badge;
