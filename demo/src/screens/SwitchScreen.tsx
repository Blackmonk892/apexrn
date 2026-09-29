import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Switch, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

function Row({ label, muted, children }: { label: string; muted?: boolean; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {children}
      <Text style={[styles.rowText, { color: muted ? colors.mutedForeground : colors.foreground }]}>{label}</Text>
    </View>
  );
}

export default function SwitchScreen({ onBack }: { onBack: () => void }) {
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [last, setLast] = useState('none');

  return (
    <Layout title="SWITCH" onBack={onBack}>
      <Section title="Controlled" note="checked + onCheckedChange. Position tells on from off, not just colour.">
        <Row label="Airplane mode">
          <Switch checked={airplane} onCheckedChange={setAirplane} accessibilityLabel="Airplane mode" />
        </Row>
        <Row label="Wi-Fi">
          <Switch checked={wifi} onCheckedChange={setWifi} accessibilityLabel="Wi-Fi" />
        </Row>
        <Caption>{`airplane: ${airplane}, wifi: ${wifi}`}</Caption>
      </Section>

      <Section title="Uncontrolled" note="defaultChecked keeps its own state.">
        <Row label="Starts off">
          <Switch accessibilityLabel="Starts off" onCheckedChange={(c) => setLast(`off-start -> ${c}`)} />
        </Row>
        <Row label="Starts on">
          <Switch defaultChecked accessibilityLabel="Starts on" onCheckedChange={(c) => setLast(`on-start -> ${c}`)} />
        </Row>
        <Caption>{`Last change: ${last}`}</Caption>
      </Section>

      <Section title="Disabled" note="Muted track and border, no thumb shadow, not pressable.">
        <Row label="Bluetooth (off)" muted>
          <Switch checked={false} disabled accessibilityLabel="Bluetooth" />
        </Row>
        <Row label="Cellular data (on)" muted>
          <Switch checked disabled accessibilityLabel="Cellular data" />
        </Row>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Row label="A setting name long enough to wrap next to its switch in a narrow column">
            <Switch defaultChecked accessibilityLabel="Long setting" />
          </Row>
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  rowText: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  narrow: { width: 260 },
});
