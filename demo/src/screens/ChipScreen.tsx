import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, SearchIcon } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const TAGS = ['Design', 'Code', 'Motion', 'Research'];

export default function ChipScreen({ onBack }: { onBack: () => void }) {
  const [picked, setPicked] = useState<string[]>(['Code']);
  const [people, setPeople] = useState(['ada@x.dev', 'grace@x.dev', 'a-very-long-address-that-must-truncate@example.com']);
  const [taps, setTaps] = useState(0);

  return (
    <Layout title="CHIP" onBack={onBack}>
      <Section title="Filter chips (toggle)" note="Selected is an inverted block plus a check mark, so state does not rely on colour. Controlled here.">
        <View style={styles.wrap}>
          {TAGS.map((t) => (
            <Chip
              key={t}
              label={t}
              selected={picked.includes(t)}
              onSelectedChange={(on) => setPicked((p) => (on ? [...p, t] : p.filter((x) => x !== t)))}
            />
          ))}
        </View>
        <Caption>{`Selected: ${picked.join(', ') || 'none'}`}</Caption>
      </Section>

      <Section title="Uncontrolled + icon" note="defaultSelected keeps its own state.">
        <View style={styles.wrap}>
          <Chip label="Nearby" defaultSelected icon={(c) => <SearchIcon size={14} color={c} />} />
          <Chip label="Open now" defaultSelected={false} />
        </View>
      </Section>

      <Section title="Action chip" note="No selected props: a plain button.">
        <View style={styles.wrap}>
          <Chip label="Suggest" onPress={() => setTaps((n) => n + 1)} />
        </View>
        <Caption>{`Pressed ${taps} times`}</Caption>
      </Section>

      <Section title="Removable" note="Remove is its own touch target and screen-reader control. The long address truncates.">
        <View style={styles.wrap}>
          {people.map((p) => (
            <Chip key={p} label={p} onRemove={() => setPeople((l) => l.filter((x) => x !== p))} />
          ))}
        </View>
        <Caption>{people.length ? `${people.length} recipients` : 'All removed'}</Caption>
      </Section>

      <Section title="Disabled">
        <View style={styles.wrap}>
          <Chip label="Disabled" disabled defaultSelected={false} />
          <Chip label="Locked on" disabled selected onSelectedChange={() => {}} />
          <Chip label="Fixed" disabled onRemove={() => {}} />
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({ wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } });
