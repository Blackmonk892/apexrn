import { forwardRef, type ComponentRef, useId, useState, type ReactNode } from 'react';
import {
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { controlHeight, spacing, textStyles, touchTarget, type ColorScheme } from '../lib/colors';
import { CloseIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import { variants } from '../lib/variants';
import BrutalSurface from './brutal-surface';
import Label from './label';
import Text from './text';

type Size = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Visible label, wired to the field for screen readers on both platforms. */
  label?: string;
  /** Adds `*` to the label and announces the field as required. */
  required?: boolean;
  /** Helper text under the label. Read with the field. */
  description?: string;
  /** Marks the value as invalid: destructive border and `aria-invalid`. */
  invalid?: boolean;
  /** Shown under the field with an icon while `invalid`, and read with the field. */
  errorMessage?: string;
  /** Dashed border, not editable, no focus ring. */
  disabled?: boolean;
  /** @default 'md' */
  size?: Size;
  /** Sits inside the border before the text. Not hidden from assistive tech, so a decorative icon should hide itself. */
  leading?: ReactNode;
  /** Sits inside the border after the text. May be interactive, such as a clear button. */
  trailing?: ReactNode;
  /** Fires with the new text, alongside `onChangeText`. */
  onValueChange?: (value: string) => void;
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
  /** Style for the underlying TextInput. */
  inputStyle?: StyleProp<TextStyle>;
  /** Style for the bordered surface around the TextInput and its slots. */
  surfaceStyle?: StyleProp<ViewStyle>;
}

// Resolved per render: theme colours change with mode and preset.
const inputStyles = (c: ColorScheme) =>
  variants({
    base: {
      surface: { flexDirection: 'row', alignItems: 'center' } as ViewStyle,
      input: { flex: 1, alignSelf: 'stretch', color: c.foreground, paddingVertical: spacing.sm } as TextStyle,
    },
    variants: {
      size: {
        sm: { surface: { minHeight: controlHeight.sm } },
        md: { surface: { minHeight: controlHeight.md } },
        lg: { surface: { minHeight: controlHeight.lg } },
      },
    },
    defaultVariants: { size: 'md' },
  });

const ERROR_ICON_SIZE = 16;

export const Input = forwardRef<ComponentRef<typeof TextInput>, InputProps>(function Input(
  {
    label,
    required = false,
    description,
    invalid = false,
    errorMessage,
    disabled = false,
    editable = true,
    size = 'md',
    leading,
    trailing,
    onValueChange,
    onChangeText,
    onFocus,
    onBlur,
    placeholderTextColor,
    accessibilityLabel,
    accessibilityHint,
    style,
    inputStyle,
    surfaceStyle,
    ...props
  },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const labelId = useId();
  const look = inputStyles(colors)({ size });
  const showError = invalid && !!errorMessage;
  const height = controlHeight[size];

  // The hint is the one channel that carries both pieces of helper copy with the field.
  const hint = [accessibilityHint, description, showError ? errorMessage : undefined].filter(Boolean).join('. ') || undefined;
  // iOS has no accessibilityLabelledBy, so the label text is repeated on the field.
  const spoken = accessibilityLabel ?? (label ? (required ? `${label}, required` : label) : undefined);

  return (
    <View style={[styles.root, style]}>
      {label ? (
        <Label
          nativeID={labelId}
          required={required}
          disabled={disabled}
          // iOS reads the field's own label; Android needs this node reachable for accessibilityLabelledBy.
          accessibilityElementsHidden
        >
          {label}
        </Label>
      ) : null}
      {description ? (
        <Text tone="muted" style={styles.description} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {description}
        </Text>
      ) : null}

      <BrutalSurface
        pressable={false}
        elevation="flat"
        borderWidth="control"
        disabled={disabled}
        invalid={invalid}
        focused={focused}
        borderColor={colors.input}
        surfaceStyle={[look.surface, surfaceStyle]}
      >
        {leading ? <View style={{ paddingLeft: spacing.md }}>{leading}</View> : null}
        <TextInput
          ref={ref}
          style={[
            textStyles.body,
            look.input,
            { paddingLeft: leading ? spacing.sm : spacing.md, paddingRight: trailing ? spacing.sm : spacing.md },
            inputStyle,
          ]}
          editable={editable && !disabled}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onChangeText={(text) => {
            onChangeText?.(text);
            onValueChange?.(text);
          }}
          placeholderTextColor={placeholderTextColor ?? colors.mutedForeground}
          maxFontSizeMultiplier={1.3}
          hitSlop={Math.max(0, Math.ceil((touchTarget - height) / 2))}
          aria-invalid={invalid || undefined}
          accessibilityState={{ disabled }}
          accessibilityLabel={spoken}
          accessibilityLabelledBy={label ? labelId : undefined}
          accessibilityHint={hint}
          {...props}
        />
        {trailing ? <View style={{ paddingRight: spacing.md }}>{trailing}</View> : null}
      </BrutalSurface>

      {showError ? (
        // The field's hint already carries this text, so screen readers skip the row.
        <View style={styles.error} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <View testID="input-error-icon">
            <CloseIcon size={ERROR_ICON_SIZE} color={colors.destructive} />
          </View>
          <Text variant="label" tone="inherit" style={[styles.errorText, { color: colors.destructive }]}>
            {errorMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  // stretch rather than width: 100% so the wrapper never pushes past its parent.
  root: { alignSelf: 'stretch' },
  description: { marginBottom: spacing.xs },
  error: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  errorText: { flexShrink: 1 },
});

export default Input;
