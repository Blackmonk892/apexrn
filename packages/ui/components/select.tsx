import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInputProps,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { borderWidths, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

import Input from './input';
import { Sheet, SheetContent } from './sheet';
import ListItem from './listitem';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface SelectContextState {
  value?: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
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
   * The controlled current value of the select.
   */
  value?: string;
  /**
   * Callback fired when an option is selected.
   */
  onValueChange: (value: string) => void;
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
  children?: React.ReactNode;
}

export interface SelectItemProps {
  label: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/**
 * Splits `children` into trigger vs. content slots. Matches by component
 * identity, `displayName`, and function name (survives minification-safe
 * renames less well, hence all three), and recurses into fragments.
 */
function splitSelectChildren(children: ReactNode) {
  const triggerChildren: ReactNode[] = [];
  const contentChildren: ReactNode[] = [];

  const visit = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) {
        return;
      }
      if (child.type === Fragment) {
        visit((child as ReactElement<{ children?: ReactNode }>).props.children);
        return;
      }
      const type = child.type as { displayName?: string; name?: string };
      if (
        child.type === SelectContent ||
        type?.displayName === 'SelectContent' ||
        type?.name === 'SelectContent'
      ) {
        contentChildren.push(child);
      } else {
        triggerChildren.push(child);
      }
    });
  };

  visit(children);
  return { triggerChildren, contentChildren };
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);

  const { triggerChildren, contentChildren } = splitSelectChildren(children);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {triggerChildren}
      <Sheet open={open} onOpenChange={setOpen}>
        {() => contentChildren}
      </Sheet>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ placeholder, style, onFocus, onBlur, ...props }: SelectTriggerProps) {
  const { value, open, setOpen } = useSelectContext();
  const { colors } = useTheme();

  const handlePress = () => {
    setOpen(true);
  };

  const trailingChevron = (
    <View style={styles.chevronContainer}>
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
    </View>
  );

  return (
    <Pressable
      onPress={handlePress}
      onFocus={onFocus}
      onBlur={onBlur}
      style={[styles.triggerWrapper, style]}
      accessibilityRole="combobox"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={value ? `Selected: ${value}` : (placeholder ?? 'Select an option')}
    >
      <Input
        editable={false}
        value={value || ''}
        placeholder={placeholder}
        pointerEvents="none"
        trailingIcon={trailingChevron}
        style={styles.inputReset}
        {...props}
      />
    </Pressable>
  );
}

export function SelectContent({ sheetHeight = 350, children, style, ...props }: SelectContentProps) {
  return (
    <SheetContent sheetHeight={sheetHeight} style={style} {...props}>
      <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContainer}>
        {children}
      </ScrollView>
    </SheetContent>
  );
}
SelectContent.displayName = 'SelectContent';

export function SelectItem({ label, value }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const { colors } = useTheme();
  const isSelected = selectedValue === value;

  const handleSelect = () => {
    onValueChange(value);
    setOpen(false);
  };

  return (
    <ListItem
      title={label}
      onPress={handleSelect}
      style={cn(
        styles.item,
        { borderColor: colors.border },
        isSelected && { backgroundColor: colors.muted }
      )}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: isSelected }}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  triggerWrapper: {
    width: '100%',
  },
  inputReset: {
    marginBottom: 0,
    marginRight: 0,
  },
  chevronContainer: {
    paddingRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
    flexDirection: 'column',
  },
  listScroll: {
    flex: 1,
    width: '100%',
  },
  item: {
    borderBottomWidth: borderWidths.standard,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
});