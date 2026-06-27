import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Textarea from '@ui/components/textarea';

export default function TextareaScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="TEXTAREA COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT TEXTAREA</Text>
        <Textarea placeholder="Write a description here..." />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>CUSTOM HEIGHT</Text>
        <Textarea placeholder="This one is much taller..." style={{ height: 200 }} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED TEXTAREA</Text>
        <Textarea placeholder="Cannot type here" disabled />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
