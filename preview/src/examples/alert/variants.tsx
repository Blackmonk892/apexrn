import { View } from 'react-native';
import { Alert } from '@/components/apexrn';

export default function AlertVariantsExample() {
  return (
    <View style={{ width: 320, gap: 12 }}>
      <Alert title="New version available" description="Update to get the latest fixes." />
      <Alert variant="success" title="Payment received" description="Receipt sent to ada@example.com." />
      <Alert variant="warning" title="Storage almost full" description="You have used 92% of your 5 GB." />
      <Alert variant="destructive" title="Sync failed" description="Check your connection and try again." />
    </View>
  );
}
