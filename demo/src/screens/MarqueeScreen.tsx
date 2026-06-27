import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Marquee from '@ui/components/marquee';

export default function MarqueeScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="MARQUEE COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT SPEED</Text>
        <Marquee text="BREAKING NEWS" />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>FAST SPEED & CUSTOM DIVIDER</Text>
        <Marquee text="SPECIAL OFFER" speed={150} divider=" 🔥 " />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>SLOW SPEED</Text>
        <Marquee text="READ ME SLOWLY" speed={30} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED STATE</Text>
        <Marquee text="CURRENTLY UNAVAILABLE" disabled />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
