import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// Notice typography and spacing are imported here
import { colors, borderWidths, spacing, typography } from '../lib/colors';
import { cn } from '../lib/utils';

// ⚠️ IMPORTANT: Composing existing ApexRN primitives
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

  return (
    <DatePickerContext.Provider value={{ selectedDate: value, onDateChange, isOpen, setIsOpen }}>
      {children}
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

  return (
    <Pressable 
      onPress={handlePress} 
      style={cn(styles.triggerWrapper, style)}
      accessibilityRole="combobox"
      accessibilityState={{ expanded: false }}
      accessibilityLabel={`Date Picker: ${selectedDate ? formattedValue : 'Select a date'}`}
    >
      <Input
        // The Input acts as a display trigger; native keyboard is suppressed
        editable={false} 
        value={formattedValue}
        placeholder={placeholder}
        pointerEvents="none"
        style={styles.inputReset}
        {...props}
      />
    </Pressable>
  );
}

export function DatePickerContent({ style, ...props }: ViewProps) {
  const { selectedDate, onDateChange, setIsOpen } = useDatePickerContext();
  
  // Default calendar grid view tracks the current month/year
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysCount = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);

  // Generates the harsh block grid for the active month
  const renderGrid = () => {
    const grid = [];
    
    // Add empty slots padding for the beginning of the week
    for (let i = 0; i < firstDayOffset; i++) {
      grid.push(<View key={`empty-${i}`} style={styles.gridCell} />);
    }

    // Populate numbered days
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
            isSelected && styles.cellSelected
          )}
          accessibilityRole="adjustable"
          accessibilityLabel={`${day} ${month + 1} ${year}`}
          accessibilityState={{ selected: !!isSelected }}
        >
          <Text style={cn(styles.cellText, isSelected && styles.cellTextSelected)}>
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
    // Uses the Sheet overlay, forcing a bottom rise
    <SheetContent PointHeight={420} style={style} {...props}>
      <View style={styles.headerRow}>
        <Button 
          variant="outline" 
          label="<" 
          onPress={handlePrevMonth} 
          style={styles.navButton}
        />
        <Text style={styles.headerTitle}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
        </Text>
        <Button 
          variant="outline" 
          label=">" 
          onPress={handleNextMonth} 
          style={styles.navButton}
        />
      </View>

      {/* Week Header */}
      <View style={styles.weekRow}>
        {DAYS_OF_WEEK.map((day) => (
          <View key={day} style={styles.gridCell}>
            <Text style={styles.weekText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Blocky calendar day matrix */}
      <View style={styles.gridContainer}>
        {renderGrid()}
      </View>

      <View style={styles.footer}>
        <Button label="CONFIRM" onPress={handleClose} style={styles.confirmButton} />
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
    color: colors.light.foreground,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    borderBottomWidth: borderWidths.standard,
    borderColor: colors.light.border,
    paddingBottom: spacing.xs,
  },
  weekText: {
    fontSize: typography.xs,
    fontWeight: '800',
    color: colors.light.mutedForeground,
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
    borderRadius: 0, // Strict blocky Brutalism
  },
  cellSelected: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.border,
    borderWidth: borderWidths.standard,
  },
  cellText: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.light.foreground,
  },
  cellTextSelected: {
    // Sharp inversion of text color when surface becomes solid primary
    color: colors.light.primaryForeground,
    fontWeight: '800',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  confirmButton: {
    width: '100%',
  },
});