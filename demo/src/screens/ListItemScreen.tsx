import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Badge, ListItem, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function ListItemScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [last, setLast] = useState('none');
  const list = [styles.list, { borderColor: colors.border }];

  return (
    <Layout title="LIST ITEM" onBack={onBack}>
      <Section title="Static" note="Without onPress an item is plain content: no button role, no press feedback.">
        <View style={list}>
          <ListItem title="Notifications" />
          <ListItem title="Privacy" description="Control who can see your activity." />
        </View>
      </Section>

      <Section title="Pressable" note="Press and hold: the row fills with the accent colour.">
        <View style={list}>
          <ListItem title="Account" onPress={() => setLast('Account')} />
          <ListItem title="Billing" description="Cards and invoices" onPress={() => setLast('Billing')} />
        </View>
        <Caption>{`Last pressed: ${last}`}</Caption>
      </Section>

      <Section title="Leading and trailing">
        <View style={list}>
          <ListItem
            title="Alex Johnson"
            description="Are we still on for tomorrow?"
            leading={<Avatar size="sm" initials="AJ" />}
            trailing={<Text style={[styles.time, { color: colors.foreground }]}>12:30</Text>}
            onPress={() => setLast('Alex')}
          />
          <ListItem
            title="Backup complete"
            description="Your files are safe."
            leading={<Avatar size="sm" initials="BK" />}
            trailing={<Badge variant="accent" label="New" />}
            onPress={() => setLast('Backup')}
          />
        </View>
      </Section>

      <Section title="Disabled">
        <View style={list}>
          <ListItem title="Delete account" description="Not available right now." disabled onPress={() => setLast('Delete')} />
        </View>
      </Section>

      <Section title="Edge cases">
        <View style={list}>
          <ListItem
            title="A title that is much too long to fit on one line of this list"
            description="A description that runs long enough to wrap onto a second line and then be clipped after that second line of text."
            trailing={<Badge variant="primary" label="3" />}
            onPress={() => setLast('Long')}
          />
        </View>
        <Caption>Title: one line. Description: two lines. Trailing content keeps its size.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: 2, borderBottomWidth: 0 },
  time: { fontWeight: '800' },
});
