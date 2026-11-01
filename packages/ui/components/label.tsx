import { spacing } from '../lib/colors';
import { Text, type TextProps } from './text';

export interface LabelProps extends Omit<TextProps, 'variant' | 'tone'> {
  /** Mutes the label while the control it names is unavailable. */
  disabled?: boolean;
  /** Shows a `*` and announces "required" to screen readers. */
  required?: boolean;
}

export function Label({
  disabled = false,
  required = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  children,
  ...props
}: LabelProps) {
  // The visible `*` reads as "star" aloud, so the spoken label is built from the text instead.
  const spoken = accessibilityLabel ?? (typeof children === 'string' ? children : undefined);
  const announced = !required || (spoken !== undefined && /required/i.test(spoken));
  // Non-string children give no text to extend, so the hint carries "required" instead.
  const hint = required && spoken === undefined ? 'Required' : accessibilityHint;
  return (
    <Text
      variant="label"
      tone={disabled ? 'muted' : 'default'}
      accessibilityLabel={announced || spoken === undefined ? accessibilityLabel : `${spoken}, required`}
      accessibilityHint={hint}
      style={[{ marginBottom: spacing.xs }, style]}
      {...props}
    >
      {children}
      {required ? ' *' : null}
    </Text>
  );
}

export default Label;
