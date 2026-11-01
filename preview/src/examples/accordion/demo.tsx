import { View } from 'react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Text } from '@/components/apexrn';

export default function AccordionExample() {
  return (
    <View style={{ width: 320 }}>
      <Accordion type="single" defaultValue="shipping">
        <AccordionItem value="shipping">
          <AccordionTrigger>How long does shipping take?</AccordionTrigger>
          <AccordionContent>
            <Text>Orders leave the warehouse in two days and arrive within a week.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="returns">
          <AccordionTrigger>Can I return an order?</AccordionTrigger>
          <AccordionContent>
            <Text>Yes, within 30 days. Print the label from your order page.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="billing">
          <AccordionTrigger>When am I charged?</AccordionTrigger>
          <AccordionContent>
            <Text>Your card is charged when the order ships.</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </View>
  );
}
