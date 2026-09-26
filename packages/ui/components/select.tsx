import React, { createContext, useContext, useState } from 'react';
import { Pressable, StyleSheet, View, ViewProps } from 'react-native';
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
  children: React.ReactNode;
}

export interface SelectTriggerProps extends ViewProps {
  /**
   * Placeholder text to display when no value is selected.
   */
  placeholder?: string;
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

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);

  const triggerChildren: React.ReactNode[] = [];
  const contentChildren: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && (child.type === SelectContent || (child.type as any)?.name === 'SelectContent')) {
      contentChildren.push(child);
    } else {
      triggerChildren.push(child);
    }
  });

  return (
    <SelectContext.Provider value={{ value, onValueChange, setOpen }}>
      {triggerChildren}
      <Sheet open={open} onOpenChange={setOpen}>
        {() => contentChildren}
      </Sheet>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ placeholder, style, ...props }: SelectTriggerProps) {
  const { value, setOpen } = useSelectContext();
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
        strokeWidth="4" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
      >
        <Path d="M6 9l6 6 6-6" />
      </Svg>
    </View>
  );

  const { onBlur, onFocus, ...inputProps } = props as any;

  return (
    <Pressable 
      onPress={handlePress} 
      style={cn(styles.triggerWrapper, style)}
      accessibilityRole="combobox"
      accessibilityState={{ expanded: false }}
    >
      <Input
        editable={false} 
        value={value || ''}
        placeholder={placeholder}
        pointerEvents="none"
        trailingIcon={trailingChevron}
        style={styles.inputReset}
        {...inputProps}
      />
    </Pressable>
  );
}

export function SelectContent({ sheetHeight = 350, children, style, ...props }: SelectContentProps) {
  return (
    <SheetContent PointHeight={sheetHeight} style={style} {...props}>
      <View style={styles.listContainer}>
        {children}
      </View>
    </SheetContent>
  );
}

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
      accessibilityState={{ checked: isSelected }}
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
    flex: 1,
    flexDirection: 'column',
  },
  item: {
    borderBottomWidth: borderWidths.standard,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
});