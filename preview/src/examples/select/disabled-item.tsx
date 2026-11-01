import { View } from 'react-native';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/apexrn';

export default function SelectDisabledItemExample() {
  return (
    <View style={{ width: 280 }}>
      <Select defaultValue="free">
        <SelectTrigger label="Plan" />
        <SelectContent>
          <SelectItem value="free" label="Free" />
          <SelectItem value="pro" label="Pro" />
          <SelectItem value="enterprise" label="Enterprise" disabled />
        </SelectContent>
      </Select>
    </View>
  );
}
