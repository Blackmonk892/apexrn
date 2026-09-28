import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Switch from '@ui/components/switch';

export default function SwitchScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);

  return (
    <Layout title="SWITCH COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT (OFF)</Text>
        <View style={styles.row}>
          <Switch checked={switch1} onCheckedChange={setSwitch1} accessibilityLabel="Airplane Mode" />
          <Text style={[styles.rowText, { color: textColor }]}>Airplane Mode</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT (ON)</Text>
        <View style={styles.row}>
          <Switch checked={switch2} onCheckedChange={setSwitch2} accessibilityLabel="Wi-Fi" />
          <Text style={[styles.rowText, { color: textColor }]}>Wi-Fi</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED (OFF)</Text>
        <View style={styles.row}>
          <Switch checked={false} onCheckedChange={() => {}} disabled accessibilityLabel="Bluetooth" />
          <Text style={[styles.rowText, { color: isDark ? '#666' : '#999' }]}>Bluetooth</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED (ON)</Text>
        <View style={styles.row}>
          <Switch checked={true} onCheckedChange={() => {}} disabled accessibilityLabel="Cellular Data" />
          <Text style={[styles.rowText, { color: isDark ? '#666' : '#999' }]}>Cellular Data</Text>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rowText: { fontSize: 16, fontWeight: '600' }
});
