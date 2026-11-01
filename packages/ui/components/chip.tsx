import { useState, type ReactNode } from 'react';
import { type GestureResponderEvent, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { borderWidths, spacing, touchTarget, type ColorScheme } from '../lib/colors';
import { CheckIcon, CloseIcon, WarningIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import { variants } from '../lib/variants';
import BrutalSurface from './brutal-surface';
import Text from './text';

export interface ChipProps {
  label: string;
  /** @default 'default' */
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  /**
   * Makes the chip a toggle (a filter). Controlled; pair with `onSelectedChange`.
   * A selected chip is an inverted block with a check mark, so the state reads
   * without relying on colour.
   */
  selected?: boolean;
  /** Initial state when uncontrolled toggle. */
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Press handler for an action chip (no toggle state). */
  onPress?: (e: GestureResponderEvent) => void;
  /**
   * Shows a remove control after the label, for entered values like recipients
   * or applied filters. It is its own touch target with its own label.
   */
  onRemove?: () => void;
  /** Accessibility label of the remove control. @default `Remove ${label}` */
  removeLabel?: string;
  /** Icon shown before the label. Decorative; may be a function of the ink colour. */
  icon?: ReactNode | ((color: string) => ReactNode);
  disabled?: boolean;
  testID?: string;
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
}

const CHIP_HEIGHT = 32;
const ICON_SIZE = 14;

const STATUS_ICONS = { destructive: CloseIcon, success: CheckIcon, warning: WarningIcon } as const;

type Tone = { fill: keyof ColorScheme; ink: keyof ColorScheme };

const look = variants({
  base: { tone: { fill: 'background', ink: 'foreground' } as Tone },
  variants: {
    variant: {
      default: {},
      destructive: { tone: { fill: 'destructive', ink: 'destructiveForeground' } },
      success: { tone: { fill: 'success', ink: 'successForeground' } },
      warning: { tone: { fill: 'warning', ink: 'warningForeground' } },
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Chip({
  label,
  variant = 'default',
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  onPress,
  onRemove,
  removeLabel,
  icon,
  disabled = false,
  testID,
  style,
}: ChipProps) {
  const { colors } = useTheme();
  const [internalSelected, setInternalSelected] = useState(defaultSelected ?? false);
  const isToggle =
    selectedProp !== undefined || defaultSelected !== undefined || onSelectedChange !== undefined;
  const selected = isToggle && (selectedProp ?? internalSelected);
  const canPress = isToggle || !!onPress;

  const { tone } = look({ variant });
  const isStatus = variant !== 'default';
  // Selected swaps fill and ink, so the state survives without the check mark.
  const fill = colors[selected ? tone.ink : tone.fill];
  const ink = colors[selected ? tone.fill : tone.ink];
  const hitSlop = Math.max(0, Math.ceil((touchTarget - CHIP_HEIGHT) / 2));
  const StatusIcon = isStatus ? STATUS_ICONS[variant] : null;

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    if (isToggle) {
      if (selectedProp === undefined) setInternalSelected(!selected);
      onSelectedChange?.(!selected);
    }
    onPress?.(e);
  };

  const content = (
    <>
      {StatusIcon ? (
        <View testID={`status-icon-${variant}`} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <StatusIcon size={ICON_SIZE} color={ink} />
        </View>
      ) : selected ? (
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <CheckIcon size={ICON_SIZE} color={ink} />
        </View>
      ) : null}
      {icon ? (
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {typeof icon === 'function' ? icon(ink) : icon}
        </View>
      ) : null}
      <Text variant="label" tone="inherit" numberOfLines={1} style={[styles.label, { color: ink }]}>
        {label}
      </Text>
    </>
  );

  const role = canPress ? 'button' : 'text';
  const state = { selected, disabled };

  // A removable chip holds two controls, so the outer block cannot itself be a
  // Pressable: nested touchables would merge into one accessibility node and
  // hide the remove button from screen readers.
  if (onRemove) {
    return (
      <BrutalSurface
        testID={testID}
        style={[styles.root, style]}
        pressable={false}
        disabled={disabled}
        elevation="control"
        borderWidth="control"
        backgroundColor={fill}
        surfaceStyle={[styles.surface, { minHeight: CHIP_HEIGHT }]}
      >
        <Pressable
          onPress={handlePress}
          disabled={disabled || !canPress}
          hitSlop={{ top: hitSlop, bottom: hitSlop }}
          style={[styles.part, { paddingLeft: spacing.md, paddingRight: spacing.sm, gap: spacing.xs }]}
          accessibilityRole={role}
          accessibilityLabel={label}
          accessibilityState={state}
        >
          {content}
        </Pressable>
        <Pressable
          onPress={onRemove}
          disabled={disabled}
          hitSlop={{ top: hitSlop, bottom: hitSlop, left: 4, right: 4 }}
          style={[styles.remove, { borderLeftColor: colors.border, paddingHorizontal: spacing.sm }]}
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? `Remove ${label}`}
          accessibilityState={{ disabled }}
        >
          <CloseIcon size={ICON_SIZE} color={ink} />
        </Pressable>
      </BrutalSurface>
    );
  }

  return (
    <BrutalSurface
      testID={testID}
      style={[styles.root, style]}
      surfaceStyle={[styles.surface, { minHeight: CHIP_HEIGHT, paddingHorizontal: spacing.md, gap: spacing.xs }]}
      elevation="control"
      borderWidth="control"
      pressable={canPress}
      disabled={disabled}
      onPress={handlePress}
      backgroundColor={fill}
      hitSlop={hitSlop}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={state}
    >
      {content}
    </BrutalSurface>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    // Without a cap, a nowrap label's min-content width defeats truncation.
    maxWidth: '100%',
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  part: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  remove: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: borderWidths.control,
  },
  label: { flexShrink: 1 },
});

export default Chip;
