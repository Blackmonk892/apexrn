import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Badge, ListItem, Separator, Text, borderWidths, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const SETTINGS = [
  { title: 'Account', description: 'Email, password and sign-in methods' },
  { title: 'Notifications', description: 'Push and email preferences' },
  { title: 'Storage', description: undefined },
];

export default function ListItemScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [log, setLog] = useState('none');
  const frame = [styles.list, { borderColor: colors.border }];
  const open = (title: string) => () => setLog(title);

  return (
    <Layout id="listitem" title="LIST ITEM" onBack={onBack}>
      <Section title="Variants" note="One line is 56 tall, with a description 72. Rules between rows come from Separator.">
        <View style={frame}>
          {SETTINGS.map((item, i) => (
            <React.Fragment key={item.title}>
              {i > 0 ? <Separator /> : null}
              <ListItem
                title={item.title}
                description={item.description}
                testID={`listitem-${item.title.toLowerCase()}`}
                onPress={open(item.title)}
              />
            </React.Fragment>
          ))}
        </View>
        <Text variant="mono" testID="listitem-log">{`Opened: ${log}`}</Text>
      </Section>

      <Section title="States" note="Pressed fills the row with muted. Disabled drops to reduced opacity and ignores presses.">
        <View style={frame}>
          <ListItem title="Plain content" description="No onPress, so no button role and no press fill." />
          <Separator />
          <ListItem title="Delete workspace" description="Ask an owner to do this for you." disabled onPress={open('Delete workspace')} />
        </View>
      </Section>

      <Section title="In context">
        <View style={frame}>
          <ListItem
            title="Alex Johnson"
            description="Are we still on for tomorrow?"
            leading={<Avatar size="sm" name="Alex Johnson" />}
            meta="12:30"
            onPress={open('Alex Johnson')}
          />
          <Separator />
          <ListItem
            title="Backup complete"
            description="2,481 files, 3.2 GB"
            leading={<Avatar size="sm" name="Backup" />}
            trailing={<Badge variant="accent" label="New" />}
            onPress={open('Backup complete')}
          />
          <Separator />
          <ListItem title="Invoice 0042" meta="$1,280.00" onPress={open('Invoice 0042')} />
        </View>
      </Section>

      <Section title="Edge cases">
        <View style={frame}>
          <ListItem
            title="Quarterly planning notes for the platform team, including the migration schedule and open risks"
            description="Edited by Priya Raghunathan and four others this week"
            meta="Fri"
            trailing={<Badge variant="primary" label="3" />}
            onPress={open('Quarterly planning')}
          />
        </View>
        <Caption>Title wraps to two lines then truncates. Description stays on one. Meta and trailing keep their size.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: borderWidths.control },
});
