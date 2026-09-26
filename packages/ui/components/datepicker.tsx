import React, { createContext, useContext, useState, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';

import { borderWidths, spacing, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

import Input from './input';
import { Sheet, SheetContent } from './sheet';
import Button from './button';

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------
interface DatePickerContextState {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DatePickerContext = createContext<DatePickerContextState | undefined>(undefined);

function useDatePickerContext() {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error('DatePicker sub-components must be used within a <DatePicker /> wrapper');
  }
  return context;
}

export interface DatePickerProps {
  /**
   * The controlled currently selected date.
   */
  value: Date | null;
  /**
   * Callback fired when a date is selected.
   */
  onChange: (date: Date) => void;
  children: React.ReactNode;
}

export interface DatePickerTriggerProps extends ViewProps {
  /**
   * Placeholder text displayed when no date is chosen.
   */
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Calendar Math Utilities
// ---------------------------------------------------------------------------
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function DatePicker({ value, onChange, children }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const onDateChange = useCallback((date: Date) => {
    onChange(date);
  }, [onChange]);

  const triggerChildren: React.ReactNode[] = [];
  const contentChildren: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && (child.type === DatePickerContent || (child.type as any)?.name === 'DatePickerContent')) {
      contentChildren.push(child);
    } else {
      triggerChildren.push(child);
    }
  });

  return (
    <DatePickerContext.Provider value={{ selectedDate: value, onDateChange, isOpen, setIsOpen }}>
      {triggerChildren}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {() => contentChildren}
      </Sheet>
    </DatePickerContext.Provider>
  );
}

export function DatePickerTrigger({ placeholder, style, ...props }: DatePickerTriggerProps) {
  const { selectedDate, setIsOpen } = useDatePickerContext();

  const handlePress = () => {
    setIsOpen(true);
  };

  const formattedValue = selectedDate 
    ? selectedDate.toISOString().split('T')[0] 
    : '';

  const { onBlur, onFocus, ...inputProps } = props as any;

  return (
    <Pressable 
      onPress={handlePress} 
      style={cn(styles.triggerWrapper, style)}
      accessibilityRole="combobox"
      accessibilityState={{ expanded: false }}
      accessibilityLabel={`Date Picker: ${selectedDate ? formattedValue : 'Select a date'}`}
    >
      <Input
        editable={false} 
        value={formattedValue}
        placeholder={placeholder}
        pointerEvents="none"
        style={styles.inputReset}
        {...inputProps}
      />
    </Pressable>
  );
}

export function DatePickerContent({ style, ...props }: ViewProps) {
  const { selectedDate, onDateChange, setIsOpen } = useDatePickerContext();
  const { colors } = useTheme();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysCount = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);

  const renderGrid = () => {
    const grid = [];
    
    for (let i = 0; i < firstDayOffset; i++) {
      grid.push(<View key={`empty-${i}`} style={styles.gridCell} />);
    }

    for (let day = 1; day <= daysCount; day++) {
      const isSelected = 
        selectedDate &&
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === day;

      const handleSelect = () => {
        onDateChange(new Date(year, month, day));
      };

      grid.push(
        <Pressable
          key={day}
          onPress={handleSelect}
          style={cn(
            styles.cellSurface,
            isSelected && [styles.cellSelected, { backgroundColor: colors.primary, borderColor: colors.border }]
          )}
          accessibilityRole="adjustable"
          accessibilityLabel={`${day} ${month + 1} ${year}`}
          accessibilityState={{ selected: !!isSelected }}
        >
          <Text style={cn(styles.cellText, { color: colors.foreground }, isSelected && { color: colors.primaryForeground, fontWeight: '800' })}>
            {day}
          </Text>
        </Pressable>
      );
    }
    return grid;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <SheetContent PointHeight={420} style={style} {...props}>
      <View style={styles.headerRow}>
        <Button
          variant="outline"
          title="<"
          onPress={handlePrevMonth}
          style={styles.navButton}
        />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
        </Text>
        <Button
          variant="outline"
          title=">"
          onPress={handleNextMonth}
          style={styles.navButton}
        />
      </View>

      <View style={[styles.weekRow, { borderColor: colors.border }]}>
        {DAYS_OF_WEEK.map((day) => (
          <View key={day} style={styles.gridCell}>
            <Text style={[styles.weekText, { color: colors.mutedForeground }]}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.gridContainer}>
        {renderGrid()}
      </View>

      <View style={styles.footer}>
        <Button title="CONFIRM" onPress={handleClose} style={styles.confirmButton} />
      </View>
    </SheetContent>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    minWidth: 48,
    paddingHorizontal: 0,
  },
  headerTitle: {
    fontSize: typography.md,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    borderBottomWidth: borderWidths.standard,
    paddingBottom: spacing.xs,
  },
  weekText: {
    fontSize: typography.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSurface: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 0,
  },
  cellSelected: {
    borderWidth: borderWidths.standard,
  },
  cellText: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  confirmButton: {
    width: '100%',
  },
});