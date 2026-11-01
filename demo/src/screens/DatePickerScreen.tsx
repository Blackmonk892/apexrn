import React, { useState } from 'react';
import { DatePicker, DatePickerContent, DatePickerTrigger, formatLocalDate } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

// en-GB keeps the labels ("Thursday, 3 December 2026") identical on every device, so the emulator flow can tap by label.
const LOCALE = 'en-GB';

export default function DatePickerScreen({ onBack }: { onBack: () => void }) {
  const [delivery, setDelivery] = useState<Date | null>(new Date(2026, 10, 3));
  const [log, setLog] = useState('none');

  return (
    <Layout id="datepicker" title="DATE PICKER" onBack={onBack}>
      <Section title="Controlled" note="value + onValueChange. Tapping a day selects it and closes the sheet; reopening starts on the selected month.">
        <DatePicker
          locale={LOCALE}
          value={delivery}
          onValueChange={(next) => {
            setDelivery(next);
            setLog(formatLocalDate(next));
          }}
        >
          <DatePickerTrigger testID="date-delivery" label="Delivery date" description="We ship Monday to Saturday." />
          <DatePickerContent />
        </DatePicker>
        <Caption>{`Last change: ${log}`}</Caption>
      </Section>

      <Section title="Range and rules" note="min and max bound the month buttons too. Sundays are disabled with isDateDisabled; the week starts on Monday.">
        <DatePicker
          locale={LOCALE}
          defaultValue={new Date(2026, 2, 10)}
          min={new Date(2026, 2, 2)}
          max={new Date(2026, 3, 20)}
          weekStartsOn={1}
          isDateDisabled={(date) => date.getDay() === 0}
          onValueChange={(next) => setLog(`window ${formatLocalDate(next)}`)}
        >
          <DatePickerTrigger testID="date-window" label="Pickup window" />
          <DatePickerContent />
        </DatePicker>
      </Section>

      <Section title="States" note="Empty with a placeholder, invalid with a message, and disabled.">
        <DatePicker locale={LOCALE}>
          <DatePickerTrigger label="Start date" placeholder="Pick a start date" />
          <DatePickerContent />
        </DatePicker>
        <DatePicker locale={LOCALE}>
          <DatePickerTrigger label="Return date" invalid errorMessage="Choose a date after the start." placeholder="Pick a return date" />
          <DatePickerContent />
        </DatePicker>
        <DatePicker locale={LOCALE} defaultValue={new Date(2026, 0, 15)}>
          <DatePickerTrigger label="Locked date" disabled />
          <DatePickerContent />
        </DatePicker>
      </Section>

      <Section title="Edge cases" note="August 2026 spans six week rows; the sheet is sized from the measured grid so none is clipped.">
        <DatePicker locale={LOCALE} defaultValue={new Date(2026, 7, 31)}>
          <DatePickerTrigger testID="date-six-rows" label="Six-row month" />
          <DatePickerContent />
        </DatePicker>
      </Section>
    </Layout>
  );
}
