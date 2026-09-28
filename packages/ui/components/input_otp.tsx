import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { borderWidths, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import BrutalSurface from './brutal_surface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface InputOTPProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  /**
   * The length of the OTP code (typically 4 or 6).
   * @default 4
   */
  length?: number;
  /**
   * Callback fired when the OTP code changes.
   */
  onChangeText: (text: string) => void;
  /**
   * The current controlled OTP value.
   */
  value: string;
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

// ---------------------------------------------------------------------------
// OTPBlock — sub-component per digit
// ---------------------------------------------------------------------------
interface OTPBlockProps {
  char?: string;
  isActive: boolean;
  disabled: boolean;
  size: number;
}

function OTPBlock({ char, isActive, disabled, size }: OTPBlockProps) {
  const { colors } = useTheme();
  const focusProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    focusProgress.value = withTiming(isActive ? 1 : 0, {
      duration: isActive ? 100 : 80,
      easing: isActive ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
    });
  }, [isActive, focusProgress]);

  const animatedShadowStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
  }));

  const animatedSurfaceStyle = useAnimatedStyle(() => ({
    // Threshold, not equality: the shared value passes through 0.5
    // mid-animation and only rests exactly on 0 or 1.
    borderWidth: focusProgress.value > 0.5 ? borderWidths.heavy : borderWidths.standard,
  }));

  return (
    <BrutalSurface
      style={[styles.blockContainer, { width: size, height: size }]}
      surfaceStyle={[
        styles.surface,
        { width: size, height: size },
        disabled ? { backgroundColor: colors.muted, borderColor: colors.mutedForeground } : { backgroundColor: colors.background, borderColor: colors.border },
        animatedSurfaceStyle
      ]}
      shadowStyle={animatedShadowStyle}
      offset={SHADOW_OFFSET}
      pressable={false}
      hasShadow={!disabled}
    >
      <Text style={cn(styles.blockText, { color: colors.foreground }, disabled && { color: colors.mutedForeground })}>
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
  value,
  disabled = false,
  blockSize: blockSizeProp,
  style,
  ...props
}, ref) => {
  const inputRef = useRef<TextInput>(null);
  useImperativeHandle(ref, () => inputRef.current as TextInput);

  const [isFocused, setIsFocused] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);

  // Disabling mid-focus must not leave the active-block styling stuck on.
  useEffect(() => {
    if (disabled) {
      setIsFocused(false);
    }
  }, [disabled]);

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (disabled) return;
    setIsFocused(false);
  };

  const handlePressContainer = () => {
    if (disabled) return;
    inputRef.current?.focus();
  };

  const handleRowLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== rowWidth) {
      setRowWidth(w);
    }
  };

  const safeLength = Math.max(1, Math.floor(length));
  // Fit blocks into the measured row: total shadow margins included.
  const fittedSize =
    rowWidth > 0
      ? Math.floor((rowWidth - spacing.sm * (safeLength - 1)) / safeLength) - SHADOW_OFFSET
      : BLOCK_SIZE;
  const blockSize = Math.max(
    32,
    Math.min(blockSizeProp ?? BLOCK_SIZE, Number.isFinite(fittedSize) ? fittedSize : BLOCK_SIZE),
  );

  const activeIndex = Math.min(value.length, safeLength - 1);
  const filledCount = Math.min(value.length, safeLength);

  return (
    <View style={cn(styles.root, style)}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        maxLength={safeLength}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        style={styles.hiddenInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={!disabled}
        accessibilityLabel={`One-time password input, ${filledCount} of ${safeLength} digits entered`}
        accessibilityState={{ disabled }}
        {...props}
      />

      {/* Decorative blocks: the hidden input above carries semantics so
          screen readers don't hear each block as a separate key. */}
      <Pressable
        onPress={handlePressContainer}
        onLayout={handleRowLayout}
        style={styles.blocksRow}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length: safeLength }, (_, i) => (
          <OTPBlock
            key={i}
            char={value[i]}
            isActive={isFocused && i === activeIndex}
            disabled={disabled}
            size={blockSize}
          />
        ))}
      </Pressable>
    </View>
  );
});

InputOTP.displayName = 'InputOTP';
export default InputOTP;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    width: '100%',
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
    gap: spacing.sm,
  },
  blockContainer: {},
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockText: {
    fontSize: typography.xl,
    fontWeight: '800',
  },
  cursor: {
    width: 8,
    height: 24,
    borderRadius: 0,
  },
});
