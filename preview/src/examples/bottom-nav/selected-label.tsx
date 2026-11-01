import { View } from 'react-native';
import { BottomNav, BottomNavItem } from '@/components/apexrn';
import { BellIcon, HomeIcon, UserIcon } from '@/lib/apexrn/icons';

export default function BottomNavSelectedLabelExample() {
  return (
    <View style={{ width: 340 }}>
      <BottomNav defaultValue="home" labelMode="selected">
        <BottomNavItem value="home" label="Home" icon={(color) => <HomeIcon size={22} color={color} />} />
        <BottomNavItem value="alerts" label="Alerts" icon={(color) => <BellIcon size={22} color={color} />} />
        <BottomNavItem value="profile" label="Profile" icon={(color) => <UserIcon size={22} color={color} />} />
      </BottomNav>
    </View>
  );
}
