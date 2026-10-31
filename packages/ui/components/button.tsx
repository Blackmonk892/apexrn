import { useEffect, useState, type ReactNode } from 'react';
import {
  type GestureResponderEvent,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { controlHeight, spacing, touchTarget, type ColorScheme } from '../lib/colors';
import { CheckIcon, CloseIcon, WarningIcon } from '../lib/icons';
import { LoadingBlocks } from '../lib/loading-blocks';
import { useTheme } from '../lib/theme';
import { variants } from '../lib/variants';
import BrutalSurface, { type BrutalSurfaceProps } from './brutal-surface';
import Text from './text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button label. `<Button>Save</Button>` and `<Button title="Save" />` are equivalent; children win. */
  children?: ReactNode;
  /** Label as a prop. Use this or `children`. */
  title?: string;
  onPress?: (e: GestureResponderEvent) => void;
  /** @default 'primary' */
  variant?: Variant;
  /** @default 'md' */
  size?: Size;
  disabled?: boolean;
  /** Swaps the label for loading blocks without changing the width. Presses are ignored; the look stays live. */
  loading?: boolean;
  /** Replaces the status icon on `destructive`, `success` and `warning`. */
  icon?: ReactNode;
  /** @default 'left' */
  iconPosition?: 'left' | 'right';
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
  /** Falls back to the label text. Required when the button has an icon and no label. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Lands on the pressable itself. */
  testID?: string;
}

const STATUS_ICONS = { destructive: CloseIcon, success: CheckIcon, warning: WarningIcon } as const;
const ICON_SIZE = 20;

// Resolved per render: theme colours change with mode and preset, spacing with window size.
const buttonStyles = (c: ColorScheme) =>
  variants({
    base: {
      surface: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' } as ViewStyle,
      label: { flexShrink: 1 } as TextStyle,
      depth: { elevation: 'card' } as { elevation: NonNullable<BrutalSurfaceProps['elevation']> },
    },
    variants: {
      variant: {
        primary: { surface: { backgroundColor: c.primary }, label: { color: c.primaryForeground } },
        secondary: { surface: { backgroundColor: c.secondary }, label: { color: c.secondaryForeground } },
        outline: { surface: { backgroundColor: c.background }, label: { color: c.foreground }, depth: { elevation: 'control' } },
        // The transparent border keeps ghost the same size as its siblings.
        ghost: {
          surface: { backgroundColor: 'transparent', borderColor: 'transparent' },
          label: { color: c.foreground },
          depth: { elevation: 'flat' },
        },
        destructive: { surface: { backgroundColor: c.destructive }, label: { color: c.destructiveForeground } },
        success: { surface: { backgroundColor: c.success }, label: { color: c.successForeground } },
        warning: { surface: { backgroundColor: c.warning }, label: { color: c.warningForeground } },
      },
      size: {
        sm: { surface: { minHeight: controlHeight.sm, paddingHorizontal: spacing.md } },
        md: { surface: { minHeight: controlHeight.md, paddingHorizontal: spacing.lg } },
        lg: { surface: { minHeight: controlHeight.lg, paddingHorizontal: spacing.xl } },
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  });

let warnedIconOnly = false;

export function Button({
  children,
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const [held, setHeld] = useState(false);
  const label = children ?? title;
  const hasLabel = label != null && label !== '';
  const look = buttonStyles(colors)({ variant, size });
  const height = controlHeight[size];

  // onPressOut is not guaranteed once the button stops accepting presses mid-hold.
  useEffect(() => {
    if (disabled || loading) setHeld(false);
  }, [disabled, loading]);

  if (__DEV__ && !hasLabel && !accessibilityLabel && !warnedIconOnly) {
    warnedIconOnly = true;
    console.warn('Button: an icon-only button needs an accessibilityLabel.');
  }

  const fg = look.label.color as string;
  const StatusIcon = variant in STATUS_ICONS ? STATUS_ICONS[variant as keyof typeof STATUS_ICONS] : null;
  const leading =
    icon != null && iconPosition === 'left' ? icon : icon == null && StatusIcon ? (
      <View testID={`status-icon-${variant}`}>
        <StatusIcon size={ICON_SIZE} color={fg} />
      </View>
    ) : null;
  const trailing = icon != null && iconPosition === 'right' ? icon : null;

  // Ghost has no shadow to sink into, so a fill is its only press feedback.
  const ghostPressed = variant === 'ghost' && held && !disabled && !loading;
  const surfaceFill = ghostPressed ? { backgroundColor: colors.secondary } : null;
  const labelColor = ghostPressed ? colors.secondaryForeground : fg;

  return (
    <BrutalSurface
      testID={testID}
      style={[styles.root, style]}
      surfaceStyle={[look.surface, surfaceFill]}
      elevation={look.depth.elevation}
      borderWidth="control"
      disabled={disabled}
      haptics={!loading}
      onPress={loading ? undefined : onPress}
      onPressIn={() => setHeld(true)}
      onPressOut={() => setHeld(false)}
      hitSlop={Math.max(0, Math.ceil((touchTarget - height) / 2))}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof label === 'string' || typeof label === 'number' ? String(label) : undefined)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: loading }}
    >
      {/* Stays laid out while loading so the blocks never change the button's width. */}
      <View style={[styles.content, loading && styles.hidden]}>
        {leading ? <View style={styles.iconLeading} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>{leading}</View> : null}
        {hasLabel ? (
          <Text variant="title" tone="inherit" accessibilityRole="none" numberOfLines={1} style={[look.label, { color: labelColor }]}>
            {label}
          </Text>
        ) : null}
        {trailing ? <View style={styles.iconTrailing} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>{trailing}</View> : null}
      </View>
      {loading ? (
        <View style={styles.blocks} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <LoadingBlocks color={fg} />
        </View>
      ) : null}
    </BrutalSurface>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'flex-start' },
  content: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  hidden: { opacity: 0 },
  blocks: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  iconLeading: { marginRight: spacing.sm },
  iconTrailing: { marginLeft: spacing.sm },
});

export default Button;
