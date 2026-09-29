import React, { useState } from 'react';
import { Label, DatePicker, DatePickerContent, DatePickerTrigger, formatLocalDate } from '@apexrn/ui';
import { View } from 'react-native';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function DatePickerScreen({ onBack }: { onBack: () => void }) {
  const [date, setDate] = useState<Date | null>(null);
  const [picked, setPicked] = useState('none');

  return (
    <Layout title="DATE PICKER" onBack={onBack}>
      <Section title="Controlled" note="value + onChange. Pick a day, then confirm. Reopening returns to the selected month.">
        <View>
          <Label>Delivery date</Label>
          <DatePicker value={date} onValueChange={setDate}>
            <DatePickerTrigger placeholder="Select a date" />
            <DatePickerContent />
          </DatePicker>
        </View>
        <Caption>{`Selected: ${date ? formatLocalDate(date) : 'none'}`}</Caption>
      </Section>

      <Section title="Uncontrolled, preselected" note="defaultValue opens on that month.">
        <DatePicker defaultValue={new Date(2026, 1, 28)} onValueChange={(d) => setPicked(formatLocalDate(d))}>
          <DatePickerTrigger placeholder="Select a date" />
          <DatePickerContent />
        </DatePicker>
        <Caption>{`Last change: ${picked}`}</Caption>
      </Section>

      <Section title="Edge cases" note="February 2026 starts on a Sunday; a six-row month such as August 2026 fits without clipping.">
        <DatePicker defaultValue={new Date(2026, 7, 31)}>
          <DatePickerTrigger placeholder="Select a date" />
          <DatePickerContent />
        </DatePicker>
      </Section>
    </Layout>
  );
}
