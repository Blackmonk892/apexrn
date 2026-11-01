import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const COUNTRIES = [
  'Argentina', 'Brazil', 'Canada', 'Denmark', 'Egypt', 'France', 'Germany', 'Hungary',
  'India', 'Japan', 'Kenya', 'Latvia', 'Mexico', 'Norway',
];

export default function SelectScreen({ onBack }: { onBack: () => void }) {
  const [framework, setFramework] = useState('');
  const [country, setCountry] = useState('');
  const [log, setLog] = useState('none');

  return (
    <Layout id="select" title="SELECT" onBack={onBack}>
      <Section title="Controlled" note="value + onValueChange. The trigger shows the option label, not its value.">
        <Select
          value={framework}
          onValueChange={(next) => {
            setFramework(next);
            setLog(`framework ${next}`);
          }}
        >
          <SelectTrigger testID="select-framework" label="Framework" placeholder="Choose a framework" />
          <SelectContent title="Framework">
            <SelectItem label="React Native" value="rn" />
            <SelectItem label="Flutter" value="flutter" />
            <SelectItem label="SwiftUI" value="swiftui" />
            <SelectItem label="Jetpack Compose" value="compose" />
          </SelectContent>
        </Select>
        <Caption>{`Last change: ${log}`}</Caption>
      </Section>

      <Section title="Uncontrolled, preselected" note="defaultValue is shown by label before the sheet has ever opened.">
        <Select defaultValue="ts" onValueChange={(next) => setLog(`language ${next}`)}>
          <SelectTrigger label="Language" description="Used for new projects." />
          <SelectContent title="Language">
            <SelectItem label="JavaScript" value="js" />
            <SelectItem label="TypeScript" value="ts" />
            <SelectItem label="Python" value="py" />
            <SelectItem label="Rust" value="rs" disabled />
          </SelectContent>
        </Select>
      </Section>

      <Section title="Searchable" note="Ten or more options add a filter field. Matching ignores case.">
        <Select
          value={country}
          onValueChange={(next) => {
            setCountry(next);
            setLog(`country ${next}`);
          }}
        >
          <SelectTrigger testID="select-country" label="Country" placeholder="Choose a country" />
          <SelectContent title="Country" sheetHeight={520}>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} label={c} value={c.toLowerCase()} />
            ))}
          </SelectContent>
        </Select>
      </Section>

      <Section title="States">
        <Select value="">
          <SelectTrigger
            label="Billing plan"
            placeholder="Choose a plan"
            required
            invalid
            errorMessage="Choose a plan to continue."
          />
          <SelectContent title="Billing plan">
            <SelectItem label="Monthly" value="monthly" />
            <SelectItem label="Yearly" value="yearly" />
          </SelectContent>
        </Select>
        <Select defaultValue="team">
          <SelectTrigger label="Workspace" disabled />
          <SelectContent title="Workspace">
            <SelectItem label="Team" value="team" />
            <SelectItem label="Personal" value="personal" />
          </SelectContent>
        </Select>
      </Section>

      <Section title="Edge cases">
        <Select defaultValue="long">
          <SelectTrigger label="Plan" />
          <SelectContent title="Plan">
            <SelectItem label="An option label that is long enough to overflow the trigger on a small screen" value="long" />
            <SelectItem label="Short" value="short" />
          </SelectContent>
        </Select>
        <Caption>Long labels truncate in the trigger and in the row.</Caption>
      </Section>
    </Layout>
  );
}
