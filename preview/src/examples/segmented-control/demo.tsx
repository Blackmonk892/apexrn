import { useState } from 'react';
import { View } from 'react-native';
import { SegmentedControl } from '@/components/apexrn';

export default function SegmentedControlExample() {
  const [range, setRange] = useState('week');

  return (
    <View style={{ width: 320 }}>
      <SegmentedControl
        value={range}
        onValueChange={setRange}
        segments={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />
    </View>
  );
}
