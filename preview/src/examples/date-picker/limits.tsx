import { View } from 'react-native';
import { DatePicker, DatePickerContent, DatePickerTrigger } from '@/components/apexrn';

const today = new Date();
const inThirtyDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

export default function DatePickerLimitsExample() {
  return (
    <View style={{ width: 280 }}>
      <DatePicker
        min={today}
        max={inThirtyDays}
        isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
      >
        <DatePickerTrigger label="Delivery date" description="Weekdays in the next 30 days" placeholder="Pick a date" />
        <DatePickerContent />
      </DatePicker>
    </View>
  );
}
