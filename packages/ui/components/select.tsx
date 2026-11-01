import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ViewProps } from 'react-native';

import { borderWidths, spacing, touchTarget } from '../lib/colors';
import { CheckIcon, ChevronDownIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import Input, { type InputProps } from './input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';
import Text from './text';

interface Option {
  label: string;
  disabled: boolean;
}

interface SelectContextState {
  value?: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  options: Record<string, Option>;
  registerOption: (value: string, option: Option) => () => void;
  query: string;
  setQuery: (query: string) => void;
}

const SelectContext = createContext<SelectContextState | undefined>(undefined);

// Items render twice: once hidden so the trigger can show a label before the sheet has ever
// opened and the option count is known, and once as rows inside the sheet.
const RegistryContext = createContext(false);

function useSelectContext(part: string) {
  const context = useContext(SelectContext);
  if (!context) throw new Error(`${part} must be used within Select`);
  return context;
}

export interface SelectProps {
  /** Controlled value. Omit for an uncontrolled select. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Controlled open state of the option sheet. Omit to let Select manage it. */
  open?: boolean;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A `SelectTrigger` and a `SelectContent`. */
  children: ReactNode;
}

export interface SelectTriggerProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'editable' | 'leading' | 'trailing' | 'onValueChange' | 'onChangeText'> {
  /** Shown while nothing is selected. */
  placeholder?: string;
}

export interface SelectContentProps extends ViewProps {
  /** Sheet height, capped at 90% of the window. @default 420 */
  sheetHeight?: number;
  /** Heading of the sheet, read when it opens. @default 'Choose an option' */
  title?: string;
  /** Show a filter field. Defaults to on when there are 10 or more options. */
  searchable?: boolean;
  /** @default 'Search' */
  searchPlaceholder?: string;
  /** @default 'No results' */
  emptyLabel?: string;
  /** Home-indicator inset. Pass `useSafeAreaInsets().bottom`. @default 0 */
  bottomInset?: number;
  children?: ReactNode;
}

export interface SelectItemProps {
  label: string;
  value: string;
  disabled?: boolean;
}

const SEARCH_THRESHOLD = 10;
const ROW_HEIGHT = 48;
const CHECK_SIZE = 20;
const CHEVRON_SIZE = 20;

export function Select({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [options, setOptions] = useState<Record<string, Option>>({});
  const [query, setQuery] = useState('');

  const value = valueProp !== undefined ? valueProp : internalValue;
  const open = openProp !== undefined ? openProp : internalOpen;

  const handleValueChange = useCallback(
    (next: string) => {
      if (valueProp === undefined) setInternalValue(next);
      onValueChange?.(next);
    },
    [valueProp, onValueChange],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      if (!next) setQuery('');
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const registerOption = useCallback((itemValue: string, option: Option) => {
    setOptions((prev) => {
      const current = prev[itemValue];
      if (current && current.label === option.label && current.disabled === option.disabled) return prev;
      return { ...prev, [itemValue]: option };
    });
    return () =>
      setOptions((prev) => {
        if (!(itemValue in prev)) return prev;
        const { [itemValue]: _removed, ...rest } = prev;
        return rest;
      });
  }, []);

  const context = useMemo<SelectContextState>(
    () => ({ value, onValueChange: handleValueChange, open, setOpen, options, registerOption, query, setQuery }),
    [value, handleValueChange, open, setOpen, options, registerOption, query],
  );

  return <SelectContext.Provider value={context}>{children}</SelectContext.Provider>;
}

export function SelectTrigger({
  placeholder,
  label,
  description,
  errorMessage,
  invalid = false,
  disabled = false,
  required = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  ...props
}: SelectTriggerProps) {
  const { value, options, open, setOpen } = useSelectContext('SelectTrigger');
  const { colors } = useTheme();
  const display = value ? (options[value]?.label ?? value) : '';
  const showError = invalid && !!errorMessage;
  const hint = [accessibilityHint, description, showError ? errorMessage : undefined].filter(Boolean).join('. ') || undefined;
  const name = accessibilityLabel ?? label ?? placeholder ?? 'Select an option';

  return (
    <Pressable
      onPress={() => setOpen(true)}
      disabled={disabled}
      testID={testID}
      style={[styles.trigger, style]}
      accessibilityRole="combobox"
      accessibilityLabel={required ? `${name}, required` : name}
      accessibilityHint={hint}
      accessibilityValue={display ? { text: display } : undefined}
      accessibilityState={{ expanded: open, disabled }}
      aria-invalid={invalid || undefined}
    >
      {/* Taps go to the Pressable; the read-only Input is only the visual. */}
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Input
          editable={false}
          value={display}
          placeholder={placeholder}
          label={label}
          description={description}
          errorMessage={errorMessage}
          invalid={invalid}
          disabled={disabled}
          required={required}
          trailing={<ChevronDownIcon size={CHEVRON_SIZE} color={disabled ? colors.mutedForeground : colors.foreground} />}
          {...props}
        />
      </View>
    </Pressable>
  );
}

export function SelectContent({
  sheetHeight = 420,
  title = 'Choose an option',
  searchable,
  searchPlaceholder = 'Search',
  emptyLabel = 'No results',
  bottomInset,
  children,
  ...props
}: SelectContentProps) {
  const { open, setOpen, options, query, setQuery } = useSelectContext('SelectContent');
  const count = Object.keys(options).length;
  const showSearch = searchable ?? count >= SEARCH_THRESHOLD;
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? Object.values(options).filter((option) => option.label.toLowerCase().includes(needle)).length
    : count;

  return (
    <>
      <RegistryContext.Provider value>
        <View style={styles.registry} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {children}
        </View>
      </RegistryContext.Provider>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent sheetHeight={sheetHeight} bottomInset={bottomInset} {...props}>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          {showSearch ? (
            <Input
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
              accessibilityLabel={searchPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.search}
            />
          ) : null}
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" accessibilityRole="radiogroup">
            {children}
            {needle && matches === 0 ? (
              <View style={styles.empty}>
                <Text tone="muted">{emptyLabel}</Text>
              </View>
            ) : null}
          </ScrollView>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function SelectItem({ label, value, disabled = false }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen, registerOption, query } = useSelectContext('SelectItem');
  const registry = useContext(RegistryContext);
  const { colors } = useTheme();
  const selected = selectedValue === value;

  useEffect(() => {
    if (!registry) return undefined;
    return registerOption(value, { label, disabled });
  }, [registry, registerOption, value, label, disabled]);

  if (registry) return null;
  const needle = query.trim().toLowerCase();
  if (needle && !label.toLowerCase().includes(needle)) return null;

  const foreground = selected ? colors.background : disabled ? colors.mutedForeground : colors.foreground;

  return (
    <Pressable
      onPress={() => {
        onValueChange(value);
        setOpen(false);
      }}
      disabled={disabled}
      hitSlop={Math.max(0, Math.ceil((touchTarget - ROW_HEIGHT) / 2))}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, selected, disabled }}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: colors.border,
          backgroundColor: selected ? colors.foreground : pressed ? colors.muted : colors.background,
        },
      ]}
    >
      <Text tone="inherit" numberOfLines={1} style={[styles.rowLabel, { color: foreground }]}>
        {label}
      </Text>
      {selected ? <CheckIcon size={CHECK_SIZE} color={colors.background} strokeWidth={3} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // stretch rather than width: 100% so the Input's shadow margin cannot overflow.
  trigger: { alignSelf: 'stretch' },
  registry: { display: 'none' },
  search: { marginBottom: spacing.md },
  list: { flex: 1 },
  row: {
    minHeight: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: borderWidths.control,
  },
  rowLabel: { flex: 1 },
  empty: { minHeight: ROW_HEIGHT, justifyContent: 'center', paddingHorizontal: spacing.md },
});

export default Select;
