import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Button from '@ui/components/button'; // Adjusted path alias matching root structures

export default function ButtonScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="BUTTON COMPONENT" onBack={onBack}>
      <Text style={[styles.label, { color: textColor }]}>VARIANTS</Text>
      <View style={styles.row}>
        <Button title="Default" onPress={() => {}} />
        <Button title="Primary" variant="primary" onPress={() => {}} />
        <Button title="Outline" variant="outline" onPress={() => {}} />
      </View>

      <Text style={[styles.label, { color: textColor }]}>SIZES</Text>
      <View style={styles.row}>
        <Button title="Small" size="sm" variant="primary" onPress={() => {}} />
        <Button title="Medium" size="md" variant="primary" onPress={() => {}} />
        <Button title="Large" size="lg" variant="primary" onPress={() => {}} />
      </View>

      <Text style={[styles.label, { color: textColor }]}>STATES</Text>
      <View style={styles.row}>
        <Button title="Disabled" disabled onPress={() => {}} />
        <Button title="Loading" loading variant="primary" onPress={() => {}} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginTop: 24, marginBottom: 12, letterSpacing: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});