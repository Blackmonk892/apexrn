import { View } from 'react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Text } from '@/components/apexrn';

export default function AccordionMultipleExample() {
  return (
    <View style={{ width: 320 }}>
      <Accordion type="multiple" defaultValue={['account', 'privacy']}>
        <AccordionItem value="account">
          <AccordionTrigger>Account</AccordionTrigger>
          <AccordionContent>
            <Text>Change your name, email and password.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="privacy">
          <AccordionTrigger>Privacy</AccordionTrigger>
          <AccordionContent>
            <Text>Choose what other people can see.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="devices">
          <AccordionTrigger>Devices</AccordionTrigger>
          <AccordionContent>
            <Text>Sign out of phones you no longer use.</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </View>
  );
}
