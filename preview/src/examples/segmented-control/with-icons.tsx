import { View } from 'react-native';
import { SegmentedControl } from '@/components/apexrn';
import { BellIcon, HomeIcon, UserIcon } from '@/lib/apexrn/icons';

export default function SegmentedControlWithIconsExample() {
  return (
    <View style={{ width: 320 }}>
      <SegmentedControl
        defaultValue="home"
        segments={[
          { value: 'home', label: 'Home', icon: HomeIcon },
          { value: 'alerts', label: 'Alerts', icon: BellIcon },
          { value: 'me', label: 'Me', icon: UserIcon },
        ]}
      />
    </View>
  );
}
