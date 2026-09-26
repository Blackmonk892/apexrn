import React, { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';

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
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Textarea = forwardRef<TextInput, TextareaProps>(({
  disabled = false,
  style,
  ...props
}, ref) => {
  return (
    <Input
      ref={ref}
      disabled={disabled}
      multiline={true}
      textAlignVertical="top"
      style={[{ minHeight: 100 }, style]}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
