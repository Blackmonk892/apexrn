import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CloseIcon, Input, SearchIcon, Text, spacing, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const SIZES = ['sm', 'md', 'lg'] as const;

export default function InputScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const [email, setEmail] = useState('ada@');
  const [query, setQuery] = useState('');
  const [secret, setSecret] = useState('hunter2');
  const [revealed, setRevealed] = useState(false);

  const emailInvalid = !email.includes('@') || email.endsWith('@');

  return (
    <Layout id="input" title="INPUT" onBack={onBack}>
      <Text>Tap a field to raise its focus ring. The size never changes between states.</Text>

      <Section title="Variants" note="Label, description, slots and an error row are all optional parts of one field.">
        <Input
          testID="input-email"
          label="Email address"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          onValueChange={setValue}
        />
        <Caption>{`Value: ${value}`}</Caption>
        <Input
          label="Display name"
          required
          description="Shown on invoices and receipts."
          placeholder="Ada Lovelace"
        />
        <Input
          label="Search orders"
          placeholder="Order number"
          value={query}
          onValueChange={setQuery}
          leading={<SearchIcon size={20} color={colors.foreground} />}
          trailing={
            query ? (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <CloseIcon size={18} color={colors.foreground} />
              </Pressable>
            ) : undefined
          }
        />
      </Section>

      <Section title="Sizes" note="Heights 40, 48 and 56. Small fields extend their hit area to the platform touch target.">
        {SIZES.map((size) => (
          <Input key={size} size={size} placeholder={`Size ${size}`} />
        ))}
      </Section>

      <Section title="States" note="Focus is real: tap the first field. Invalid and disabled are forced.">
        <Input label="Default" placeholder="Waiting for input" />
        <Input
          label="Invalid"
          invalid
          defaultValue="12 Rue de la Paix"
          errorMessage="Postcode is missing from this address."
        />
        <Input label="Disabled" disabled defaultValue="Locked by your administrator" />
        <Caption>Disabled keeps the field fill, dashes the border and drops focus.</Caption>
      </Section>

      <Section title="In context">
        <Input
          label="Work email"
          required
          value={email}
          onValueChange={setEmail}
          invalid={emailInvalid}
          errorMessage="Enter a full address, such as ada@example.com."
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={secret}
          onValueChange={setSecret}
          secureTextEntry={!revealed}
          trailing={
            <Pressable
              onPress={() => setRevealed((r) => !r)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            >
              <Text variant="label">{revealed ? 'Hide' : 'Show'}</Text>
            </Pressable>
          }
        />
        <Caption>The email error clears as soon as the address is complete.</Caption>
      </Section>

      <Section title="Edge cases">
        <Input defaultValue="A very long value that keeps going well past the end of the visible field" />
        <Input
          label="Shipping instructions for the courier on arrival"
          invalid
          errorMessage="Instructions are limited to 120 characters, shorten them to continue."
          defaultValue="Leave at the side gate"
        />
        <View style={styles.narrow}>
          <Input label="Promo code" placeholder="SPRING-24" />
        </View>
        <Caption>A 200 wide container; the field and its label keep inside the border.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  narrow: { width: 200, marginTop: spacing.sm },
});
