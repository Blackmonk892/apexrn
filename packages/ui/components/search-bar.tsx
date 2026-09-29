import { useRef, useState } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextInput,
  View,
  type ViewStyle,
} from 'react-native';

import { spacing, touchTarget, typography } from '../lib/colors';
import { CloseIcon, SearchIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import Input, { type InputProps } from './input';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SearchBarProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'onChangeText' | 'leadingIcon' | 'trailingIcon' | 'onTrailingIconPress' | 'style'> {
  /** Controlled query. Omit for an uncontrolled bar. */
  value?: string;
  /** Initial query when uncontrolled. @default '' */
  defaultValue?: string;
  /** Fires on every change, including the clear button. */
  onValueChange?: (value: string) => void;
  /** Fires when the keyboard's search key is pressed. */
  onSubmit?: (value: string) => void;
  /**
   * Shows a CANCEL action beside the field while it is focused. Pressing it
   * clears the query, dismisses the keyboard, then calls this.
   */
  onCancel?: () => void;
  /** Label of the cancel action. @default 'Cancel' */
  cancelLabel?: string;
  /** Accessibility label of the clear button. @default 'Clear search' */
  clearLabel?: string;
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function SearchBar({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onSubmit,
  onCancel,
  cancelLabel = 'Cancel',
  clearLabel = 'Clear search',
  placeholder = 'Search',
  disabled = false,
  onFocus,
  onBlur,
  style,
  ...props
}: SearchBarProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const value = valueProp ?? internalValue;
  const controlled = valueProp !== undefined;

  const change = (next: string) => {
    if (!controlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const handleClear = () => {
    change('');
    // Keep the keyboard up so the next query can be typed straight away.
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    change('');
    inputRef.current?.blur();
    onCancel?.();
  };

  // A disabled field can't be edited, so a clear button would be a dead control.
  const hasValue = value.length > 0 && !disabled;

  return (
    <View style={[styles.row, { gap: spacing.md }, style]}>
      <Input
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={change}
        placeholder={placeholder}
        disabled={disabled}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        // Pressing search dismisses the keyboard so results are visible.
        submitBehavior="blurAndSubmit"
        onSubmitEditing={() => onSubmit?.(value)}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        leadingIcon={<SearchIcon size={20} color={disabled ? colors.mutedForeground : colors.foreground} />}
        trailingIcon={hasValue ? <CloseIcon size={18} color={colors.foreground} /> : undefined}
        onTrailingIconPress={handleClear}
        trailingIconLabel={clearLabel}
        accessibilityRole="search"
        {...props}
      />
      {onCancel && focused ? (
        <Pressable
          onPress={handleCancel}
          hitSlop={8}
          style={[styles.cancel, { minHeight: touchTarget }]}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        >
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
            style={[styles.cancelText, { color: colors.foreground, fontSize: typography.sm }]}
          >
            {cancelLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  row: {
    // stretch (not width: 100%) so the Input's shadow margin doesn't push past the parent.
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
  },
  cancel: {
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    // The underline marks it as an action without a second bordered block
    // next to the field.
    textDecorationLine: 'underline',
  },
});

export default SearchBar;
