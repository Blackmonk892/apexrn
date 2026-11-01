import { useEffect, useId, useRef, useState } from 'react';
import {
  type AccessibilityActionEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { borderWidths, controlHeight, opacity, spacing, textStyles, touchTarget } from '../lib/colors';
import { CloseIcon, PlusIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import Label from './label';
import Text from './text';

type Size = 'sm' | 'md' | 'lg';

export interface NumberInputProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Controlled value. Omit for an uncontrolled field. */
  value?: number;
  /** Initial value when uncontrolled. @default min, else 0 */
  defaultValue?: number;
  /** Fires with the clamped, step-rounded value from buttons, typing and accessibility actions. */
  onValueChange?: (value: number) => void;
  /** @default -Infinity */
  min?: number;
  /** @default Infinity */
  max?: number;
  /** @default 1 */
  step?: number;
  /** Visible label, also spoken with the field. */
  label?: string;
  required?: boolean;
  description?: string;
  invalid?: boolean;
  /** Shown under the field with an icon while `invalid`. */
  errorMessage?: string;
  /** Dashed border, buttons and typing off. */
  disabled?: boolean;
  /** @default 'md' */
  size?: Size;
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
  /** Style for the typed value. */
  inputStyle?: StyleProp<TextStyle>;
  /** Style for the bordered surface. */
  surfaceStyle?: StyleProp<ViewStyle>;
}

const FIRST_REPEAT_MS = 400;
const START_INTERVAL_MS = 150;
const MIN_INTERVAL_MS = 40;
const INTERVAL_DECAY = 0.85;
const ERROR_ICON_SIZE = 16;

function decimalsOf(n: number) {
  if (!Number.isFinite(n)) return 0;
  const [mantissa, exponent] = String(n).split('e');
  const fraction = (mantissa.split('.')[1] ?? '').length;
  return Math.max(0, fraction - (exponent ? Number(exponent) : 0));
}

export function NumberInput({
  value: valueProp,
  defaultValue,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  label,
  required = false,
  description,
  invalid = false,
  errorMessage,
  disabled = false,
  size = 'md',
  accessibilityLabel,
  accessibilityHint,
  style,
  inputStyle,
  surfaceStyle,
  testID,
  ...props
}: NumberInputProps) {
  const { colors } = useTheme();
  const labelId = useId();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const [inner, setInner] = useState(() => clamp(defaultValue ?? (Number.isFinite(min) ? min : 0)));
  const value = valueProp ?? inner;
  // Fixed decimals keep 0.1 + 0.2 from surfacing as 0.30000000000000004.
  const decimals = Math.max(decimalsOf(step), decimalsOf(min), decimalsOf(value));
  const round = (n: number) => Number(n.toFixed(decimals));
  const [draft, setDraft] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  // Timers read the latest value and callback through refs so a held button never acts on a stale render.
  const valueRef = useRef(value);
  valueRef.current = value;
  const stepRef = useRef<(dir: 1 | -1) => boolean>(() => false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touched = useRef(false);

  const commit = (next: number) => {
    const n = round(clamp(next));
    if (n === valueRef.current) return false;
    valueRef.current = n;
    if (valueProp === undefined) setInner(n);
    onValueChange?.(n);
    return true;
  };
  stepRef.current = (dir) => commit(valueRef.current + dir * step);

  const stopRepeat = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stopRepeat, []);
  useEffect(() => {
    if (disabled) stopRepeat();
  }, [disabled]);

  const startRepeat = (dir: 1 | -1) => {
    stopRepeat();
    let interval = START_INTERVAL_MS;
    const tick = () => {
      if (!stepRef.current(dir)) {
        stopRepeat();
        return;
      }
      timer.current = setTimeout(tick, Math.round(interval));
      interval = Math.max(MIN_INTERVAL_MS, interval * INTERVAL_DECAY);
    };
    timer.current = setTimeout(tick, FIRST_REPEAT_MS);
  };

  const commitDraft = () => {
    if (draft !== null) {
      const parsed = Number(draft.trim().replace(',', '.'));
      if (draft.trim() !== '' && Number.isFinite(parsed)) {
        const base = Number.isFinite(min) ? min : 0;
        commit(base + Math.round((parsed - base) / step) * step);
      }
    }
    setDraft(null);
  };

  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;
  const text = value.toFixed(decimals);
  const showError = invalid && !!errorMessage;
  const height = controlHeight[size];
  const slop = Math.max(0, Math.ceil((touchTarget - height) / 2));
  const spoken = accessibilityLabel ?? (label ? (required ? `${label}, required` : label) : undefined);
  const hint = [accessibilityHint, description, showError ? errorMessage : undefined].filter(Boolean).join('. ') || undefined;

  const onAction = (e: AccessibilityActionEvent) => {
    if (disabled) return;
    if (e.nativeEvent.actionName === 'increment') stepRef.current(1);
    if (e.nativeEvent.actionName === 'decrement') stepRef.current(-1);
  };

  const stepButton = (dir: 1 | -1, enabled: boolean) => (
    <Pressable
      testID={testID ? `${testID}-${dir === 1 ? 'increase' : 'decrease'}` : undefined}
      accessibilityRole="button"
      accessibilityLabel={dir === 1 ? 'Increase' : 'Decrease'}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      hitSlop={slop}
      onPressIn={() => {
        touched.current = true;
        stepRef.current(dir);
        startRepeat(dir);
      }}
      onPressOut={() => {
        stopRepeat();
        // onPress follows onPressOut for the same touch; it must not step a second time.
        touched.current = true;
      }}
      onPress={() => {
        // Screen-reader and keyboard activation arrive here without a press-in.
        if (touched.current) touched.current = false;
        else stepRef.current(dir);
      }}
      style={({ pressed }) => [
        styles.button,
        dir === 1 ? { borderLeftWidth: borderWidths.control } : { borderRightWidth: borderWidths.control },
        { borderColor: colors.input, backgroundColor: pressed && enabled ? colors.foreground : 'transparent' },
        !enabled && { opacity: opacity.disabled },
      ]}
    >
      {({ pressed }) => {
        const color = pressed && enabled ? colors.background : colors.foreground;
        return dir === 1 ? (
          <PlusIcon size={20} color={color} />
        ) : (
          // The icon set has no minus; a mono glyph keeps the lib untouched.
          <Text variant="mono" tone="inherit" style={[styles.minus, { color }]}>
            {'−'}
          </Text>
        );
      }}
    </Pressable>
  );

  return (
    <View style={[styles.root, style]}>
      {label ? (
        <Label nativeID={labelId} required={required} disabled={disabled} accessibilityElementsHidden>
          {label}
        </Label>
      ) : null}
      {description ? (
        <Text tone="muted" style={styles.description} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          {description}
        </Text>
      ) : null}

      <BrutalSurface
        pressable={false}
        elevation="flat"
        borderWidth="control"
        disabled={disabled}
        invalid={invalid}
        focused={focused}
        borderColor={colors.input}
        surfaceStyle={[styles.surface, { minHeight: height }, surfaceStyle]}
      >
        <View
          testID={testID}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={spoken}
          accessibilityLabelledBy={label ? labelId : undefined}
          accessibilityHint={hint}
          accessibilityValue={{
            min: Number.isFinite(min) ? min : undefined,
            max: Number.isFinite(max) ? max : undefined,
            now: value,
            text,
          }}
          accessibilityState={{ disabled }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={onAction}
          aria-invalid={invalid || undefined}
          style={styles.row}
          {...props}
        >
          {stepButton(-1, canDecrease)}
          <TextInput
            style={[textStyles.mono, styles.input, { color: colors.foreground }, inputStyle]}
            value={draft ?? text}
            keyboardType={decimals > 0 ? 'decimal-pad' : 'number-pad'}
            editable={!disabled}
            selectTextOnFocus
            onFocus={() => {
              setFocused(true);
              setDraft(text);
            }}
            onChangeText={setDraft}
            onBlur={() => {
              setFocused(false);
              commitDraft();
            }}
            onSubmitEditing={commitDraft}
            maxFontSizeMultiplier={1.3}
            accessibilityLabel={spoken}
            aria-invalid={invalid || undefined}
          />
          {stepButton(1, canIncrease)}
        </View>
      </BrutalSurface>

      {showError ? (
        <View style={styles.error} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <CloseIcon size={ERROR_ICON_SIZE} color={colors.destructive} />
          <Text variant="label" tone="inherit" style={[styles.errorText, { color: colors.destructive }]}>
            {errorMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch' },
  description: { marginBottom: spacing.xs },
  surface: { flexDirection: 'row', alignItems: 'stretch' },
  row: { flex: 1, flexDirection: 'row', alignItems: 'stretch' },
  button: { width: touchTarget, alignItems: 'center', justifyContent: 'center' },
  minus: { fontSize: 22, lineHeight: 26, fontWeight: '700' },
  input: { flex: 1, textAlign: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  error: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  errorText: { flexShrink: 1 },
});

export default NumberInput;
