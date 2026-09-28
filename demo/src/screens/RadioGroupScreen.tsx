import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import { RadioGroup, RadioGroupItem } from '@ui/components/radiogroup';

export default function RadioGroupScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [flavor, setFlavor] = useState('vanilla');
  const [size, setSize] = useState('md');

  return (
    <Layout title="RADIO GROUP COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>VERTICAL LIST (DEFAULT)</Text>
        <RadioGroup value={flavor} onValueChange={setFlavor}>
          <View style={styles.row}>
            <RadioGroupItem value="vanilla" accessibilityLabel="Vanilla" />
            <Text style={[styles.rowText, { color: textColor }]}>Vanilla</Text>
          </View>
          <View style={styles.row}>
            <RadioGroupItem value="chocolate" accessibilityLabel="Chocolate" />
            <Text style={[styles.rowText, { color: textColor }]}>Chocolate</Text>
          </View>
          <View style={styles.row}>
            <RadioGroupItem value="strawberry" accessibilityLabel="Strawberry" />
            <Text style={[styles.rowText, { color: textColor }]}>Strawberry</Text>
          </View>
        </RadioGroup>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>HORIZONTAL LAYOUT</Text>
        <RadioGroup value={size} onValueChange={setSize} style={{ flexDirection: 'row', gap: 24 }}>
          <View style={styles.row}>
            <RadioGroupItem value="sm" accessibilityLabel="Small" />
            <Text style={[styles.rowText, { color: textColor }]}>Small</Text>
          </View>
          <View style={styles.row}>
            <RadioGroupItem value="md" accessibilityLabel="Medium" />
            <Text style={[styles.rowText, { color: textColor }]}>Medium</Text>
          </View>
          <View style={styles.row}>
            <RadioGroupItem value="lg" accessibilityLabel="Large" />
            <Text style={[styles.rowText, { color: textColor }]}>Large</Text>
          </View>
        </RadioGroup>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED STATE</Text>
        <RadioGroup value="option1" disabled>
          <View style={styles.row}>
            <RadioGroupItem value="option1" accessibilityLabel="Selected Disabled" />
            <Text style={[styles.rowText, { color: isDark ? '#666' : '#999' }]}>Selected Disabled</Text>
          </View>
          <View style={styles.row}>
            <RadioGroupItem value="option2" accessibilityLabel="Unselected Disabled" />
            <Text style={[styles.rowText, { color: isDark ? '#666' : '#999' }]}>Unselected Disabled</Text>
          </View>
        </RadioGroup>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 16, fontWeight: '600' }
});
