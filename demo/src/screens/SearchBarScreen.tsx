import React, { useState } from 'react';
import { SearchBar } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const RECENT = ['brutalist button', 'bottom sheet', 'date picker'];

export default function SearchBarScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [log, setLog] = useState('none');
  const [cancelled, setCancelled] = useState(0);

  return (
    <Layout id="searchbar" title="SEARCH BAR" onBack={onBack}>
      <Section title="Controlled" note="Clear appears once there is text and keeps the keyboard up. The search key submits and dismisses.">
        <SearchBar
          testID="searchbar-field"
          value={query}
          onValueChange={setQuery}
          onSubmit={(q) => setLog(`Search: ${q}`)}
          placeholder="Search components"
        />
        <Caption>{`Query: "${query}"`}</Caption>
        <Caption>{log}</Caption>
      </Section>

      <Section title="Recent" note="Focus the empty field to list recent searches. Pressing one fills the field.">
        <SearchBar recent={RECENT} onRecentPress={(q) => setLog(`Recent: ${q}`)} placeholder="Search docs" />
      </Section>

      <Section title="With cancel" note="CANCEL shows only while focused; it clears, blurs, then calls onCancel.">
        <SearchBar onCancel={() => setCancelled((n) => n + 1)} placeholder="Search people" />
        <Caption>{`Cancelled ${cancelled} times`}</Caption>
      </Section>

      <Section title="Uncontrolled with default" note="defaultValue seeds its own state.">
        <SearchBar defaultValue="brutalism" />
      </Section>

      <Section title="States">
        <SearchBar disabled defaultValue="Disabled" />
        <SearchBar invalid defaultValue="No results for this" />
      </Section>
    </Layout>
  );
}
