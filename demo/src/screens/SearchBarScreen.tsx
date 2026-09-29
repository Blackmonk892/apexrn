import React, { useState } from 'react';
import { SearchBar } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function SearchBarScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('none');
  const [cancelled, setCancelled] = useState(0);

  return (
    <Layout title="SEARCH BAR" onBack={onBack}>
      <Section title="Controlled" note="Clear appears once there is text and keeps the keyboard up. The search key submits and dismisses.">
        <SearchBar value={query} onValueChange={setQuery} onSubmit={setSubmitted} placeholder="Search components" />
        <Caption>{`Query: "${query}". Submitted: ${submitted}`}</Caption>
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
        <SearchBar error defaultValue="No results for this" />
      </Section>
    </Layout>
  );
}
