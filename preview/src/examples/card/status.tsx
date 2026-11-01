import { View } from 'react-native';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/apexrn';

export default function CardStatusExample() {
  return (
    <View style={{ width: 320, gap: 20 }}>
      <Card variant="success">
        <CardHeader>
          <CardTitle>Deploy finished</CardTitle>
          <CardDescription>Version 2.4 is live.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="warning">
        <CardHeader>
          <CardTitle>Certificate expires soon</CardTitle>
          <CardDescription>Renew within 7 days.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="destructive">
        <CardHeader>
          <CardTitle>Build failed</CardTitle>
          <CardDescription>2 tests did not pass.</CardDescription>
        </CardHeader>
      </Card>
    </View>
  );
}
