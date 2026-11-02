import { View } from 'react-native';
import { ListItem, Separator } from '@/components/apexrn';

export default function ListItemExample() {
  return (
    <View style={{ width: 320 }}>
      <ListItem title="Notifications" description="Choose what to be alerted about" onPress={() => {}} />
      <Separator />
      <ListItem title="Privacy" description="Who can see your profile" onPress={() => {}} />
      <Separator />
      <ListItem title="Language" onPress={() => {}} />
    </View>
  );
}
