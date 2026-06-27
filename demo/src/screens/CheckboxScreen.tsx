import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Checkbox from '@ui/components/checkbox';

export default function CheckboxScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);

  return (
    <Layout title="CHECKBOX COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT (UNCHECKED)</Text>
        <View style={styles.row}>
          <Checkbox checked={checked1} onCheckedChange={setChecked1} />
          <Text style={[styles.rowText, { color: textColor }]}>Accept terms and conditions</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT (CHECKED)</Text>
        <View style={styles.row}>
          <Checkbox checked={checked2} onCheckedChange={setChecked2} />
          <Text style={[styles.rowText, { color: textColor }]}>Subscribe to newsletter</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED (UNCHECKED)</Text>
        <View style={styles.row}>
          <Checkbox checked={false} onCheckedChange={() => {}} disabled />
          <Text style={[styles.rowText, { color: isDark ? '#666' : '#999' }]}>Unavailable option</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED (CHECKED)</Text>
        <View style={styles.row}>
          <Checkbox checked={true} onCheckedChange={() => {}} disabled />
          <Text style={[styles.rowText, { color: isDark ? '#666' : '#999' }]}>Mandatory option</Text>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 16, fontWeight: '600' }
});
