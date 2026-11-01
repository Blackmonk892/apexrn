import { useState } from 'react';
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, Text } from '@/components/apexrn';

export default function SheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setOpen(true)}>Open sheet</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        {({ handleDismiss }) => (
          <SheetContent sheetHeight={300}>
            <SheetHeader>
              <SheetTitle>Sort by</SheetTitle>
            </SheetHeader>
            <Text>Drag the handle down, or close it here.</Text>
            <Button variant="outline" onPress={handleDismiss}>
              Close
            </Button>
          </SheetContent>
        )}
      </Sheet>
    </>
  );
}
