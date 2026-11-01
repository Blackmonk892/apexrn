import { View } from 'react-native';
import { Input } from '@/components/apexrn';

export default function InputDisabledExample() {
  return (
    <View style={{ width: 300 }}>
      <Input label="Workspace" defaultValue="Acme Studio" disabled description="Only owners can rename it." />
    </View>
  );
}
