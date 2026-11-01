import { View } from 'react-native';
import { Avatar, Badge, ListItem, Separator } from '@/components/apexrn';

export default function ListItemRichExample() {
  return (
    <View style={{ width: 340 }}>
      <ListItem
        title="Priya Raman"
        description="Design review moved to Thursday"
        meta="9:41"
        leading={<Avatar name="Priya Raman" size="sm" />}
        trailing={<Badge variant="primary" label="New" />}
        onPress={() => {}}
      />
      <Separator />
      <ListItem
        title="Tomás Rivera"
        description="Re: Release notes for 2.4"
        meta="Mon"
        leading={<Avatar name="Tomás Rivera" size="sm" />}
        onPress={() => {}}
      />
    </View>
  );
}
