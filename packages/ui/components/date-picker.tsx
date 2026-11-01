import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidths, spacing, textStyles, touchTarget } from '../lib/colors';
import { BackIcon } from '../lib/icons';
import { useTheme } from '../lib/theme';
import BrutalSurface from './brutal-surface';
import Button from './button';
import Input, { type InputProps } from './input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, type SheetContentProps } from './sheet';
import Text from './text';

export interface DatePickerProps {
  /** Controlled date. `undefined` leaves the picker uncontrolled; `null` is a controlled empty value. */
  value?: Date | null;
  /** Initial date when uncontrolled. */
  defaultValue?: Date | null;
  /** Fires with the tapped day. The picker closes after a pick. */
  onValueChange?: (date: Date) => void;
  /** Controlled open state. Omit to let the picker manage it. */
  open?: boolean;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Earliest selectable day, inclusive. Time of day is ignored. */
  min?: Date;
  /** Latest selectable day, inclusive. Time of day is ignored. */
  max?: Date;
  /** Return true to make a day unselectable, on top of `min` and `max`. */
  isDateDisabled?: (date: Date) => boolean;
  /** First column of the grid: 0 is Sunday, 1 is Monday. @default 0 */
  weekStartsOn?: number;
  /** BCP 47 tag for month, weekday and trigger text. Defaults to the device locale. */
  locale?: string;
  /** A `DatePickerTrigger` and a `DatePickerContent`. */
  children: ReactNode;
}

export interface DatePickerTriggerProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'editable' | 'onValueChange' | 'onChangeText' | 'style'> {
  /** Shown while no date is chosen. @default 'Select a date' */
  placeholder?: string;
  /** Outer wrapper style. */
  style?: StyleProp<ViewStyle>;
}

export type DatePickerContentProps = Omit<SheetContentProps, 'sheetHeight' | 'children'>;

interface DatePickerContextValue {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn: number;
  locale?: string;
}

const DatePickerContext = createContext<DatePickerContextValue | null>(null);

function useDatePicker(part: string) {
  const context = useContext(DatePickerContext);
  if (!context) throw new Error(`${part} must be used within DatePicker`);
  return context;
}

/** Formats a date in the local timezone (YYYY-MM-DD). `toISOString` is UTC and shows the wrong day behind UTC. */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Engines built without Intl locale data throw or ignore options, so every format has an English fallback.
function format(date: Date, options: Intl.DateTimeFormatOptions, locale: string | undefined, fallback: string): string {
  try {
    if (typeof Intl !== 'undefined' && typeof date.toLocaleDateString === 'function') {
      return date.toLocaleDateString(locale, options);
    }
  } catch {
    // An unsupported locale tag falls through to English.
  }
  return fallback;
}

const dayLabel = (date: Date, locale?: string) =>
  format(
    date,
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    locale,
    `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
  );

const monthLabel = (date: Date, locale?: string) =>
  format(date, { month: 'long', year: 'numeric' }, locale, `${MONTHS[date.getMonth()]} ${date.getFullYear()}`);

const triggerLabel = (date: Date, locale?: string) =>
  format(
    date,
    { day: 'numeric', month: 'long', year: 'numeric' },
    locale,
    `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
  );

// 2023-01-01 was a Sunday, so day index n is weekday n.
const weekdayShort = (index: number, locale?: string) =>
  format(new Date(2023, 0, 1 + index), { weekday: 'short' }, locale, WEEKDAYS[index].slice(0, 3));

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const normalizeWeekStart = (n: number) => (Number.isFinite(n) ? ((Math.trunc(n) % 7) + 7) % 7 : 0);

const GRID_ROWS = 6;
const NAV_ICON_SIZE = 20;

