import { useState } from 'react';
import { View } from 'react-native';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@/components/apexrn';

export default function TabsControlledExample() {
  const [tab, setTab] = useState('account');

  return (
    <View style={{ width: 320, gap: 12 }}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Text>ada@example.com</Text>
        </TabsContent>
        <TabsContent value="billing">
          <Text>Pro plan, renews on March 1.</Text>
        </TabsContent>
      </Tabs>
      <Button variant="outline" onPress={() => setTab('billing')}>
        Go to billing
      </Button>
    </View>
  );
}
