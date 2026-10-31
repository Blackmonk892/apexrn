import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Avatar, ListItem, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const SIZES = ['sm', 'md', 'lg'] as const;
const PHOTO = Image.resolveAssetSource(require('../../assets/icon.png')).uri;

export default function AvatarScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();

  return (
    <Layout id="avatar" title="AVATAR" onBack={onBack}>
      <Section title="Variants" note="Square, not round. An image when it loads, the person's initials when it does not.">
        <View style={styles.row}>
          <Avatar name="Ada Lovelace" src={PHOTO} testID="avatar-image-case" />
          <Avatar name="Ada Lovelace" testID="avatar-initials-case" />
          <Avatar name="Grace Hopper" initials="GH" />
        </View>
      </Section>

      <Section title="Sizes" note="32 / 40 / 56.">
        <View style={styles.row}>
          {SIZES.map((size) => (
            <Avatar key={size} size={size} name="Margaret Hamilton" testID={`avatar-size-${size}`} />
          ))}
          {SIZES.map((size) => (
            <Avatar key={`img-${size}`} size={size} name="Margaret Hamilton" src={PHOTO} />
          ))}
        </View>
      </Section>

      <Section title="States" note="There is no pressed or disabled state: an avatar is content.">
        <View style={styles.row}>
          <Avatar name="Katherine Johnson" src="https://invalid.example/missing.jpg" testID="avatar-broken" />
          <Avatar testID="avatar-anonymous" />
        </View>
        <Caption>Left: the image failed to load. Right: no name or initials, so a question mark.</Caption>
      </Section>

      <Section title="In context">
        <View style={[styles.list, { borderColor: colors.border }]}>
          <ListItem
            title="Alan Turing"
            description="Reviewed your pull request on the scheduler."
            leading={<Avatar size="sm" name="Alan Turing" />}
          />
          <ListItem
            title="Hedy Lamarr"
            description="Shared the frequency-hopping notes."
            leading={<Avatar size="sm" name="Hedy Lamarr" src={PHOTO} />}
          />
        </View>
      </Section>

      <Section title="Edge cases">
        <View style={styles.row}>
          <Avatar name="Ludwig" />
          <Avatar name="  jean-luc   picard  " />
          <Avatar name="Ö" />
          <Avatar initials="xyz" size="lg" />
        </View>
        <Caption>Single name, extra whitespace, accented letter, and initials longer than two (first two kept).</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 24, paddingBottom: 4 },
  list: { borderWidth: 2 },
});
