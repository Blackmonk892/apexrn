import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import Skeleton from '@ui/components/skeleton';

export default function SkeletonScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  return (
    <Layout title="SKELETON COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT ANIMATION (TEXT LINES)</Text>
        <View style={{ gap: 8 }}>
          <Skeleton style={{ height: 20, width: '100%' }} />
          <Skeleton style={{ height: 20, width: '80%' }} />
          <Skeleton style={{ height: 20, width: '60%' }} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>CARD SKELETON</Text>
        <View style={[styles.cardSkeleton, { borderColor: isDark ? '#444' : '#000', backgroundColor: isDark ? '#111' : '#FFF' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Skeleton style={{ height: 48, width: 48, borderRadius: 24 }} />
            <View style={{ gap: 8, flex: 1 }}>
              <Skeleton style={{ height: 16, width: '60%' }} />
              <Skeleton style={{ height: 12, width: '40%' }} />
            </View>
          </View>
          <Skeleton style={{ height: 120, width: '100%' }} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>PAUSED SKELETON (REDUCED MOTION)</Text>
        <Skeleton paused style={{ height: 40, width: '100%' }} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  cardSkeleton: { padding: 16, borderWidth: 2, borderRadius: 0 }
});
