import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const SIZES = ['sm', 'md', 'lg'] as const;

export default function AvatarScreen({ onBack }: { onBack: () => void }) {
  return (
    <Layout title="AVATAR" onBack={onBack}>
      <Section title="Sizes" note="40 / 56 / 80. Square block; the initials fallback is the default.">
        <View style={styles.row}>
          {SIZES.map((size, i) => (
            <Avatar key={size} size={size} initials={['AB', 'CD', 'EF'][i]} />
          ))}
        </View>
      </Section>

      <Section title="Image">
        <View style={styles.row}>
          {SIZES.map((size, i) => (
            <Avatar key={size} size={size} src={`https://i.pravatar.cc/200?img=${i + 1}`} />
          ))}
        </View>
        <Caption>Remote images; without a network they show the initials fallback.</Caption>
      </Section>

      <Section title="Hard shadow" note="withShadow: small avatars use the subtle 2px offset, others 4px.">
        <View style={styles.row}>
          {SIZES.map((size, i) => (
            <Avatar key={size} size={size} initials={['SH', 'AD', 'OW'][i]} withShadow />
          ))}
        </View>
      </Section>

      <Section title="Fallbacks">
        <View style={styles.row}>
          <Avatar src="https://invalid.example/missing.jpg" initials="FL" />
          <Avatar />
          <Avatar initials="xyz" />
        </View>
        <Caption>Broken image, no initials (shows ?), and long initials (first two letters, uppercased).</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 24, paddingBottom: 4 },
});
