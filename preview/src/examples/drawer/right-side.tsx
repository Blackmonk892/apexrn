import { Button, Drawer, DrawerContent, DrawerHeader, DrawerItem, DrawerList, DrawerTrigger } from '@/components/apexrn';

export default function DrawerRightSideExample() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Filters</Button>
      </DrawerTrigger>
      <DrawerContent side="right" width={280}>
        <DrawerHeader title="Filters" />
        <DrawerList>
          <DrawerItem label="Newest first" active />
          <DrawerItem label="Oldest first" />
          <DrawerItem label="Most popular" />
        </DrawerList>
      </DrawerContent>
    </Drawer>
  );
}
