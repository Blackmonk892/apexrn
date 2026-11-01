import { View } from 'react-native';
import { FAB } from '@/components/apexrn';

export default function FABExtendedExample() {
  return (
    <View style={{ width: 320, height: 120 }}>
      <FAB label="Compose" accessibilityLabel="Compose a message" placement="bottom-center" onPress={() => {}} />
    </View>
  );
}
