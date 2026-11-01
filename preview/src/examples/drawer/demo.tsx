import { Button, Drawer, DrawerContent, DrawerHeader, DrawerItem, DrawerList, DrawerTrigger } from '@/components/apexrn';

export default function DrawerExample() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open menu</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader title="ApexRN" subtitle="ada@example.com" />
        <DrawerList>
          <DrawerItem label="Home" active />
          <DrawerItem label="Inbox" badge={12} />
          <DrawerItem label="Settings" />
        </DrawerList>
      </DrawerContent>
    </Drawer>
  );
}
