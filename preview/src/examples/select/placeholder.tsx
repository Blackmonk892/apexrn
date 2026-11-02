import { View } from 'react-native';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/apexrn';

export default function SelectPlaceholderExample() {
  return (
    <View style={{ width: 280 }}>
      <Select>
        <SelectTrigger label="Time zone" placeholder="Choose a time zone" />
        <SelectContent>
          <SelectItem value="utc" label="UTC" />
          <SelectItem value="cet" label="Central European" />
          <SelectItem value="pst" label="Pacific" />
        </SelectContent>
      </Select>
    </View>
  );
}
