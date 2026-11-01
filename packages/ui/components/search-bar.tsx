import { useRef, type ComponentRef, useState } from 'react';
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
import { ListItem } from './list-item';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SearchBarProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'leading' | 'trailing' | 'style'> {
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
  /**
   * Recent queries, listed under the field while it is empty. Not tied to focus: a tap on a row
   * can blur the field first, which would unmount the list before the press lands.
   */
  recent?: string[];
  /** Fires when a recent row is pressed. The field is filled with it first. */
  onRecentPress?: (query: string) => void;
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
  recent,
  onRecentPress,
  onChangeText,
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
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const value = valueProp ?? internalValue;
  const controlled = valueProp !== undefined;

  const change = (next: string) => {
    if (!controlled) setInternalValue(next);
    onChangeText?.(next);
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

  const showRecent = !disabled && value.length === 0 && !!recent?.length;

  return (
    <View style={[styles.root, style]} accessibilityRole="search">
      <View style={[styles.row, { gap: spacing.md }]}>
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
        leading={<SearchIcon size={20} color={disabled ? colors.mutedForeground : colors.foreground} />}
        trailing={
          hasValue ? (
            <Pressable
              onPress={handleClear}
              hitSlop={8}
              style={styles.clear}
              accessibilityRole="button" accessibilityLabel={clearLabel}
            >
              <CloseIcon size={18} color={colors.foreground} />
            </Pressable>
          ) : undefined
        }
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
      {showRecent ? (
        <View style={{ marginTop: spacing.sm }}>
          {recent!.map((query) => (
            <ListItem
              key={query}
              title={query}
              leading={<SearchIcon size={18} color={colors.mutedForeground} />}
              onPress={() => {
                change(query);
                onRecentPress?.(query);
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // stretch (not width: 100%) so the Input's shadow margin doesn't push past the parent.
  root: { alignSelf: 'stretch' },
  clear: { minWidth: touchTarget - 16, minHeight: touchTarget - 16, alignItems: 'center', justifyContent: 'center' },
  row: {
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
