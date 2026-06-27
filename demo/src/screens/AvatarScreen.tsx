import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Avatar from '@ui/components/avatar';

export default function AvatarScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="AVATAR COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>SIZES (sm, md, lg)</Text>
        <View style={styles.row}>
          <Avatar size="sm" initials="AB" />
          <Avatar size="md" initials="CD" />
          <Avatar size="lg" initials="EF" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>WITH IMAGES</Text>
        <View style={styles.row}>
          <Avatar 
            size="sm" 
            src="https://i.pravatar.cc/100?img=1" 
          />
          <Avatar 
            size="md" 
            src="https://i.pravatar.cc/150?img=2" 
          />
          <Avatar 
            size="lg" 
            src="https://i.pravatar.cc/200?img=3" 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>HARD SHADOW</Text>
        <View style={styles.row}>
          <Avatar size="md" initials="SH" withShadow />
          <Avatar 
            size="lg" 
            src="https://i.pravatar.cc/200?img=4" 
            withShadow 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>FALLBACK (BROKEN IMAGE)</Text>
        <View style={styles.row}>
          <Avatar size="md" src="https://broken.link/img.jpg" initials="FL" />
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 24 },
});
