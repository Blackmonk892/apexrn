import { useState } from 'react';
import { Button, Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerItem, DrawerList, DrawerSection, DrawerTrigger } from '@/components/apexrn';
import { BellIcon, HomeIcon, UserIcon } from '@/lib/apexrn/icons';

export default function DrawerSectionsExample() {
  const [page, setPage] = useState('home');

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader title="ApexRN" subtitle="Team workspace" />
        <DrawerList>
          <DrawerSection label="Main">
            <DrawerItem label="Home" icon={(color) => <HomeIcon size={20} color={color} />} active={page === 'home'} onPress={() => setPage('home')} />
            <DrawerItem label="Alerts" icon={(color) => <BellIcon size={20} color={color} />} badge={3} active={page === 'alerts'} onPress={() => setPage('alerts')} />
          </DrawerSection>
          <DrawerSection label="Account">
            <DrawerItem label="Profile" icon={(color) => <UserIcon size={20} color={color} />} active={page === 'profile'} onPress={() => setPage('profile')} />
          </DrawerSection>
        </DrawerList>
        <DrawerFooter>
          <Button variant="outline">Sign out</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
