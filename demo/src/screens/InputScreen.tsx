import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input, Label, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function InputScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('hunter2');
  const [revealed, setRevealed] = useState(false);
  const [log, setLog] = useState('none');
  const glyph = (c: string) => <Text style={[styles.glyph, { color: colors.mutedForeground }]}>{c}</Text>;
  const invalid = email.length > 0 && !email.includes('@');

  return (
    <Layout title="INPUT" onBack={onBack}>
      <Section title="Default" note="Focus the field: the hard shadow fades in and the size never changes.">
        <Input placeholder="Enter your text" onFocus={() => setLog('focus')} onBlur={() => setLog('blur')} />
        <Caption>{`Last event: ${log}`}</Caption>
      </Section>

      <Section title="Icons" note="Leading icons are decorative. A trailing icon with onTrailingIconPress becomes a button.">
        <Input placeholder="Username" leadingIcon={glyph('@')} />
        <Input
          placeholder="Password"
          secureTextEntry={!revealed}
          value={secret}
          onChangeText={setSecret}
          trailingIcon={glyph(revealed ? 'HIDE' : 'SHOW')}
          onTrailingIconPress={() => setRevealed((r) => !r)}
          trailingIconLabel={revealed ? 'Hide password' : 'Show password'}
        />
      </Section>

      <Section title="Error" note="Destructive border and a permanent shadow, plus aria-invalid. Not colour alone.">
        <View>
          <Label>Email address</Label>
          <Input
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={invalid}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {invalid ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>Enter an email address that includes @.</Text>
          ) : (
            <Caption>Type text without an @ to see the error.</Caption>
          )}
        </View>
        <Input placeholder="Always invalid" error />
      </Section>

      <Section title="Disabled">
        <Input placeholder="Cannot edit this" disabled />
        <Input value="Locked value" disabled />
        <Caption>Muted fill and muted border; same size as an enabled input.</Caption>
      </Section>

      <Section title="Edge cases">
        <Input value="A very long value that keeps going well past the end of the visible field" />
        <Input placeholder="Placeholder that is also quite long and will be clipped by the field width" />
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  glyph: { fontSize: 13, fontWeight: '900' },
  errorText: { fontSize: 13, fontWeight: '700', marginTop: 8 },
});
