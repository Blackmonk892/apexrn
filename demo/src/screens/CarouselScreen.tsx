import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Carousel from '@ui/components/carousel';

export default function CarouselScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const data = [
    { id: '1', title: 'CARD 1', color: '#FF5252' },
    { id: '2', title: 'CARD 2', color: '#448AFF' },
    { id: '3', title: 'CARD 3', color: '#69F0AE' },
    { id: '4', title: 'CARD 4', color: '#FFD740' },
  ];

  return (
    <Layout title="CAROUSEL COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT (NO INDICATORS)</Text>
        <Carousel 
          data={data}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: item.color }]}>
              <Text style={styles.cardText}>{item.title}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>WITH INDICATORS & SMALL WIDTH</Text>
        <Carousel 
          data={data}
          showIndicators
          itemWidth={200}
          gap={20}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: item.color, height: 100 }]}>
              <Text style={[styles.cardText, { fontSize: 20 }]}>{item.title}</Text>
            </View>
          )}
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  card: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#FFF',
  },
  cardText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
  }
});