export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  min,
  max,
  isDateDisabled,
  weekStartsOn = 0,
  locale,
  children,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = useState<Date | null>(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const selectedDate = valueProp !== undefined ? valueProp : internalDate;
  const isOpen = openProp ?? internalOpen;

  const onDateChange = useCallback(
    (date: Date) => {
      if (valueProp === undefined) setInternalDate(date);
      onValueChange?.(date);
    },
    [valueProp, onValueChange],
  );

  const setIsOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const weekStart = normalizeWeekStart(weekStartsOn);

  const context = useMemo(
    () => ({ selectedDate, onDateChange, isOpen, setIsOpen, min, max, isDateDisabled, weekStartsOn: weekStart, locale }),
    [selectedDate, onDateChange, isOpen, setIsOpen, min, max, isDateDisabled, weekStart, locale],
  );

  return <DatePickerContext.Provider value={context}>{children}</DatePickerContext.Provider>;
}

export function DatePickerTrigger({
  placeholder = 'Select a date',
  style,
  label,
  description,
  invalid,
  errorMessage,
  disabled = false,
  testID,
  accessibilityLabel,
  accessibilityHint,
  inputStyle,
  ...inputProps
}: DatePickerTriggerProps) {
  const { selectedDate, isOpen, setIsOpen, locale } = useDatePicker('DatePickerTrigger');
  const text = selectedDate ? triggerLabel(selectedDate, locale) : '';
  const hint = [accessibilityHint, description, invalid ? errorMessage : undefined].filter(Boolean).join('. ') || undefined;

  return (
    <Pressable
      testID={testID}
      onPress={() => setIsOpen(true)}
      disabled={disabled}
      style={[styles.trigger, style]}
      accessibilityRole="combobox"
      accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
      accessibilityValue={text ? { text } : undefined}
      accessibilityHint={hint}
      accessibilityState={{ expanded: isOpen, disabled }}
      aria-haspopup="dialog"
    >
      {/* The Pressable is the single accessible node; the read-only Input only draws the field. */}
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Input
          {...inputProps}
          label={label}
          description={description}
          invalid={invalid}
          errorMessage={errorMessage}
          disabled={disabled}
          editable={false}
          value={text}
          placeholder={placeholder}
          inputStyle={[selectedDate ? textStyles.mono : null, inputStyle]}
        />
      </View>
    </Pressable>
  );
}

interface DayCellProps {
  date: Date;
  selected: boolean;
  today: boolean;
  disabled: boolean;
  locale?: string;
  onPick: (date: Date) => void;
}

function DayCell({ date, selected, today, disabled, locale, onPick }: DayCellProps) {
  const { colors } = useTheme();
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (disabled) setHeld(false);
  }, [disabled]);

  const fill = selected ? colors.foreground : held ? colors.muted : colors.background;
  const ink = selected
    ? colors.background
    : disabled || held
      ? colors.mutedForeground
      : colors.foreground;
  // The transparent border keeps every cell the same size as the outlined today cell.
  const edge = selected || today ? colors.border : 'transparent';

  return (
    <View style={styles.cell}>
      <BrutalSurface
        testID={`date-day-${formatLocalDate(date)}`}
        pressable={!disabled}
        elevation="flat"
        borderWidth="control"
        backgroundColor={fill}
        borderColor={edge}
        haptics={false}
        onPress={disabled ? undefined : () => onPick(date)}
        onPressIn={() => setHeld(true)}
        onPressOut={() => setHeld(false)}
        accessible
        accessibilityRole="button"
        accessibilityLabel={dayLabel(date, locale)}
        accessibilityState={{ selected, disabled }}
        style={styles.fill}
        surfaceStyle={styles.dayFace}
      >
        <Text variant="mono" tone="inherit" style={{ color: ink }}>
          {date.getDate()}
        </Text>
      </BrutalSurface>
    </View>
  );
}

