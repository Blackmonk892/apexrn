import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
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
   * Disables the OTP inputs, applying muted styles and preventing interactions.
   * @default false
   */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SHADOW_OFFSET = 4;
const BLOCK_SIZE = 56;

// ---------------------------------------------------------------------------
// OTPBlock — one component instance per digit, so each owns its own hooks.
// This is what resolves the Step 1 hooks-in-a-loop deferral: the previous
// implementation called useSharedValue/useAnimatedStyle inside Array.from(...)
// and inside a renderBlocks() loop, which broke Rules of Hooks the moment
// `length` changed between renders. A real component per block sidesteps
// that entirely — React tracks each block's hooks independently, and
// mounting/unmounting a block when `length` changes is safe by construction.
// ---------------------------------------------------------------------------
interface OTPBlockProps {
  char?: string;
  isActive: boolean;
  disabled: boolean;
}

function OTPBlock({ char, isActive, disabled }: OTPBlockProps) {
  const focusProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    focusProgress.value = withTiming(isActive ? 1 : 0, {
      duration: isActive ? 100 : 80,
      easing: isActive ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
    });
  }, [isActive, focusProgress]);

  // Shadow only reveals on the active block, not every resting block.
  const animatedShadowStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
  }));

  // Border width snaps on the active block.
  const animatedSurfaceStyle = useAnimatedStyle(() => ({
    borderWidth: focusProgress.value === 1 ? borderWidths.heavy : borderWidths.standard,
  }));

  return (
    <BrutalSurface
      style={styles.blockContainer}
      surfaceStyle={[styles.surface, disabled && styles.surfaceDisabled, animatedSurfaceStyle]}
      shadowStyle={animatedShadowStyle}
      offset={SHADOW_OFFSET}
      pressable={false}
      hasShadow={!disabled}
    >
      <Text style={cn(styles.blockText, disabled && styles.textDisabled)}>
        {char || ''}
      </Text>

      {/* Custom Brutalism cursor indicator on the active block */}
      {isActive && char === undefined && (
        <View style={styles.cursor} />
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
  style,
  ...props
}, ref) => {
  const inputRef = useRef<TextInput>(null);
  // Expose the underlying TextInput ref to parent forms
  useImperativeHandle(ref, () => inputRef.current as TextInput);

  const [isFocused, setIsFocused] = useState(false);

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

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={cn(styles.root, style)}>
      {/* Invisible engine for native input tracking */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        maxLength={length}
        keyboardType="number-pad"
        secureTextEntry
        style={styles.hiddenInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={!disabled}
        accessibilityRole="spinbutton"
        accessibilityLabel="One-time password input"
        {...props}
      />

      {/* Separated Visual Blocks */}
      <Pressable
        onPress={handlePressContainer}
        style={styles.blocksRow}
        accessibilityRole="keyboardkey"
      >
        {Array.from({ length }, (_, i) => (
          <OTPBlock
            key={i}
            char={value[i]}
            isActive={isFocused && i === activeIndex}
            disabled={disabled}
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
  blockContainer: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
  },
  surface: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surfaceDisabled: {
    backgroundColor: colors.light.muted,
    borderColor: colors.light.mutedForeground,
  },
  blockText: {
    fontSize: typography.xl,
    fontWeight: '800',
    color: colors.light.foreground,
  },
  textDisabled: {
    color: colors.light.mutedForeground,
  },
  cursor: {
    width: 8,
    height: 24,
    backgroundColor: colors.light.foreground,
    borderRadius: 0, // Harsh unrounded blinking block cursor
  },
});
