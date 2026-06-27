import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { 
  Pressable, 
  StyleSheet, 
  Text, 
  TextInput, 
  TextInputProps, 
  View 
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

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
// Component
// ---------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  
  // Track focus progression individually for each block to snap shadow/heavy border
  const focusProgress = Array.from({ length }, () => useSharedValue(0));

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    
    // Snap the active/last unfilled block to focused state
    const activeIndex = Math.min(value.length, length - 1);
    focusProgress.forEach((progress, index) => {
      progress.value = withTiming(index === activeIndex ? 1 : 0, { 
        duration: 100, 
        easing: Easing.out(Easing.quad) 
      });
    });
  };

  const handleBlur = () => {
    if (disabled) return;
    setIsFocused(false);
    // Collapse all shadows when losing focus
    focusProgress.forEach((progress) => {
      progress.value = withTiming(0, { 
        duration: 80, 
        easing: Easing.in(Easing.quad) 
      });
    });
  };

  const handlePressContainer = () => {
    if (disabled) return;
    inputRef.current?.focus();
  };

  // Renders the individual block cells
  const renderBlocks = () => {
    const blocks = [];
    for (let i = 0; i < length; i++) {
      const char = value[i];
      const isActiveBlock = isFocused && i === Math.min(value.length, length - 1);
      
      // Animated wrapper for individual block shadows
      const animatedShadowStyle = useAnimatedStyle(() => {
        return {
          opacity: focusProgress[i]?.value || 0,
        };
      });

      // Border width snaps on active block
      const animatedSurfaceStyle = useAnimatedStyle(() => {
        return {
          borderWidth: focusProgress[i]?.value.value === 1 ? borderWidths.heavy : borderWidths.standard,
        };
      });

      blocks.push(
        <View key={i} style={styles.blockContainer}>
          {!disabled && (
            <Animated.View style={[styles.shadow, animatedShadowStyle]} />
          )}
          
          <Animated.View 
            style={cn(
              styles.surface,
              isActiveBlock && styles.surfaceFocused,
              disabled && styles.surfaceDisabled,
              animatedSurfaceStyle
            )}
          >
            <Text style={cn(styles.blockText, disabled && styles.textDisabled)}>
              {char || ''}
            </Text>
            
            {/* Custom Brutalism cursor indicator on the active block */}
            {isActiveBlock && char === undefined && (
              <View style={styles.cursor} />
            )}
          </Animated.View>
        </View>
      );
    }
    return blocks;
  };

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
        {renderBlocks()}
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
    position: 'relative',
    // Reserve space for 4px shadow offset
    marginBottom: SHADOW_OFFSET,
    marginRight: SHADOW_OFFSET,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: colors.light.shadow,
    borderColor: colors.light.border,
    borderWidth: borderWidths.heavy, // Shadow takes on heavy border footprint
    zIndex: 1,
    borderRadius: 0,
  },
  surface: {
    position: 'relative',
    zIndex: 2,
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
    borderWidth: borderWidths.standard, // Flat resting border
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surfaceFocused: {
    borderWidth: borderWidths.heavy, // Snaps to heavy border on focus
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