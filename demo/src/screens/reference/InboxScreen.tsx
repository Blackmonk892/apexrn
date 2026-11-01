import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBar,
  AppBarAction,
  Badge,
  BellIcon,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  FAB,
  InfoIcon,
  ListItem,
  MenuIcon,
  PlusIcon,
  SearchBar,
  SegmentedControl,
  Separator,
  Text,
  spacing,
  useTheme,
} from '@apexrn/ui';
import Layout from '../../components/Layout';

interface Message {
  id: string;
  from: string;
  subject: string;
  time: string;
  unread: boolean;
  starred: boolean;
}

const MESSAGES: Message[] = [
  { id: '1', from: 'Priya Raman', subject: 'Design review moved to Thursday', time: '9:41', unread: true, starred: false },
  { id: '2', from: 'Billing', subject: 'Your October invoice is ready', time: '8:15', unread: true, starred: true },
  { id: '3', from: 'Tomás Rivera', subject: 'Re: Release notes for 2.4', time: 'Mon', unread: false, starred: false },
  { id: '4', from: 'Hannah Lee', subject: 'Photos from the offsite', time: 'Mon', unread: false, starred: true },
  { id: '5', from: 'Security', subject: 'New sign-in from Lisbon', time: 'Sun', unread: true, starred: false },
  { id: '6', from: 'Jonas Weber', subject: 'Can you review the contract?', time: 'Oct 28', unread: false, starred: false },
];

const FILTERS = [
  { value: 'all', label: 'All', testID: 'ref-filter-all' },
  { value: 'unread', label: 'Unread', testID: 'ref-filter-unread' },
  { value: 'starred', label: 'Starred', testID: 'ref-filter-starred' },
];

export default function InboxScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MESSAGES.filter((m) => {
      if (filter === 'unread' && !m.unread) return false;
      if (filter === 'starred' && !m.starred) return false;
      return !q || m.from.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
    });
  }, [query, filter]);

  const reset = () => {
    setQuery('');
    setFilter('all');
  };

  return (
    <Layout
      id="ref-inbox"
      title="INBOX"
      onBack={onBack}
      overlay={
        <FAB
          testID="ref-compose"
          accessibilityLabel="Compose a message"
          icon={<PlusIcon size={24} color={colors.primaryForeground} />}
          insets={{ bottom: insets.bottom, right: insets.right }}
          onPress={() => setDraft(true)}
        />
      }
    >
      <View style={styles.page}>
        <AppBar
          title="Inbox"
          subtitle={`${MESSAGES.filter((m) => m.unread).length} unread`}
          leading={<AppBarAction label="Menu" icon={(c) => <MenuIcon size={20} color={c} />} />}
          trailing={<AppBarAction label="Notifications" icon={(c) => <BellIcon size={20} color={c} />} />}
        />
        <SearchBar value={query} onValueChange={setQuery} placeholder="Search messages" testID="ref-search" />
        <SegmentedControl segments={FILTERS} value={filter} onValueChange={setFilter} accessibilityLabel="Filter messages" />

        {visible.length === 0 ? (
          <EmptyState testID="ref-inbox-empty">
            <EmptyStateIcon>{(color) => <InfoIcon size={28} color={color} />}</EmptyStateIcon>
            <EmptyStateTitle>No messages</EmptyStateTitle>
            <EmptyStateDescription>Nothing matches this filter and search.</EmptyStateDescription>
            <EmptyStateActions>
              <Button variant="outline" onPress={reset} testID="ref-clear-filters">
                Clear filters
              </Button>
            </EmptyStateActions>
          </EmptyState>
        ) : (
          <View>
            <Separator />
            {visible.map((m) => (
              <View key={m.id}>
                <ListItem
                  title={m.from}
                  description={m.subject}
                  meta={m.time}
                  trailing={m.unread ? <Badge variant="primary" label="New" /> : undefined}
                  onPress={() => {}}
                  testID={`ref-message-${m.id}`}
                />
                <Separator />
              </View>
            ))}
          </View>
        )}
        {draft ? (
          <Text variant="mono" tone="muted" testID="ref-inbox-log">
            New draft started
          </Text>
        ) : null}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.lg },
});
