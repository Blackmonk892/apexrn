import { useState, type ReactNode } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { borderWidths, spacing, touchTarget, typography } from '../lib/colors';
import { CheckIcon, CloseIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ChipProps {
  label: string;
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
  /** Icon shown before the label. Decorative; may be a function of the contrast colour. */
  icon?: ReactNode | ((color: string) => ReactNode);
  disabled?: boolean;
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 2;
const CHIP_HEIGHT = 36;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Chip({
  label,
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  onPress,
  onRemove,
  removeLabel,
  icon,
  disabled = false,
  style,
}: ChipProps) {
  const { colors } = useTheme();
  const [internalSelected, setInternalSelected] = useState(defaultSelected ?? false);
  const isToggle =
    selectedProp !== undefined || defaultSelected !== undefined || onSelectedChange !== undefined;
  const selected = isToggle && (selectedProp ?? internalSelected);

  const bg = disabled ? colors.muted : selected ? colors.foreground : colors.background;
  const fg = disabled ? colors.mutedForeground : selected ? colors.background : colors.foreground;
  const border = disabled ? colors.mutedForeground : colors.border;
  const hitSlop = Math.max(0, Math.ceil((touchTarget - CHIP_HEIGHT) / 2));

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
      {selected ? <CheckIcon size={14} color={fg} strokeWidth={4} /> : null}
      {icon ? (
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {typeof icon === 'function' ? icon(fg) : icon}
        </View>
      ) : null}
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={1.3}
        style={[styles.label, { color: fg, fontSize: typography.xs }]}
      >
        {label}
      </Text>
    </>
  );

  const surfaceStyle = [
    styles.surface,
    {
      minHeight: CHIP_HEIGHT,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
      borderStyle: disabled ? ('dashed' as const) : ('solid' as const),
    },
  ];

  // A removable chip holds two controls (toggle/press and remove), so the
  // outer block cannot itself be a Pressable: nested touchables would merge
  // into one accessibility node and hide the remove button from screen readers.
  if (onRemove) {
    const canPress = isToggle || !!onPress;
    return (
      <BrutalSurface
        style={[styles.root, style]}
        pressable={false}
        offset={SHADOW_OFFSET}
        borderWidth="standard"
        hasShadow={!disabled}
        backgroundColor={bg}
        borderColor={border}
        surfaceStyle={[styles.surface, { minHeight: CHIP_HEIGHT, borderStyle: disabled ? 'dashed' : 'solid' }]}
      >
        <Pressable
          onPress={handlePress}
          disabled={disabled || !canPress}
          hitSlop={{ top: hitSlop, bottom: hitSlop }}
          style={[styles.part, { paddingLeft: spacing.md, paddingRight: spacing.sm, gap: spacing.xs }]}
          accessibilityRole={isToggle ? 'checkbox' : canPress ? 'button' : 'text'}
          accessibilityLabel={label}
          accessibilityState={isToggle ? { checked: selected, disabled } : { disabled }}
          aria-disabled={disabled}
        >
          {content}
        </Pressable>
        <Pressable
          onPress={disabled ? undefined : onRemove}
          disabled={disabled}
          hitSlop={{ top: hitSlop, bottom: hitSlop, right: 4 }}
          style={[styles.remove, { borderLeftColor: border, paddingHorizontal: spacing.sm }]}
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? `Remove ${label}`}
          accessibilityState={{ disabled }}
        >
          <CloseIcon size={14} color={fg} strokeWidth={4} />
        </Pressable>
      </BrutalSurface>
    );
  }

  return (
    <BrutalSurface
      style={[styles.root, style]}
      surfaceStyle={surfaceStyle}
      offset={SHADOW_OFFSET}
      borderWidth="standard"
      hasShadow={!disabled}
      disabled={disabled}
      onPress={handlePress}
      backgroundColor={bg}
      borderColor={border}
      hitSlop={hitSlop}
      accessibilityRole={isToggle ? 'checkbox' : onPress ? 'button' : 'text'}
      accessibilityLabel={label}
      accessibilityState={isToggle ? { checked: selected, disabled } : { disabled }}
      aria-checked={isToggle ? selected : undefined}
      aria-disabled={disabled}
    >
      {content}
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
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
    borderLeftWidth: borderWidths.standard,
  },
  label: {
    flexShrink: 1,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

export default Chip;
