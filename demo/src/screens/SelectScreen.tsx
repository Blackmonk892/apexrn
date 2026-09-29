import React, { useState } from 'react';
import { View } from 'react-native';
import { Label, Select, SelectContent, SelectItem, SelectTrigger } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function SelectScreen({ onBack }: { onBack: () => void }) {
  const [framework, setFramework] = useState('');
  const [picked, setPicked] = useState('none');

  return (
    <Layout title="SELECT" onBack={onBack}>
      <Section title="Controlled" note="value + onValueChange. The trigger shows the item's label, not its value.">
        <View>
          <Label>Framework</Label>
          <Select value={framework} onValueChange={setFramework}>
            <SelectTrigger placeholder="Choose a framework" />
            <SelectContent>
              <SelectItem label="React Native" value="rn" />
              <SelectItem label="Flutter" value="flutter" />
              <SelectItem label="SwiftUI" value="swiftui" />
              <SelectItem label="Jetpack Compose" value="compose" />
            </SelectContent>
          </Select>
        </View>
        <Caption>{`Value: ${framework || 'none'}`}</Caption>
      </Section>

      <Section title="Uncontrolled, preselected" note="defaultValue is shown by label before the sheet has ever opened.">
        <Select defaultValue="ts" onValueChange={setPicked}>
          <SelectTrigger placeholder="Favourite language" />
          <SelectContent sheetHeight={400}>
            <SelectItem label="JavaScript" value="js" />
            <SelectItem label="TypeScript" value="ts" />
            <SelectItem label="Python" value="py" />
            <SelectItem label="Rust" value="rs" />
          </SelectContent>
        </Select>
        <Caption>{`Last change: ${picked}`}</Caption>
      </Section>

      <Section title="Long list" note="The list scrolls inside the sheet; dragging it does not dismiss the sheet. Only the handle does.">
        <Select>
          <SelectTrigger placeholder="Country" />
          <SelectContent sheetHeight={450}>
            {['Argentina', 'Brazil', 'Canada', 'Denmark', 'Egypt', 'France', 'Germany', 'Hungary', 'India', 'Japan', 'Kenya', 'Latvia', 'Mexico', 'Norway'].map((c) => (
              <SelectItem key={c} label={c} value={c.toLowerCase()} />
            ))}
          </SelectContent>
        </Select>
      </Section>

      <Section title="Edge cases">
        <Select defaultValue="long">
          <SelectTrigger placeholder="Plan" />
          <SelectContent>
            <SelectItem label="An option label that is long enough to overflow the trigger on a small screen" value="long" />
            <SelectItem label="Short" value="short" />
          </SelectContent>
        </Select>
        <Caption>Long labels truncate in the trigger.</Caption>
      </Section>
    </Layout>
  );
}
