import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Slider from '@ui/components/slider';

export default function SliderScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [value1, setValue1] = useState(50);
  const [value2, setValue2] = useState(25);

  return (
    <Layout title="SLIDER COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={[styles.label, { color: textColor }]}>DEFAULT (0-100)</Text>
          <Text style={[styles.valueText, { color: textColor }]}>{Math.round(value1)}</Text>
        </View>
        <Slider value={value1} onValueChange={setValue1} min={0} max={100} />
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={[styles.label, { color: textColor }]}>CUSTOM RANGE (0-50), STEP=5</Text>
          <Text style={[styles.valueText, { color: textColor }]}>{Math.round(value2)}</Text>
        </View>
        <Slider value={value2} onValueChange={setValue2} min={0} max={50} step={5} />
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={[styles.label, { color: textColor }]}>DISABLED STATE</Text>
          <Text style={[styles.valueText, { color: isDark ? '#666' : '#999' }]}>30</Text>
        </View>
        <Slider value={30} onValueChange={() => {}} min={0} max={100} disabled />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  valueText: { fontSize: 16, fontWeight: '900' }
});
