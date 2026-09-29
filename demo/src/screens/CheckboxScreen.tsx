import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Checkbox, useTheme } from '@apexrn/ui';
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

export default function CheckboxScreen({ onBack }: { onBack: () => void }) {
  const [terms, setTerms] = useState(false);
  const [news, setNews] = useState(true);
  const [events, setEvents] = useState('none');

  return (
    <Layout title="CHECKBOX" onBack={onBack}>
      <Section title="Controlled" note="checked + onCheckedChange.">
        <Row label="Accept terms and conditions">
          <Checkbox checked={terms} onCheckedChange={setTerms} accessibilityLabel="Accept terms and conditions" />
        </Row>
        <Row label="Subscribe to the newsletter">
          <Checkbox checked={news} onCheckedChange={setNews} accessibilityLabel="Subscribe to the newsletter" />
        </Row>
        <Caption>{`terms: ${terms}, newsletter: ${news}`}</Caption>
      </Section>

      <Section title="Uncontrolled" note="defaultChecked keeps its own state; onCheckedChange is optional.">
        <Row label="Starts unchecked">
          <Checkbox accessibilityLabel="Starts unchecked" onCheckedChange={(c) => setEvents(`unchecked-start -> ${c}`)} />
        </Row>
        <Row label="Starts checked">
          <Checkbox defaultChecked accessibilityLabel="Starts checked" onCheckedChange={(c) => setEvents(`checked-start -> ${c}`)} />
        </Row>
        <Caption>{`Last change: ${events}`}</Caption>
      </Section>

      <Section title="Disabled" note="Muted fill and border, no shadow, not pressable.">
        <Row label="Unavailable option" muted>
          <Checkbox checked={false} disabled accessibilityLabel="Unavailable option" />
        </Row>
        <Row label="Required option" muted>
          <Checkbox checked disabled accessibilityLabel="Required option" />
        </Row>
      </Section>

      <Section title="Hit area" note="The box is 24pt; the touch target extends to 44pt on iOS and 48dp on Android.">
        <Row label="Tap beside the box">
          <Checkbox defaultChecked accessibilityLabel="Tap beside the box" />
        </Row>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Row label="A label long enough that it wraps beside its checkbox in a narrow column">
            <Checkbox accessibilityLabel="Long label option" />
          </Row>
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  rowText: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  narrow: { width: 240 },
});
