import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import FAB from '@ui/components/floating_action_button';

export default function FABScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="FAB COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>FLOATING ACTION BUTTON (IN CORNER)</Text>
        <Text style={{ color: textColor }}>
          The FAB is positioned absolutely in the bottom-right corner of the layout, sitting above the content.
        </Text>
        <FAB label="+" onPress={() => alert('FAB Pressed')} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { flex: 1, marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
