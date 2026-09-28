import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import { DatePicker, DatePickerTrigger, DatePickerContent, formatLocalDate } from '@ui/components/datepicker';

export default function DatePickerScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [date, setDate] = useState<Date | null>(null);

  return (
    <Layout title="DATE PICKER COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT DATE PICKER</Text>
        <DatePicker value={date} onChange={setDate}>
          <DatePickerTrigger placeholder="Select a date" />
          <DatePickerContent />
        </DatePicker>
        <Text style={{ color: textColor, marginTop: 12 }}>
          Selected Date: {date ? formatLocalDate(date) : 'None'}
        </Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36, zIndex: 1 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
