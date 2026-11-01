import { useState } from 'react';
import { View } from 'react-native';
import { Button, DatePicker, DatePickerContent, DatePickerTrigger } from '@/components/apexrn';

export default function DatePickerControlledExample() {
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <View style={{ width: 280, gap: 12 }}>
      <DatePicker value={date} onValueChange={setDate}>
        <DatePickerTrigger label="Due date" />
        <DatePickerContent />
      </DatePicker>
      <Button variant="outline" onPress={() => setDate(null)}>
        Clear date
      </Button>
    </View>
  );
}
