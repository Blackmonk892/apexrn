import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

function Body({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.body, { color: colors.foreground }]}>{children}</Text>;
}

export default function AccordionScreen({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<string>('shipping');

  return (
    <Layout title="ACCORDION" onBack={onBack}>
      <Section title="Single, controlled" note="type single (default): opening one closes the others. value + onValueChange.">
        <Accordion type="single" value={open} onValueChange={(v) => setOpen(v as string)}>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping</AccordionTrigger>
            <AccordionContent>
              <Body>Orders ship within two business days. You get a tracking link by email.</Body>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger>Returns</AccordionTrigger>
            <AccordionContent>
              <Body>Return any unused item within 30 days for a full refund.</Body>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="support">
            <AccordionTrigger>Support</AccordionTrigger>
            <AccordionContent>
              <Body>Message us any time. We reply within one business day.</Body>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Caption>{`Open: ${open || 'none'}`}</Caption>
      </Section>

      <Section title="Multiple, uncontrolled" note="type multiple with defaultValue. The first item starts open and must not animate on mount.">
        <Accordion type="multiple" defaultValue={['a']}>
          <AccordionItem value="a">
            <AccordionTrigger>Starts open</AccordionTrigger>
            <AccordionContent>
              <Body>This panel is open on first render.</Body>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Starts closed</AccordionTrigger>
            <AccordionContent>
              <Body>Several panels can be open at once.</Body>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Disabled">
        <Accordion>
          <AccordionItem value="x">
            <AccordionTrigger disabled>Unavailable section</AccordionTrigger>
            <AccordionContent>
              <Body>You cannot open this.</Body>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Edge cases">
        <Accordion defaultValue="long">
          <AccordionItem value="long">
            <AccordionTrigger>A trigger label that is far too long to fit on one line of the row</AccordionTrigger>
            <AccordionContent>
              <Body>
                Long content wraps and the panel grows to fit it. Long content wraps and the panel grows to fit it.
                Long content wraps and the panel grows to fit it. Long content wraps and the panel grows to fit it.
              </Body>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
});
