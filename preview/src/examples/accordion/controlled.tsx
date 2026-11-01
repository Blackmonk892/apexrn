import { useState } from 'react';
import { View } from 'react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Text } from '@/components/apexrn';

export default function AccordionControlledExample() {
  const [open, setOpen] = useState('plan');

  return (
    <View style={{ width: 320, gap: 12 }}>
      <Accordion type="single" value={open} onValueChange={(value) => setOpen(value as string)}>
        <AccordionItem value="plan">
          <AccordionTrigger>Plan</AccordionTrigger>
          <AccordionContent>
            <Text>Pro, billed yearly.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="usage">
          <AccordionTrigger>Usage</AccordionTrigger>
          <AccordionContent>
            <Text>14 of 20 projects used.</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button variant="outline" onPress={() => setOpen('')}>
        Collapse all
      </Button>
    </View>
  );
}
