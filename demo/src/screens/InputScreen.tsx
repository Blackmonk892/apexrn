import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Input from '@ui/components/input';

export default function InputScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const CustomIcon = () => (
    <Text style={{ fontSize: 16, color: isDark ? '#AAA' : '#555' }}>@</Text>
  );

  return (
    <Layout title="INPUT COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT</Text>
        <Input placeholder="Enter your text..." />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>WITH LEADING ICON</Text>
        <Input 
          placeholder="Username" 
          leadingIcon={<CustomIcon />}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>WITH TRAILING ICON</Text>
        <Input 
          placeholder="Search..." 
          trailingIcon={<Text style={{ fontSize: 16 }}>🔍</Text>}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DISABLED STATE</Text>
        <Input 
          placeholder="Cannot edit this" 
          disabled
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>CUSTOM STYLE (ERROR)</Text>
        <Input 
          placeholder="Error state" 
          inputStyle={{ color: '#FF5252' }}
          style={{ borderColor: '#FF5252' }}
        />
        <Text style={styles.errorText}>This field is required.</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 1 },
  errorText: { color: '#FF5252', fontSize: 12, marginTop: 4, fontWeight: '600' }
});
