import { View } from 'react-native';
import { DatePicker, DatePickerContent, DatePickerTrigger, formatLocalDate } from '@/components/apexrn';

export default function DatePickerExample() {
  return (
    <View style={{ width: 280 }}>
      <DatePicker onValueChange={(date) => console.log(formatLocalDate(date))}>
        <DatePickerTrigger label="Birthday" placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>
    </View>
  );
}
