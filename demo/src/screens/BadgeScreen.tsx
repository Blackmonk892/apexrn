import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Badge from '@ui/components/badge';

export default function BadgeScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="BADGE COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>VARIANTS (WITHOUT SHADOW)</Text>
        <View style={styles.row}>
          <Badge label="DEFAULT" />
          <Badge variant="primary" label="PRIMARY" />
          <Badge variant="outline" label="OUTLINE" />
          <Badge variant="accent" label="ACCENT" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>VARIANTS (WITH SHADOW)</Text>
        <View style={styles.row}>
          <Badge label="DEFAULT" withShadow />
          <Badge variant="primary" label="PRIMARY" withShadow />
          <Badge variant="outline" label="OUTLINE" withShadow />
          <Badge variant="accent" label="ACCENT" withShadow />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>MIXED IN LAYOUT</Text>
        <View style={[styles.card, { borderColor: isDark ? '#444' : '#000', backgroundColor: isDark ? '#111' : '#FFF' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>New Release</Text>
            <Badge variant="accent" label="v2.0" withShadow />
          </View>
          <Text style={{ marginTop: 12, color: isDark ? '#CCC' : '#333' }}>
            Check out the latest features in our new major release!
          </Text>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { padding: 16, borderWidth: 2, borderRadius: 0 }
});