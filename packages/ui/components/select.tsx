import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  type TextInputProps,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';

import Input from './input';
import ListItem from './list-item';
import { Sheet, SheetContent } from './sheet';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface SelectContextState {
  value?: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Label of an item by value; lets the trigger show text, not the raw value. */
  labelFor: (value: string) => string | undefined;
  registerLabel: (value: string, label: string) => void;
}

const SelectContext = createContext<SelectContextState | undefined>(undefined);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select sub-components must be used within a <Select /> wrapper');
  }
  return context;
}

export interface SelectProps {
  /**
   * The controlled value. Omit for an uncontrolled select.
   */
  value?: string;
  /**
   * Initial value when uncontrolled.
   */
  defaultValue?: string;
  /**
   * Callback fired when an option is selected.
   */
  onValueChange?: (value: string) => void;
  /**
   * The controlled open state of the option sheet. Omit to let Select manage it.
   */
  open?: boolean;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * A `SelectTrigger` and a `SelectContent`.
   */
  children: ReactNode;
}

export interface SelectTriggerProps extends Omit<TextInputProps, 'value' | 'editable' | 'onPress' | 'style'> {
  /**
   * Placeholder text to display when no value is selected.
   */
  placeholder?: string;
  /**
   * Style for the pressable wrapper.
   */
  style?: StyleProp<ViewStyle>;
}

export interface SelectContentProps extends ViewProps {
  /**
   * The height the bottom sheet snaps to.
   * @default 350
   */
  sheetHeight?: number;
  children?: ReactNode;
}

export interface SelectItemProps {
  label: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

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
  const [labels, setLabels] = useState<Record<string, string>>({});

  const value = valueProp ?? internalValue;
  const open = openProp ?? internalOpen;

  const handleValueChange = useCallback((next: string) => {
    if (valueProp === undefined) setInternalValue(next);
    onValueChange?.(next);
  }, [valueProp, onValueChange]);

  const setOpen = useCallback((next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }, [openProp, onOpenChange]);

  const registerLabel = useCallback((itemValue: string, label: string) => {
    setLabels((prev) => (prev[itemValue] === label ? prev : { ...prev, [itemValue]: label }));
  }, []);

  const context = useMemo<SelectContextState>(
    () => ({
      value,
      onValueChange: handleValueChange,
      open,
      setOpen,
      labelFor: (v) => labels[v],
      registerLabel,
    }),
    [value, handleValueChange, open, setOpen, labels, registerLabel],
  );

  return <SelectContext.Provider value={context}>{children}</SelectContext.Provider>;
}

export function SelectTrigger({ placeholder, style, onFocus, onBlur, ...props }: SelectTriggerProps) {
  const { value, labelFor, open, setOpen } = useSelectContext();
  const { colors } = useTheme();
  const display = value ? labelFor(value) ?? value : '';

  const trailingChevron = (
    <Svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.foreground}
      strokeWidth="3"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );

  return (
    <Pressable
      onPress={() => setOpen(true)}
      onFocus={onFocus}
      onBlur={onBlur}
      style={[styles.triggerWrapper, style]}
      accessibilityRole="combobox"
      accessibilityLabel={placeholder ?? 'Select an option'}
      accessibilityValue={display ? { text: display } : undefined}
      accessibilityState={{ expanded: open }}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      {/* Taps go to the Pressable; the read-only Input is just the visual. */}
      <View style={styles.inputPassthrough}>
        <Input
          editable={false}
          value={display}
          placeholder={placeholder}
          trailingIcon={trailingChevron}
          {...props}
        />
      </View>
    </Pressable>
  );
}

export function SelectContent({ sheetHeight = 350, children, style, ...props }: SelectContentProps) {
  const { open, setOpen } = useSelectContext();

  return (
    <>
      {/* Hidden, mounted copy: items register their labels on mount, so the
          trigger can show "United States" for a value before the sheet has
          ever been opened. */}
      <View style={styles.registry} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {children}
      </View>
      <Sheet open={open} onOpenChange={setOpen}>
        {() => (
          <SheetContent sheetHeight={sheetHeight} style={style} {...props}>
            <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContainer}>
              {children}
            </ScrollView>
          </SheetContent>
        )}
      </Sheet>
    </>
  );
}

export function SelectItem({ label, value }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen, registerLabel } = useSelectContext();
  const { colors } = useTheme();
  const isSelected = selectedValue === value;

  useEffect(() => {
    registerLabel(value, label);
  }, [registerLabel, value, label]);

  return (
    <ListItem
      title={label}
      onPress={() => {
        onValueChange(value);
        setOpen(false);
      }}
      trailing={
        isSelected ? (
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.foreground} strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
            <Path d="M20 6L9 17l-5-5" />
          </Svg>
        ) : undefined
      }
      style={[
        { borderColor: colors.border, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
        isSelected && { backgroundColor: colors.muted },
      ]}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: isSelected }}
      aria-selected={isSelected}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // stretch (not width: 100%) so the Input's shadow margin doesn't overflow.
  triggerWrapper: {
    alignSelf: 'stretch',
  },
  inputPassthrough: {
    pointerEvents: 'none',
  },
  registry: {
    display: 'none',
  },
  listContainer: {
    flexGrow: 1,
    flexDirection: 'column',
  },
  listScroll: {
    flex: 1,
  },
});
