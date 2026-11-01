import { View } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@/components/apexrn';

export default function TabsExample() {
  return (
    <View style={{ width: 320 }}>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Text>12 open tasks and 3 due today.</Text>
        </TabsContent>
        <TabsContent value="activity">
          <Text>Priya closed "Fix login redirect" this morning.</Text>
        </TabsContent>
        <TabsContent value="settings">
          <Text>Notifications are on for this project.</Text>
        </TabsContent>
      </Tabs>
    </View>
  );
}
