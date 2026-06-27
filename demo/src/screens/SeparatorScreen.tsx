import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Separator from '@ui/components/separator';

export default function SeparatorScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="SEPARATOR COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>HORIZONTAL SEPARATOR</Text>
        <Text style={{ color: textColor }}>Above the line</Text>
        <Separator orientation="horizontal" style={{ marginVertical: 16 }} />
        <Text style={{ color: textColor }}>Below the line</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>VERTICAL SEPARATOR</Text>
        <View style={{ flexDirection: 'row', height: 40, alignItems: 'center' }}>
          <Text style={{ color: textColor }}>Left Side</Text>
          <Separator orientation="vertical" style={{ marginHorizontal: 16 }} />
          <Text style={{ color: textColor }}>Right Side</Text>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
