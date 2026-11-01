import { View } from 'react-native';
import { AppBar } from '@/components/apexrn';

export default function AppBarLargeExample() {
  return (
    <View style={{ width: 340 }}>
      <AppBar title="Photos" subtitle="248 items" size="large" onBack={() => {}} />
    </View>
  );
}
