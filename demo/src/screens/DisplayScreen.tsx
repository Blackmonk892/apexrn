import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Avatar from '@ui/components/avatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@ui/components/accordion';
import Carousel from '@ui/components/carousel';
import Marquee from '@ui/components/marquee';
import ListItem from '@ui/components/listitem';

export default function DisplayScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const carouselData = [
    { id: 1, color: '#FF5733' },
    { id: 2, color: '#33FF57' },
    { id: 3, color: '#3357FF' },
  ];

  return (
    <Layout title="DATA DISPLAY" onBack={onBack}>
      <Text style={[styles.label, { color: textColor }]}>AVATAR</Text>
      <View style={styles.row}>
        <Avatar initials="JD" withShadow />
        <Avatar size="sm" initials="AB" />
        <Avatar size="lg" initials="XY" withShadow />
      </View>

      <Text style={[styles.label, { color: textColor }]}>ACCORDION</Text>
      <Accordion type="single" style={{ marginBottom: 16 }}>
        <AccordionItem value="item-1">
          <AccordionTrigger>What is Brutalism?</AccordionTrigger>
          <AccordionContent>
            <Text style={{ color: '#000' }}>It is a style with an emphasis on materials, textures and construction, producing highly expressive forms.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            <Text style={{ color: '#000' }}>Yes. It adheres to contrast and standard ARIA roles.</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Text style={[styles.label, { color: textColor }]}>CAROUSEL</Text>
      <Carousel 
        data={carouselData} 
        showIndicators 
        renderItem={({ item }) => (
          <View style={[styles.carouselCard, { backgroundColor: item.color }]}>
            <Text style={styles.carouselText}>CARD {item.id}</Text>
          </View>
        )} 
      />

      <Text style={[styles.label, { color: textColor }]}>MARQUEE</Text>
      <Marquee text="BREAKING NEWS" speed={50} />

      <Text style={[styles.label, { color: textColor }]}>LIST ITEM</Text>
      <ListItem title="Notifications" description="Manage your alert settings" />
      <ListItem title="Privacy" description="Review data policies" disabled />
    </Layout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginTop: 24, marginBottom: 12, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  carouselCard: { height: 150, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  carouselText: { fontSize: 24, fontWeight: '900', color: '#FFF', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 }
});
