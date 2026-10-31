import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text, spacing } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function SwitchScreen({ onBack }: { onBack: () => void }) {
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState(false);
  const [log, setLog] = useState('Nothing toggled yet');

  return (
    <Layout id="switch" title="SWITCH" onBack={onBack}>
      <Text variant="mono" testID="switch-log">{log}</Text>

      <Section title="Variants" note="Controlled, uncontrolled and with a label. On is the inverted track, so position and fill both say it.">
        <View style={[styles.stack, { gap: spacing.md }]}>
          <Switch
            testID="switch-wifi"
            checked={wifi}
            onCheckedChange={(next) => {
              setWifi(next);
              setLog(`Wi-Fi: ${next ? 'on' : 'off'}`);
            }}
            accessibilityLabel="Wi-Fi"
          />
          <Switch
            defaultChecked
            accessibilityLabel="Sync over cellular"
            onCheckedChange={(next) => setLog(`Sync over cellular: ${next ? 'on' : 'off'}`)}
          />
          <Switch
            label="Airplane mode"
            checked={airplane}
            onCheckedChange={(next) => {
              setAirplane(next);
              setLog(`Airplane mode: ${next ? 'on' : 'off'}`);
            }}
          />
        </View>
      </Section>

      <Section title="States" note="Disabled drops the shadow and dashes the border.">
        <View style={[styles.stack, { gap: spacing.md }]}>
          <Switch disabled accessibilityLabel="Bluetooth off" />
          <Switch disabled checked accessibilityLabel="Bluetooth on" />
          <Switch disabled label="Cellular data, managed by your carrier" />
        </View>
      </Section>

      <Section title="In context" note="Rows are 44pt tall and the whole row toggles.">
        <View style={[styles.stack, { gap: spacing.md }]}>
          <Switch label="Notify me about new comments" defaultChecked />
          <Switch label="Show previews on the lock screen" />
        </View>
      </Section>

      <Section title="Edge cases" note="This controlled switch ignores every change, so it stays off.">
        <View style={[styles.stack, { gap: spacing.md }]}>
          <Switch checked={false} accessibilityLabel="Ignores changes" onCheckedChange={() => setLog('Change refused by the parent')} />
          <View style={styles.narrow}>
            <Switch label="A setting name long enough to wrap beside its switch in a narrow column" defaultChecked />
          </View>
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'flex-start' },
  narrow: { width: 260 },
});
