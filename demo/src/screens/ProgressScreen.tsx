import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Progress, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function ProgressScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [value, setValue] = useState(25);
  const [log, setLog] = useState('Value: 25');

  const advance = () => {
    const next = Math.min(100, value + 25);
    setValue(next);
    setLog(`Value: ${next}`);
  };

  return (
    <Layout id="progress" title="PROGRESS" onBack={onBack}>
      <Section title="Variants" note="Determinate fills from the left. Without a value the bar steps through three blocks.">
        <Progress value={60} label="Uploading photos" />
        <Progress value={3} max={5} label="Step 3 of 5" />
        <Progress label="Syncing" />
      </Section>

      <Section title="States" note="Values outside 0 to max are clamped.">
        <View style={styles.item}>
          <Caption>0%</Caption>
          <Progress value={0} />
        </View>
        <View style={styles.item}>
          <Caption>100%</Caption>
          <Progress value={100} />
        </View>
        <View style={styles.item}>
          <Caption>value 150, clamped to 100%</Caption>
          <Progress value={150} />
        </View>
        <View style={styles.item}>
          <Caption>value -20, clamped to 0%</Caption>
          <Progress value={-20} />
        </View>
      </Section>

      <Section title="Interactive">
        <Progress value={value} label="Export" testID="progress-live" />
        <View style={styles.row}>
          <Button title="Advance 25" testID="progress-advance" onPress={advance} />
          <Button
            title="Reset"
            variant="outline"
            onPress={() => {
              setValue(0);
              setLog('Value: 0');
            }}
          />
        </View>
        <Text style={{ color: colors.foreground }}>{log}</Text>
      </Section>

      <Section title="In context">
        <Card>
          <View style={styles.card}>
            <Text style={[styles.title, { color: colors.foreground }]}>Backup in progress</Text>
            <Progress value={42} label="2.1 of 5.0 GB" />
          </View>
        </Card>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Progress value={64} label="A very long label that has to truncate before it reaches the percentage" />
        </View>
        <Progress value={NaN} label="Not a number falls back to 0%" />
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  item: { gap: 6 },
  row: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  card: { gap: 12 },
  title: { fontWeight: '900', fontSize: 16 },
  narrow: { width: 280 },
});