export function DatePickerContent({ bottomInset = 0, ...props }: DatePickerContentProps) {
  const { selectedDate, onDateChange, isOpen, setIsOpen, min, max, isDateDisabled, weekStartsOn, locale } =
    useDatePicker('DatePickerContent');
  const { colors } = useTheme();

  const minDay = min ? startOfDay(min) : null;
  const maxDay = max ? startOfDay(max) : null;

  const initialMonth = () => {
    let base = selectedDate ?? new Date();
    if (!selectedDate) {
      if (minDay && base < minDay) base = minDay;
      if (maxDay && base > maxDay) base = maxDay;
    }
    return new Date(base.getFullYear(), base.getMonth(), 1);
  };

  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Each opening starts on the selected month, or today's when nothing is selected.
  useEffect(() => {
    if (isOpen) setViewMonth(initialMonth());
    // Only the opening resets the month; picking or navigating while open must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = (new Date(year, month, 1).getDay() - weekStartsOn + 7) % 7;

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const canGoPrev = !minDay || new Date(year, month, 0) >= minDay;
  const canGoNext = !maxDay || nextMonth <= maxDay;

  const today = new Date();
  const isBlocked = (date: Date) =>
    (!!minDay && date < minDay) || (!!maxDay && date > maxDay) || !!isDateDisabled?.(date);

  const rows: (Date | null)[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row: (Date | null)[] = [];
    for (let c = 0; c < 7; c++) {
      const day = r * 7 + c - lead + 1;
      row.push(day >= 1 && day <= daysInMonth ? new Date(year, month, day) : null);
    }
    rows.push(row);
  }

  const pick = (date: Date) => {
    onDateChange(date);
    setIsOpen(false);
  };

  // Six rows for every month keep the panel height constant. The height comes from the measured
  // content (font scale changes it), with a token-based estimate until the first layout.
  const [contentHeight, setContentHeight] = useState(
    touchTarget + spacing.sm + (textStyles.label.lineHeight ?? 16) + spacing.xs * 2 + borderWidths.control + spacing.xs + GRID_ROWS * touchTarget,
  );
  // Handle strip, bottom padding and the panel's borders around the measured content.
  const chrome = touchTarget + spacing.md + borderWidths.container * 2 + bottomInset;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent sheetHeight={Math.ceil(contentHeight + chrome)} bottomInset={bottomInset} {...props}>
        <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
          <SheetHeader style={styles.header}>
            <View style={styles.nav}>
              <Button
                variant="outline"
                size="sm"
                accessibilityLabel="Previous month"
                testID="date-prev"
                disabled={!canGoPrev}
                onPress={() => setViewMonth(prevMonth)}
                icon={(color) => <BackIcon size={NAV_ICON_SIZE} color={color} />}
              />
              <SheetTitle style={styles.month} accessibilityLiveRegion="polite">
                {monthLabel(viewMonth, locale)}
              </SheetTitle>
              <Button
                variant="outline"
                size="sm"
                accessibilityLabel="Next month"
                testID="date-next"
                disabled={!canGoNext}
                onPress={() => setViewMonth(nextMonth)}
                icon={(color) => (
                  <View style={styles.flip}>
                    <BackIcon size={NAV_ICON_SIZE} color={color} />
                  </View>
                )}
              />
            </View>
          </SheetHeader>

          <View
            style={[styles.weekRow, { borderBottomColor: colors.border, paddingBottom: spacing.xs, marginBottom: spacing.xs }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {Array.from({ length: 7 }, (_, c) => (
              <View key={c} style={styles.weekCell}>
                <Text variant="label" tone="muted">
                  {weekdayShort((weekStartsOn + c) % 7, locale)}
                </Text>
              </View>
            ))}
          </View>

          {rows.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((date, c) =>
                date ? (
                  <DayCell
                    key={c}
                    date={date}
                    selected={!!selectedDate && sameDay(date, selectedDate)}
                    today={sameDay(date, today)}
                    disabled={isBlocked(date)}
                    locale={locale}
                    onPick={pick}
                  />
                ) : (
                  <View key={c} style={styles.cell} />
                ),
              )}
            </View>
          ))}
        </View>
      </SheetContent>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  trigger: { alignSelf: 'stretch' },
  header: { paddingBottom: spacing.sm },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  month: { flex: 1, textAlign: 'center' },
  flip: { transform: [{ rotate: '180deg' }] },
  weekRow: { flexDirection: 'row', borderBottomWidth: borderWidths.control },
  weekCell: { flex: 1, alignItems: 'center' },
  row: { flexDirection: 'row' },
  cell: { flex: 1, height: touchTarget, padding: 1 },
  fill: { flex: 1 },
  dayFace: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default DatePicker;
