import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal-surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface InputOTPProps extends Omit<TextInputProps, 'onChangeText' | 'value' | 'defaultValue'> {
  /**
   * The length of the OTP code (typically 4 or 6).
   * @default 4
   */
  length?: number;
  /**
   * Callback fired when the OTP code changes.
   */
  onChangeText?: (text: string) => void;
  /**
   * The controlled OTP value. Omit for an uncontrolled input.
   */
  value?: string;
  /**
   * Initial value when uncontrolled.
   * @default ''
   */
  defaultValue?: string;
  /**
   * Marks the code as invalid: destructive border and shadow on every block.
   * @default false
   */
  error?: boolean;
  /**
   * Disables the OTP inputs.
   * @default false
   */
  disabled?: boolean;
  /**
   * Fixed block size in px. When omitted, blocks shrink to fit the
   * available row width (never larger than 56).
   */
  blockSize?: number;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;
const BLOCK_SIZE = 56;
// Below this a digit stops being comfortably legible.
const MIN_BLOCK_SIZE = 28;

// ---------------------------------------------------------------------------
// OTPBlock — sub-component per digit
// ---------------------------------------------------------------------------
interface OTPBlockProps {
  char?: string;
  isActive: boolean;
  error: boolean;
  disabled: boolean;
  size: number;
}

function OTPBlock({ char, isActive, error, disabled, size }: OTPBlockProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const focusProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    const to = isActive ? 1 : 0;
    focusProgress.value = reduceMotion
      ? to
      : withTiming(to, {
          duration: isActive ? 100 : 80,
          easing: isActive ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
        });
  }, [isActive, reduceMotion, focusProgress]);

  // The shadow layer is always laid out (so blocks never shift between
  // states); the active block fades it in, errors and disabled override it.
  const showError = error && !disabled;
  const animatedShadowStyle = useAnimatedStyle(() => ({
    opacity: disabled ? 0 : showError ? 1 : focusProgress.value,
  }));

  return (
    <BrutalSurface
      surfaceStyle={[styles.surface, { width: size, height: size }]}
      shadowStyle={animatedShadowStyle}
      offset={SHADOW_OFFSET}
      borderWidth="heavy"
      backgroundColor={disabled ? colors.muted : colors.background}
      borderColor={disabled ? colors.mutedForeground : showError ? colors.destructive : colors.border}
      shadowColor={showError ? colors.destructive : undefined}
      pressable={false}
      hasShadow
    >
      <Text
        style={cn(
          styles.blockText,
          { fontSize: Math.min(typography.xl, Math.round(size * 0.5)), color: colors.foreground },
          disabled && { color: colors.mutedForeground },
        )}
        maxFontSizeMultiplier={1.3}
      >
        {char || ''}
      </Text>

      {isActive && char === undefined && (
        <View style={[styles.cursor, { backgroundColor: colors.foreground }]} />
      )}
    </BrutalSurface>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const InputOTP = forwardRef<TextInput, InputOTPProps>(({
  length = 4,
  onChangeText,
  value: valueProp,
  defaultValue = '',
  error = false,
  disabled = false,
  blockSize: blockSizeProp,
  style,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const inputRef = useRef<TextInput>(null);
  useImperativeHandle(ref, () => inputRef.current as TextInput);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = valueProp ?? internalValue;
  const [isFocused, setIsFocused] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);

  // Disabling mid-focus must not leave the active-block styling stuck on.
  useEffect(() => {
    if (disabled) setIsFocused(false);
  }, [disabled]);

  const handleChangeText = (text: string) => {
    if (valueProp === undefined) setInternalValue(text);
    onChangeText?.(text);
  };

  const handleRowLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== rowWidth) setRowWidth(w);
  };

  const safeLength = Math.max(1, Math.floor(length));
  // Fit blocks into the measured row: total shadow margins included.
  const gap = spacing.sm;
  const fittedSize =
    rowWidth > 0
      ? Math.floor((rowWidth - gap * (safeLength - 1)) / safeLength) - SHADOW_OFFSET
      : BLOCK_SIZE;
  const blockSize = Math.max(
    MIN_BLOCK_SIZE,
    Math.min(blockSizeProp ?? BLOCK_SIZE, Number.isFinite(fittedSize) ? fittedSize : BLOCK_SIZE),
  );

  const activeIndex = Math.min(value.length, safeLength - 1);
  const filledCount = Math.min(value.length, safeLength);

  return (
    <View style={cn(styles.root, style)}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        maxLength={safeLength}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        style={styles.hiddenInput}
        onFocus={(e) => {
          if (!disabled) setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        editable={!disabled}
        aria-invalid={error || undefined}
        accessibilityLabel={`One-time password input, ${filledCount} of ${safeLength} digits entered`}
        accessibilityState={{ disabled }}
        {...props}
      />

      {/* Decorative blocks: the hidden input above carries semantics so
          screen readers don't hear each block as a separate key. */}
      <Pressable
        onPress={() => {
          if (!disabled) inputRef.current?.focus();
        }}
        onLayout={handleRowLayout}
        style={[styles.blocksRow, { gap }]}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length: safeLength }, (_, i) => (
          <OTPBlock
            key={i}
            char={value[i]}
            isActive={isFocused && i === activeIndex}
            error={error}
            disabled={disabled}
            size={blockSize}
          />
        ))}
      </Pressable>
    </View>
  );
});

InputOTP.displayName = 'InputOTP';
export { InputOTP };
export default InputOTP;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  blocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockText: {
    fontWeight: '800',
  },
  cursor: {
    width: 8,
    height: 24,
    borderRadius: 0,
  },
});
