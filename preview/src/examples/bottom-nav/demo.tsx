import { useState } from 'react';
import { View } from 'react-native';
import { BottomNav, BottomNavItem } from '@/components/apexrn';
import { BellIcon, HomeIcon, UserIcon } from '@/lib/apexrn/icons';

export default function BottomNavExample() {
  const [tab, setTab] = useState('home');

  return (
    <View style={{ width: 340 }}>
      <BottomNav value={tab} onValueChange={setTab}>
        <BottomNavItem value="home" label="Home" icon={(color) => <HomeIcon size={22} color={color} />} />
        <BottomNavItem value="alerts" label="Alerts" badge={3} icon={(color) => <BellIcon size={22} color={color} />} />
        <BottomNavItem value="profile" label="Profile" icon={(color) => <UserIcon size={22} color={color} />} />
      </BottomNav>
    </View>
  );
}
