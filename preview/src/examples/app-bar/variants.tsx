import { View } from 'react-native';
import { AppBar } from '@/components/apexrn';

export default function AppBarVariantsExample() {
  return (
    <View style={{ width: 340, gap: 12 }}>
      <AppBar title="Default" />
      <AppBar title="Primary" variant="primary" />
      <AppBar title="Accent" variant="accent" />
      <AppBar title="Inverse" variant="inverse" />
    </View>
  );
}
