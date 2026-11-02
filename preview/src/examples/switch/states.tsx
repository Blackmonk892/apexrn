import { View } from 'react-native';
import { Switch } from '@/components/apexrn';

export default function SwitchStatesExample() {
  return (
    <View style={{ gap: 12 }}>
      <Switch label="Airplane mode" defaultChecked={false} />
      <Switch label="Dark mode" defaultChecked />
      <Switch label="Location (managed by admin)" defaultChecked disabled />
    </View>
  );
}
