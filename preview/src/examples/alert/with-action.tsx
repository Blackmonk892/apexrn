import { View } from 'react-native';
import { Alert, Button } from '@/components/apexrn';

export default function AlertWithActionExample() {
  return (
    <View style={{ width: 320 }}>
      <Alert
        variant="destructive"
        title="Sync failed"
        description="Your last 3 changes were not saved."
        action={
          <Button size="sm" variant="outline">
            Retry
          </Button>
        }
      />
    </View>
  );
}
