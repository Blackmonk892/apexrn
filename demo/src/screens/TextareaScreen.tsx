import React, { useState } from 'react';
import { Text, Textarea } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const LIMIT = 80;

export default function TextareaScreen({ onBack }: { onBack: () => void }) {
  const [value, setValue] = useState('');
  const [bio, setBio] = useState('A line that is a little too long for the limit, so the field flags it.');
  const over = bio.length > LIMIT;

  return (
    <Layout id="textarea" title="TEXTAREA" onBack={onBack}>
      <Text>Always multiline, text starts at the top. Rows set the height, never the width.</Text>

      <Section title="Variants" note="Label, description and an error row are optional parts of one field.">
        <Textarea testID="textarea-bio" label="Message" placeholder="Write a message" onValueChange={setValue} />
        <Caption>{`Value: ${value}`}</Caption>
        <Textarea
          label="Notes"
          required
          description="Visible to your team only."
          placeholder="Anything we should know"
        />
      </Section>

      <Section title="Rows" note="Starts at minRows, grows with the text, then scrolls at maxRows.">
        <Textarea label="Two to four rows" minRows={2} maxRows={4} placeholder="Keep typing, then press return" />
        <Textarea label="Five rows tall" minRows={5} placeholder="Fixed minimum, free growth" />
      </Section>

      <Section title="Counter" note="A mono count appears when maxLength is set, and the field stops accepting text at the limit.">
        <Textarea label="Short bio" maxLength={LIMIT} placeholder="Tell us about yourself" />
      </Section>

      <Section title="Invalid" note="Destructive border plus the message, read with the field.">
        <Textarea
          label="Bio"
          value={bio}
          onValueChange={setBio}
          invalid={over}
          errorMessage={`${bio.length - LIMIT} characters over the limit.`}
        />
      </Section>

      <Section title="Disabled">
        <Textarea label="Locked" placeholder="Cannot type here" disabled />
        <Textarea defaultValue={'Read only content.\nSecond line.'} disabled />
      </Section>
    </Layout>
  );
}
