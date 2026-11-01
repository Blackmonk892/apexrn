import React, { useState } from 'react';
import { Text } from 'react-native';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  InfoIcon,
  useTheme,
} from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function EmptyStateScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [log, setLog] = useState('none');
  const act = (name: string) => () => setLog(`Action: ${name}`);

  return (
    <Layout id="emptystate" title="EMPTY STATE" onBack={onBack}>
      <Text testID="emptystate-log" style={{ color: colors.mutedForeground, fontWeight: '700', fontSize: 12, marginBottom: 4 }}>{log}</Text>
      <Section title="Full" note="Icon, title, description and two actions. The title carries the weight.">
        <EmptyState>
          <EmptyStateIcon>{(color) => <InfoIcon size={28} color={color} />}</EmptyStateIcon>
          <EmptyStateTitle>Inbox zero</EmptyStateTitle>
          <EmptyStateDescription>New messages land here. Nothing needs you right now.</EmptyStateDescription>
          <EmptyStateActions>
            <Button onPress={act('compose')}>Compose</Button>
            <Button variant="outline" onPress={act('refresh')}>Refresh</Button>
          </EmptyStateActions>
        </EmptyState>
      </Section>

      <Section title="Minimal" note="Title only.">
        <EmptyState>
          <EmptyStateTitle>No results</EmptyStateTitle>
        </EmptyState>
      </Section>

      <Section title="Start-aligned" note="align=start for lists and left-aligned screens.">
        <EmptyState align="start">
          <EmptyStateTitle>No drafts</EmptyStateTitle>
          <EmptyStateDescription>Drafts you save show up here.</EmptyStateDescription>
          <EmptyStateActions>
            <Button size="sm" onPress={act('new draft')}>New draft</Button>
          </EmptyStateActions>
        </EmptyState>
      </Section>

      <Section title="Long text" note="Wraps inside the container; actions wrap to a second row.">
        <EmptyState>
          <EmptyStateTitle>Your archive is empty and will stay that way until something is moved into it</EmptyStateTitle>
          <EmptyStateDescription>
            Archived conversations are kept for ninety days, searchable from the top bar, and restored to the inbox the moment someone replies to them.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button onPress={act('learn more')}>Learn how archiving works</Button>
            <Button variant="outline" onPress={act('settings')}>Archive settings</Button>
          </EmptyStateActions>
        </EmptyState>
      </Section>

    </Layout>
  );
}
