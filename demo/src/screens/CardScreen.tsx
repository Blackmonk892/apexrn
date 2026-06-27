import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Card, { CardHeader, CardFooter } from '@ui/components/card';
import Button from '@ui/components/button';

export default function CardScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="CARD COMPONENT" onBack={onBack}>
      <Text style={[styles.label, { color: textColor }]}>DEFAULT CARD</Text>
      <Card>
        <Text style={[styles.cardTitle, { color: '#000' }]}>CARD TITLE</Text>
        <Text style={[styles.cardBody, { color: '#000' }]}>This is a default card with thick borders and a hard shadow.</Text>
      </Card>

      <Text style={[styles.label, { color: textColor }]}>PRIMARY CARD</Text>
      <Card variant="primary">
        <Text style={[styles.cardTitle, { color: '#FFF' }]}>PRIMARY CARD</Text>
        <Text style={[styles.cardBody, { color: '#FFF' }]}>Bold red background with white text.</Text>
      </Card>

      <Text style={[styles.label, { color: textColor }]}>COMPOSED CARD</Text>
      <Card>
        <CardHeader>
          <Text style={[styles.cardTitle, { color: '#000' }]}>PRICING PLAN</Text>
        </CardHeader>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#000' }}>$9/mo</Text>
        </View>
        <CardFooter>
          <Button title="Get Started" variant="primary" onPress={() => {}} />
        </CardFooter>
      </Card>
    </Layout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', textTransform: 'uppercase' },
  cardBody: { fontSize: 14, marginTop: 8 },
});