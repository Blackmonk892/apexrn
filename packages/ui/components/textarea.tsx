import { forwardRef, type ComponentRef, useId, useState } from 'react';
import {
  Platform,
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { spacing, textStyles, type ColorScheme } from '../lib/colors';
import { CloseIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import Label from './label';
import Text from './text';

export interface TextareaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
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
  /** Height of the empty field, in lines. @default 3 */
  minRows?: number;
  /** Lines of text before the field stops growing and scrolls. Unset grows without limit. */
  maxRows?: number;
  /** Fires with the new text, alongside `onChangeText`. */
  onValueChange?: (value: string) => void;
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
  /** Style for the underlying TextInput. */
  inputStyle?: StyleProp<TextStyle>;
  /** Style for the bordered surface around the TextInput. */
  surfaceStyle?: StyleProp<ViewStyle>;
}

const ERROR_ICON_SIZE = 16;

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export const Textarea = forwardRef<ComponentRef<typeof TextInput>, TextareaProps>(function Textarea(
  {
    label,
    required = false,
    description,
    invalid = false,
    errorMessage,
    disabled = false,
    editable = true,
    minRows = 3,
    maxRows,
    value,
    defaultValue,
    maxLength,
    onValueChange,
    onChangeText,
    onContentSizeChange,
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
  const [typed, setTyped] = useState(defaultValue?.length ?? 0);
  const [content, setContent] = useState(0);
  const labelId = useId();
  const pad = spacing.sm;
  const showError = invalid && !!errorMessage;
  const count = value !== undefined ? value.length : typed;

  const lineHeight = textStyles.body.lineHeight ?? 22;
  const minHeight = minRows * lineHeight + pad * 2;
  const maxHeight = maxRows ? Math.max(maxRows, minRows) * lineHeight + pad * 2 : Infinity;
  // A multiline TextInput has no row limits of its own, so the height is set from the measured
  // content and clamped to the row bounds.
  const height = clamp(content + pad * 2, minHeight, maxHeight);

  const hint = [accessibilityHint, description, showError ? errorMessage : undefined].filter(Boolean).join('. ') || undefined;
  // iOS has no accessibilityLabelledBy, so the label text is repeated on the field.
  const spoken = accessibilityLabel ?? (label ? (required ? `${label}, required` : label) : undefined);

  const handleContentSize = (e: Parameters<NonNullable<TextInputProps['onContentSizeChange']>>[0]) => {
    // On web the reported height is the element's scrollHeight: it already includes the padding
    // and never drops below the current height, so adding the padding again grew the field on
    // every render (an update loop without maxRows).
    const measured = e.nativeEvent.contentSize.height - (Platform.OS === 'web' ? pad * 2 : 0);
    setContent((prev) => (Math.abs(prev - measured) < 1 ? prev : measured));
    onContentSizeChange?.(e);
  };

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
        surfaceStyle={surfaceStyle}
      >
        <TextInput
          ref={ref}
          multiline
          textAlignVertical="top"
          style={[textStyles.body, inputStyles(colors, pad), { height }, inputStyle]}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
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
            setTyped(text.length);
            onChangeText?.(text);
            onValueChange?.(text);
          }}
          onContentSizeChange={handleContentSize}
          placeholderTextColor={placeholderTextColor ?? colors.mutedForeground}
          maxFontSizeMultiplier={1.3}
          aria-invalid={invalid || undefined}
          accessibilityState={{ disabled }}
          accessibilityLabel={spoken}
          accessibilityLabelledBy={label ? labelId : undefined}
          accessibilityHint={hint}
          {...props}
        />
      </BrutalSurface>

      {showError || maxLength !== undefined ? (
        <View style={styles.footer}>
          {showError ? (
            // The field's hint already carries this text, so screen readers skip the row.
            <View style={styles.error} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <View testID="textarea-error-icon">
                <CloseIcon size={ERROR_ICON_SIZE} color={colors.destructive} />
              </View>
              <Text variant="label" tone="inherit" style={[styles.errorText, { color: colors.destructive }]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}
          {maxLength !== undefined ? (
            <Text variant="mono" tone="muted" testID="textarea-counter" style={styles.counter}>
              {`${count} / ${maxLength}`}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

// Resolved per render: theme colours change with mode and preset.
const inputStyles = (c: ColorScheme, pad: number): TextStyle => ({
  color: c.foreground,
  paddingVertical: pad,
  paddingHorizontal: spacing.md,
});

const styles = StyleSheet.create({
  // stretch rather than width: 100% so the wrapper never pushes past its parent.
  root: { alignSelf: 'stretch' },
  description: { marginBottom: spacing.xs },
  footer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.sm, gap: spacing.md },
  error: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  errorText: { flexShrink: 1 },
  counter: { marginLeft: 'auto' },
});

export default Textarea;
