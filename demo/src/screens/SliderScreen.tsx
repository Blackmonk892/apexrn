import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Slider, Text, spacing } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function SliderScreen({ onBack }: { onBack: () => void }) {
  const [volume, setVolume] = useState(50);
  const [stepped, setStepped] = useState(25);
  const [opacity, setOpacity] = useState(0);
  const [log, setLog] = useState('Nothing moved yet');

  return (
    <Layout id="slider" title="SLIDER" onBack={onBack}>
      <Text variant="mono" testID="slider-log">{log}</Text>

      <Section title="Variants" note="Controlled, stepped, fractional and uncontrolled. The filled rule ends at the thumb.">
        <View style={[styles.stack, { gap: spacing.lg }]}>
          <Slider
            testID="slider-volume"
            value={volume}
            onValueChange={setVolume}
            onSlidingComplete={(next) => setLog(`Volume: ${next}`)}
            showValue
            accessibilityLabel="Volume"
          />
          <Slider
            value={stepped}
            onValueChange={setStepped}
            onSlidingComplete={(next) => setLog(`Quantity: ${next}`)}
            min={0}
            max={50}
            step={5}
            showValue
            accessibilityLabel="Quantity"
          />
          <Slider
            value={opacity}
            onValueChange={setOpacity}
            min={0}
            max={1}
            step={0.1}
            showValue
            formatValue={(v) => v.toFixed(1)}
            accessibilityLabel="Opacity"
          />
          <Slider defaultValue={70} showValue formatValue={(v) => `${v}%`} accessibilityLabel="Brightness" />
        </View>
      </Section>

      <Section title="States" note="Disabled drops the shadow, mutes the rule and ignores gestures.">
        <Slider value={40} disabled showValue accessibilityLabel="Locked setting" />
      </Section>

      <Section title="Edge cases" note="max equal to min collapses to a no-op instead of producing NaN.">
        <Slider value={5} min={5} max={5} showValue accessibilityLabel="Degenerate range" />
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stack: { alignSelf: 'stretch' },
});
