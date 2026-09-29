import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Separator, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function SeparatorScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const text = { color: colors.foreground, fontWeight: '700' as const };

  return (
    <Layout title="SEPARATOR" onBack={onBack}>
      <Section title="Horizontal">
        <Text style={text}>Above the line</Text>
        <Separator />
        <Text style={text}>Below the line</Text>
      </Section>

      <Section title="Vertical" note="Stretches to the height of its row.">
        <View style={styles.row}>
          <Text style={text}>Left</Text>
          <Separator orientation="vertical" />
          <Text style={text}>Middle</Text>
          <Separator orientation="vertical" />
          <Text style={text}>Right</Text>
        </View>
      </Section>

      <Section title="In a list" note="Horizontal separators between rows.">
        {['Profile', 'Notifications', 'Privacy and security'].map((item, i) => (
          <View key={item}>
            {i > 0 ? <Separator /> : null}
            <Text style={[text, styles.item]}>{item}</Text>
          </View>
        ))}
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, height: 40 },
  item: { paddingVertical: 12 },
});
