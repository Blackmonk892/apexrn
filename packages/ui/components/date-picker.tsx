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
  type StyleProp,
  StyleSheet,
  Text,
  type TextInputProps,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { borderWidths, spacing, touchTarget, typography } from '../lib/colors';
import { useTheme } from '../lib/theme';

import Button from './button';
import Input from './input';
import { Sheet, SheetContent } from './sheet';

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
   * The controlled selected date. Omit for an uncontrolled picker.
   */
  value?: Date | null;
  /**
   * Initial date when uncontrolled.
   */
  defaultValue?: Date | null;
  /**
   * Callback fired when a date is selected.
   */
  onChange?: (date: Date) => void;
  /**
   * The controlled open state of the calendar sheet. Omit to let DatePicker manage it.
   */
  open?: boolean;
  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * A `DatePickerTrigger` and a `DatePickerContent`.
   */
  children: ReactNode;
}

export interface DatePickerTriggerProps extends Omit<TextInputProps, 'value' | 'editable' | 'onPress' | 'style'> {
  /**
   * Placeholder text displayed when no date is chosen.
   */
  placeholder?: string;
  /**
   * Style for the pressable wrapper.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Formats a date in the *local* timezone (YYYY-MM-DD). `toISOString` is UTC
 * and shows the wrong day for timezones behind UTC.
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

// Handle strip + sheet padding + month header + weekday row + confirm row,
// measured with the default spacing scale plus slack. Grid rows are added on
// top; a month spans up to six of them, and the sheet keeps that height for
// every month so it doesn't jump when navigating.
const SHEET_CHROME_HEIGHT = 220;
const GRID_ROWS = 6;

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = useState<Date | null>(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const selectedDate = valueProp !== undefined ? valueProp : internalDate;
  const isOpen = openProp ?? internalOpen;

  const onDateChange = useCallback((date: Date) => {
    if (valueProp === undefined) setInternalDate(date);
    onChange?.(date);
  }, [valueProp, onChange]);

  const setIsOpen = useCallback((next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }, [openProp, onOpenChange]);

  const context = useMemo(
    () => ({ selectedDate, onDateChange, isOpen, setIsOpen }),
    [selectedDate, onDateChange, isOpen, setIsOpen],
  );

  return <DatePickerContext.Provider value={context}>{children}</DatePickerContext.Provider>;
}

export function DatePickerTrigger({ placeholder, style, onFocus, onBlur, ...props }: DatePickerTriggerProps) {
  const { selectedDate, isOpen, setIsOpen } = useDatePickerContext();

  const formattedValue = selectedDate ? formatLocalDate(selectedDate) : '';

  return (
    <Pressable
      onPress={() => setIsOpen(true)}
      onFocus={onFocus}
      onBlur={onBlur}
      style={[styles.triggerWrapper, style]}
      accessibilityRole="combobox"
      accessibilityLabel={placeholder ?? 'Select a date'}
      accessibilityValue={formattedValue ? { text: formattedValue } : undefined}
      accessibilityState={{ expanded: isOpen }}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      {/* Taps go to the Pressable; the read-only Input is just the visual. */}
      <View style={styles.inputPassthrough}>
        <Input
          editable={false}
          value={formattedValue}
          placeholder={placeholder}
          {...props}
        />
      </View>
    </Pressable>
  );
}

export function DatePickerContent({ style, ...props }: ViewProps) {
  const { selectedDate, onDateChange, isOpen, setIsOpen } = useDatePickerContext();
  const { colors } = useTheme();

  const [currentDate, setCurrentDate] = useState(() => {
    const base = selectedDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // Reopening the calendar returns to the selected month instead of
  // resetting to today.
  useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [isOpen, selectedDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysCount = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);

  const renderGrid = () => {
    const grid = [];

    for (let i = 0; i < firstDayOffset; i++) {
      grid.push(<View key={`empty-${i}`} style={[styles.gridCell, { height: touchTarget }]} />);
    }

    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month, day);
      const isSelected =
        !!selectedDate &&
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === day;

      grid.push(
        <Pressable
          key={day}
          onPress={() => onDateChange(date)}
          style={({ pressed }) => [
            styles.gridCell,
            styles.cellSurface,
            { height: touchTarget },
            pressed && { backgroundColor: colors.accent, borderColor: colors.border },
            isSelected && { backgroundColor: colors.primary, borderColor: colors.border, borderWidth: borderWidths.standard },
          ]}
          accessibilityRole="button"
          accessibilityLabel={date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          accessibilityState={{ selected: isSelected }}
          aria-selected={isSelected}
        >
          {({ pressed }) => (
            <Text
              style={[
                styles.cellText,
                { fontSize: typography.sm, color: colors.foreground },
                pressed && !isSelected && { color: colors.accentForeground },
                isSelected && { color: colors.primaryForeground, fontWeight: '800' },
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {day}
            </Text>
          )}
        </Pressable>
      );
    }
    return grid;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {() => (
        <SheetContent sheetHeight={SHEET_CHROME_HEIGHT + GRID_ROWS * touchTarget} style={style} {...props}>
          <View style={[styles.headerRow, { marginBottom: spacing.md }]}>
            <Button
              variant="outline"
              title="<"
              accessibilityLabel="Previous month"
              onPress={() => setCurrentDate(new Date(year, month - 1, 1))}
              style={styles.navButton}
            />
            <Text
              style={[styles.headerTitle, { fontSize: typography.md, color: colors.foreground }]}
              accessibilityRole="header"
              maxFontSizeMultiplier={1.3}
            >
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
            </Text>
            <Button
              variant="outline"
              title=">"
              accessibilityLabel="Next month"
              onPress={() => setCurrentDate(new Date(year, month + 1, 1))}
              style={styles.navButton}
            />
          </View>

          <View
            style={[styles.weekRow, { borderColor: colors.border, marginBottom: spacing.xs, paddingBottom: spacing.xs }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} style={styles.gridCell}>
                <Text style={[styles.weekText, { fontSize: typography.xs, color: colors.mutedForeground }]}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.gridContainer}>
            {renderGrid()}
          </View>

          <View style={[styles.footer, { paddingTop: spacing.md }]}>
            <Button title="CONFIRM" onPress={() => setIsOpen(false)} style={styles.confirmButton} />
          </View>
        </SheetContent>
      )}
    </Sheet>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    minWidth: 48,
    paddingHorizontal: 0,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: borderWidths.standard,
  },
  weekText: {
    fontWeight: '800',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // 7 columns; the height is set per cell from the touch-target token.
  gridCell: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSurface: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 0,
  },
  cellText: {
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
  },
  confirmButton: {
    alignSelf: 'stretch',
  },
});
