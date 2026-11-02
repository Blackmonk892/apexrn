import { View } from 'react-native';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/apexrn';

export default function SelectExample() {
  return (
    <View style={{ width: 280 }}>
      <Select defaultValue="fr" onValueChange={(value) => console.log(value)}>
        <SelectTrigger label="Country" placeholder="Pick a country" />
        <SelectContent>
          <SelectItem value="fr" label="France" />
          <SelectItem value="jp" label="Japan" />
          <SelectItem value="pt" label="Portugal" />
          <SelectItem value="us" label="United States" />
        </SelectContent>
      </Select>
    </View>
  );
}
