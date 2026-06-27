import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Progress from '@ui/components/progress';

export default function ProgressScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="PROGRESS COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT (0%)</Text>
        <Progress value={0} max={100} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT (50%)</Text>
        <Progress value={50} max={100} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT (100%)</Text>
        <Progress value={100} max={100} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>WITH HARD SHADOW (75%)</Text>
        <Progress value={75} max={100} withShadow />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
