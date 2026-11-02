import { View } from 'react-native';
import { SegmentedControl } from '@/components/apexrn';

export default function SegmentedControlDisabledSegmentExample() {
  return (
    <View style={{ width: 320 }}>
      <SegmentedControl
        defaultValue="monthly"
        segments={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
          { value: 'team', label: 'Team', disabled: true },
        ]}
      />
    </View>
  );
}
