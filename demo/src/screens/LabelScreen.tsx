import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Label from '@ui/components/label';

export default function LabelScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="LABEL COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.headerLabel, { color: textColor }]}>DEFAULT LABEL</Text>
        <Label>Email Address</Label>
        <Text style={{ color: textColor, marginTop: 4 }}>Used to denote form fields.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.headerLabel, { color: textColor }]}>DISABLED LABEL</Text>
        <Label disabled>Username</Label>
        <Text style={{ color: textColor, marginTop: 4 }}>Used when the associated field is disabled.</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  headerLabel: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
