import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BrutalSurface, Skeleton } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function SkeletonScreen({ onBack }: { onBack: () => void }) {
  return (
    <Layout title="SKELETON" onBack={onBack}>
      <Section title="Text lines" note="Sweeps a highlight across the block. Sized entirely through style.">
        <View style={styles.stack}>
          <Skeleton style={styles.line} />
          <Skeleton style={[styles.line, styles.w80]} />
          <Skeleton style={[styles.line, styles.w60]} />
        </View>
      </Section>

      <Section title="Card placeholder">
        <BrutalSurface pressable={false} surfaceStyle={styles.card}>
          <View style={styles.head}>
            <Skeleton style={styles.avatar} />
            <View style={styles.headText}>
              <Skeleton style={[styles.line, styles.w60]} />
              <Skeleton style={[styles.small, styles.w40]} />
            </View>
          </View>
          <Skeleton style={styles.media} />
        </BrutalSurface>
      </Section>

      <Section title="Paused" note="paused stops the sweep; use it when motion is unwanted.">
        <Skeleton paused style={styles.media} />
        <Caption>Also static when the OS reduce-motion setting is on.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 8 },
  line: { height: 20 },
  small: { height: 14 },
  w80: { width: '80%' },
  w60: { width: '60%' },
  w40: { width: '40%' },
  card: { padding: 16, gap: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headText: { flex: 1, gap: 8 },
  avatar: { width: 48, height: 48 },
  media: { height: 120 },
});
