import { forwardRef } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, TextStyle, ViewStyle } from 'react-native';

// ⚠️ COMPOSITION: Reusing the existing Input component
import Input from './input';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface TextareaProps extends TextInputProps {
  /**
   * Disables the textarea, applying muted styles and preventing interactions.
   * @default false
   */
  disabled?: boolean;
  /**
   * Style overrides for the underlying multiline TextInput.
   */
  inputStyle?: StyleProp<TextStyle>;
  /**
   * Style overrides for the brutalist surface.
   */
  surfaceStyle?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Textarea = forwardRef<TextInput, TextareaProps>(({
  disabled = false,
  style,
  inputStyle,
  surfaceStyle,
  ...props
}, ref) => {
  return (
    <Input
      ref={ref}
      disabled={disabled}
      style={style}
      surfaceStyle={[styles.surface, surfaceStyle]}
      inputStyle={[styles.input, inputStyle]}
      {...props}
      // Invariants: a textarea is always multiline with top-aligned text.
      // Spread after `props` so callers cannot accidentally break this.
      multiline={true}
      textAlignVertical="top"
    />
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  surface: {
    // Multiline text must start at the top, not center (Input's row default).
    alignItems: 'flex-start',
  },
  input: {
    minHeight: 100,
  },
});
