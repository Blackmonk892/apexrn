import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Progress, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function ProgressScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [value, setValue] = useState(40);

  return (
    <Layout title="PROGRESS" onBack={onBack}>
      <Section title="Values" note="Track fills from the left; 0, 50 and 100.">
        {[0, 50, 100].map((v) => (
          <View key={v} style={styles.item}>
            <Caption>{`${v}%`}</Caption>
            <Progress value={v} />
          </View>
        ))}
      </Section>

      <Section title="Hard shadow">
        <Progress value={75} withShadow />
      </Section>

      <Section title="Custom max" note="value 3 of max 5 fills 60%.">
        <Progress value={3} max={5} />
      </Section>

      <Section title="Interactive">
        <Progress value={value} withShadow />
        <Text style={[styles.readout, { color: colors.foreground }]}>{`${value}%`}</Text>
        <View style={styles.row}>
          <Button title="-20" size="sm" onPress={() => setValue((v) => Math.max(0, v - 20))} />
          <Button title="+20" size="sm" variant="primary" onPress={() => setValue((v) => Math.min(100, v + 20))} />
          <Button title="Reset" size="sm" variant="outline" onPress={() => setValue(0)} />
        </View>
      </Section>

      <Section title="Edge cases" note="Out-of-range and non-finite values are clamped.">
        <View style={styles.item}>
          <Caption>value 150 (clamped to 100%)</Caption>
          <Progress value={150} />
        </View>
        <View style={styles.item}>
          <Caption>value -20 (clamped to 0%)</Caption>
          <Progress value={-20} />
        </View>
        <View style={styles.item}>
          <Caption>value NaN (0%)</Caption>
          <Progress value={NaN} />
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  item: { gap: 6 },
  row: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  readout: { fontSize: 16, fontWeight: '900' },
});
