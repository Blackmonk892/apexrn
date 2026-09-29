import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Slider, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

function Readout({ label, value }: { label: string; value: string | number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.readout}>
      <Text style={[styles.readLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.readValue, { color: colors.foreground }]} testID={`readout-${label}`}>
        {value}
      </Text>
    </View>
  );
}

export default function SliderScreen({ onBack }: { onBack: () => void }) {
  const [live, setLive] = useState(50);
  const [done, setDone] = useState<number | null>(null);
  const [stepped, setStepped] = useState(25);
  const [free, setFree] = useState(0);

  return (
    <Layout title="SLIDER" onBack={onBack}>
      <Section
        title="Controlled"
        note="onValueChange fires live while dragging; onSlidingComplete fires once when the finger lifts."
      >
        <Readout label="live" value={live} />
        <Readout label="complete" value={done ?? 'none'} />
        <Slider value={live} onValueChange={setLive} onSlidingComplete={setDone} accessibilityLabel="Volume" />
        <Caption>Tap the track to jump; drag the thumb; the filled bar follows it.</Caption>
      </Section>

      <Section title="Range and step" note="min 0, max 50, step 5: the value snaps to multiples of 5.">
        <Readout label="value" value={stepped} />
        <Slider value={stepped} onValueChange={setStepped} min={0} max={50} step={5} accessibilityLabel="Quantity" />
      </Section>

      <Section title="Fractional" note="step 0.1 over 0 to 1.">
        <Readout label="value" value={free.toFixed(1)} />
        <Slider value={free} onValueChange={setFree} min={0} max={1} step={0.1} accessibilityLabel="Opacity" />
      </Section>

      <Section title="Uncontrolled" note="defaultValue keeps its own state.">
        <Slider defaultValue={70} accessibilityLabel="Brightness" />
      </Section>

      <Section title="Disabled" note="Muted track and thumb, no fill, no shadow, no gestures.">
        <Slider value={40} disabled accessibilityLabel="Locked setting" />
      </Section>

      <Section title="Edge cases" note="max equal to min collapses to a no-op instead of producing NaN.">
        <Slider value={5} min={5} max={5} accessibilityLabel="Degenerate range" />
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  readout: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  readLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  readValue: { fontSize: 20, fontWeight: '900' },
});
