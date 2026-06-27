import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@ui/components/select';

export default function SelectScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [framework, setFramework] = useState('');
  const [language, setLanguage] = useState('');

  return (
    <Layout title="SELECT COMPONENT" onBack={onBack}>
      <View style={[styles.section, { zIndex: 10 }]}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT SELECT</Text>
        <Select value={framework} onValueChange={setFramework}>
          <SelectTrigger placeholder="Choose a framework" />
          <SelectContent>
            <SelectItem label="React Native" value="rn" />
            <SelectItem label="Flutter" value="flutter" />
            <SelectItem label="SwiftUI" value="swiftui" />
            <SelectItem label="Jetpack Compose" value="compose" />
          </SelectContent>
        </Select>
        <Text style={{ color: textColor, marginTop: 8 }}>Selected: {framework || 'None'}</Text>
      </View>

      <View style={[styles.section, { zIndex: 5 }]}>
        <Text style={[styles.label, { color: textColor }]}>TALLER LIST WITH SCROLL</Text>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger placeholder="Favorite Language" />
          <SelectContent sheetHeight={450}>
            <SelectItem label="JavaScript" value="js" />
            <SelectItem label="TypeScript" value="ts" />
            <SelectItem label="Python" value="py" />
            <SelectItem label="Rust" value="rs" />
            <SelectItem label="Go" value="go" />
            <SelectItem label="C++" value="cpp" />
            <SelectItem label="Java" value="java" />
            <SelectItem label="Kotlin" value="kt" />
          </SelectContent>
        </Select>
        <Text style={{ color: textColor, marginTop: 8 }}>Selected: {language || 'None'}</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
});
