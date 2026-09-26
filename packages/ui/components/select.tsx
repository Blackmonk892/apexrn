import React, { createContext, useContext, useState, useCallback } from 'react';
import { Pressable, StyleSheet, View, ViewProps, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ⚠️ IMPORTANT: Composing existing ApexRN primitives
import Input from './Input';
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
// Design tokens
// ---------------------------------------------------------------------------
// Maintained for strict template compliance
const SHADOW_OFFSET = 4;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);

  // Split children so <SelectTrigger/> renders once, in the normal layout tree,
  // and <SelectContent/> renders once, only inside the Sheet's modal.
  // (Previously both rendered in both places, mounting everything twice.)
  const triggerChildren: React.ReactNode[] = [];
  const contentChildren: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === SelectContent) {
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

  const handlePress = () => {
    setOpen(true);
  };

  // Trailing Chevron Icon to mimic a standard dropdown trigger
  const trailingChevron = (
    <View style={styles.chevronContainer}>
      <Svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={colors.light.foreground} 
        strokeWidth="4" 
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
      style={cn(styles.triggerWrapper, style)}
      accessibilityRole="combobox"
      accessibilityState={{ expanded: false }}
    >
      <Input
        // Forcefully disabled internally so text input doesn't actually trigger the native OS keyboard
        // Interacting with it simply opens the Sheet overlay
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
    // Sheet strictly enforces mobile presentation overlays rather than web dropdowns
    <SheetContent PointHeight={sheetHeight} style={style} {...props}>
      <View style={styles.listContainer}>
        {children}
      </View>
    </SheetContent>
  );
}

export function SelectItem({ label, value }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;

  const handleSelect = () => {
    onValueChange(value);
    setOpen(false); // Dismiss sheet immediately upon selection
  };

  return (
    <ListItem
      title={label}
      onPress={handleSelect}
      style={cn(
        styles.item, 
        isSelected && styles.itemSelected
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
    // Overrides any input-specific margin so the parent container calculates boundaries correctly
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
    borderColor: colors.light.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  itemSelected: {
    backgroundColor: colors.light.muted, // Harsh highlighted feedback when matching value
  },
});