import { View } from 'react-native';
import { AppBar, AppBarAction } from '@/components/apexrn';
import { SearchIcon } from '@/lib/apexrn/icons';

export default function AppBarExample() {
  return (
    <View style={{ width: 340 }}>
      <AppBar
        title="Inbox"
        onBack={() => {}}
        trailing={<AppBarAction label="Search" icon={(color) => <SearchIcon size={20} color={color} />} onPress={() => {}} />}
      />
    </View>
  );
}
