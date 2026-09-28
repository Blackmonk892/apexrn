import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@ui/components/accordion';

export default function AccordionScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="ACCORDION COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>SINGLE TYPE (DEFAULT)</Text>
        <Accordion type="single" style={[styles.accordionContainer, { borderColor: textColor }]}>
          <AccordionItem value="item-1">
            <AccordionTrigger>What is Brutalism?</AccordionTrigger>
            <AccordionContent>
              <Text style={{ color: textColor }}>It is a style with an emphasis on materials, textures and construction, producing highly expressive forms.</Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              <Text style={{ color: textColor }}>Yes. It adheres to contrast and standard ARIA roles for screen readers.</Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger disabled>Disabled Item</AccordionTrigger>
            <AccordionContent>
              <Text style={{ color: textColor }}>You cannot read me.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>MULTIPLE TYPE</Text>
        <Accordion type="multiple" style={[styles.accordionContainer, { borderColor: textColor }]}>
          <AccordionItem value="item-a">
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionContent>
              <Text style={{ color: textColor }}>You can open Section A and Section B at the same time.</Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-b">
            <AccordionTrigger>Section B</AccordionTrigger>
            <AccordionContent>
              <Text style={{ color: textColor }}>Both sections can remain expanded simultaneously.</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  accordionContainer: { borderWidth: 4 },
});
