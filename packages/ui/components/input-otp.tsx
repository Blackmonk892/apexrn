import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { spacing, touchTarget, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import Text from './text';

export interface InputOTPProps extends Omit<TextInputProps, 'value' | 'defaultValue' | 'style' | 'maxLength'> {
  /** Number of cells. @default 4 */
  length?: number;
  /** Controlled code. Omit for an uncontrolled input. */
  value?: string;
  /** Initial code when uncontrolled. @default '' */
  defaultValue?: string;
  /** Fires with the new code, alongside `onChangeText`. */
  onValueChange?: (value: string) => void;
  /** Fires once each time the last cell is filled. */
  onComplete?: (value: string) => void;
  /** Marks the code as invalid: destructive border on every cell and `aria-invalid`. */
  invalid?: boolean;
  /** Dashed cells, not editable, no focus ring. */
  disabled?: boolean;
  /** Fixed cell size in px. Without it cells shrink to fit the row, never past 56. */
  blockSize?: number;
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
}

const MAX_BLOCK_SIZE = 56;
// Below this a digit stops being comfortably legible.
const MIN_BLOCK_SIZE = 28;

export const InputOTP = forwardRef<TextInput, InputOTPProps>(function InputOTP(
  {
    length = 4,
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onChangeText,
    onComplete,
    invalid = false,
    disabled = false,
    editable = true,
    blockSize: blockSizeProp,
    style,
    onFocus,
    onBlur,
    accessibilityLabel,
    ...props
  },
  ref,
) {
  const { colors, elevation } = useTheme();
  const inputRef = useRef<TextInput>(null);
  useImperativeHandle(ref, () => inputRef.current as TextInput);

  const safeLength = Math.max(1, Math.floor(length));
  const clean = (text: string) => text.replace(/\D/g, '').slice(0, safeLength);

  const [internal, setInternal] = useState(() => clean(defaultValue));
  const value = valueProp === undefined ? internal : clean(valueProp);
  const [focused, setFocused] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);
  const isDisabled = disabled || !editable;
  const isFocused = focused && !isDisabled;

  const handleChangeText = (text: string) => {
    // A pasted or autofilled code arrives whole; strip separators like "123 456".
    const next = clean(text);
    if (valueProp === undefined) setInternal(next);
    onChangeText?.(next);
    onValueChange?.(next);
    if (next.length === safeLength && value.length !== safeLength) onComplete?.(next);
  };

  const handleRowLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== rowWidth) setRowWidth(w);
  };

  const gap = spacing.sm;
  const reserved = elevation.control;
  const fitted = rowWidth > 0 ? Math.floor((rowWidth - gap * (safeLength - 1)) / safeLength) - reserved : MAX_BLOCK_SIZE;
  const size = Math.max(MIN_BLOCK_SIZE, Math.min(blockSizeProp ?? MAX_BLOCK_SIZE, fitted));
  const activeIndex = Math.min(value.length, safeLength - 1);

  return (
    <View style={[styles.root, style]}>

      {/* The input below carries the semantics, so screen readers don't hear each cell as its own key. */}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        disabled={isDisabled}
        onLayout={handleRowLayout}
        style={[styles.row, { gap, minHeight: touchTarget }]}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {Array.from({ length: safeLength }, (_, i) => (
          <BrutalSurface
            key={i}
            testID="input-otp-cell"
            pressable={false}
            elevation="control"
            borderWidth="control"
            disabled={isDisabled}
            invalid={invalid}
            focused={isFocused && i === activeIndex}
            borderColor={colors.input}
            surfaceStyle={[styles.cell, { width: size, height: size }]}
          >
            <Text
              variant="mono"
              tone={isDisabled ? 'muted' : 'default'}
              style={{ fontSize: Math.min(typography.xl, Math.round(size * 0.5)), fontWeight: '800' }}
            >
              {value[i] ?? ''}
            </Text>
          </BrutalSurface>
        ))}
      </Pressable>

      {/* Stretched transparent over the cells so taps, screen-reader focus and test drivers land on a
          real-sized target; a 1px input is unreachable for all three. */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        maxLength={safeLength}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        caretHidden
        style={styles.hiddenInput}
        editable={!isDisabled}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        aria-invalid={invalid || undefined}
        accessibilityState={{ disabled: isDisabled }}
        accessibilityLabel={accessibilityLabel ?? `One-time code, ${value.length} of ${safeLength} digits entered`}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  hiddenInput: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cell: { alignItems: 'center', justifyContent: 'center' },
});

export default InputOTP;
