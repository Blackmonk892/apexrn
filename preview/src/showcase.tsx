import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBar,
  AppBarAction,
  Avatar,
  Badge,
  BellIcon,
  BottomNav,
  BottomNavItem,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerItem,
  DrawerList,
  DrawerTrigger,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  FAB,
  HomeIcon,
  InfoIcon,
  ListItem,
  MenuIcon,
  PlusIcon,
  SearchBar,
  SegmentedControl,
  Separator,
  Switch,
  Text,
  UserIcon,
  spacing,
  useTheme,
} from '@apexrn/ui';

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

const ALERTS = [
  { id: 'a', title: 'Invoice paid', description: 'October, $240.00', meta: '9:02' },
  { id: 'b', title: 'Sign-in from a new device', description: 'Lisbon, Portugal', meta: 'Sun' },
  { id: 'c', title: 'Storage at 92%', description: 'Free up space or upgrade', meta: 'Fri' },
];

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'starred', label: 'Starred' },
];

type Tab = 'inbox' | 'alerts' | 'me';

/** The landing page's phone: the Inbox reference screen plus the drawer and bottom nav the leader lines point at. */
export function Showcase() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('inbox');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [drafts, setDrafts] = useState(0);

  const unread = MESSAGES.filter((m) => m.unread).length;
  const title = tab === 'inbox' ? 'Inbox' : tab === 'alerts' ? 'Alerts' : 'Me';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Drawer>
        <AppBar
          title={title}
          subtitle={tab === 'inbox' ? `${unread} unread` : undefined}
          topInset={insets.top}
          leading={
            <DrawerTrigger asChild>
              <AppBarAction label="Open menu" icon={(c) => <MenuIcon size={20} color={c} />} />
            </DrawerTrigger>
          }
          trailing={
            <AppBarAction label="Alerts" icon={(c) => <BellIcon size={20} color={c} />} onPress={() => setTab('alerts')} />
          }
        />
        <DrawerContent topInset={insets.top} bottomInset={insets.bottom}>
          <DrawerHeader title="ApexRN" subtitle="ada@example.com" />
          <DrawerList>
            <DrawerItem label="Inbox" badge={unread} active={tab === 'inbox'} onPress={() => setTab('inbox')} />
            <DrawerItem label="Alerts" badge={ALERTS.length} active={tab === 'alerts'} onPress={() => setTab('alerts')} />
            <DrawerItem label="Profile" active={tab === 'me'} onPress={() => setTab('me')} />
          </DrawerList>
        </DrawerContent>
      </Drawer>

      <View style={styles.body}>
        {tab === 'inbox' ? (
          <InboxTab query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} drafts={drafts} />
        ) : tab === 'alerts' ? (
          <ScrollView contentContainerStyle={styles.page}>
            {ALERTS.map((a) => (
              <View key={a.id}>
                <ListItem title={a.title} description={a.description} meta={a.meta} onPress={() => {}} />
                <Separator />
              </View>
            ))}
          </ScrollView>
        ) : (
          <MeTab />
        )}
        {tab === 'inbox' ? (
          <FAB
            accessibilityLabel="Compose a message"
            icon={<PlusIcon size={24} color={colors.primaryForeground} />}
            onPress={() => setDrafts((n) => n + 1)}
          />
        ) : null}
      </View>

      <BottomNav value={tab} onValueChange={(v) => setTab(v as Tab)} bottomInset={insets.bottom}>
        <BottomNavItem value="inbox" label="Inbox" badge={unread} icon={(c) => <HomeIcon size={22} color={c} />} />
        <BottomNavItem value="alerts" label="Alerts" icon={(c) => <BellIcon size={22} color={c} />} />
        <BottomNavItem value="me" label="Me" icon={(c) => <UserIcon size={22} color={c} />} />
      </BottomNav>
    </View>
  );
}

interface InboxTabProps {
  query: string;
  onQuery: (q: string) => void;
  filter: string;
  onFilter: (f: string) => void;
  drafts: number;
}

function InboxTab({ query, onQuery, filter, onFilter, drafts }: InboxTabProps) {
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MESSAGES.filter((m) => {
      if (filter === 'unread' && !m.unread) return false;
      if (filter === 'starred' && !m.starred) return false;
      return !q || m.from.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
    });
  }, [query, filter]);

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <SearchBar value={query} onValueChange={onQuery} placeholder="Search messages" />
      <SegmentedControl segments={FILTERS} value={filter} onValueChange={onFilter} accessibilityLabel="Filter messages" />
      {drafts > 0 ? (
        <Text variant="mono" tone="muted">
          {drafts === 1 ? '1 draft started' : `${drafts} drafts started`}
        </Text>
      ) : null}
      {visible.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>{(color) => <InfoIcon size={28} color={color} />}</EmptyStateIcon>
          <EmptyStateTitle>No messages</EmptyStateTitle>
          <EmptyStateDescription>Nothing matches this filter and search.</EmptyStateDescription>
          <EmptyStateActions>
            <Button
              variant="outline"
              onPress={() => {
                onQuery('');
                onFilter('all');
              }}
            >
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
              />
              <Separator />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function MeTab() {
  const [push, setPush] = useState(true);
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.profile}>
        <Avatar name="Ada Lovelace" size="lg" />
        <View style={styles.profileText}>
          <Text variant="title">Ada Lovelace</Text>
          <Text tone="muted">ada@example.com</Text>
        </View>
      </View>
      <Separator />
      <Switch checked={push} onCheckedChange={setPush} label="Push notifications" />
      <Separator />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
  page: { padding: spacing.lg, gap: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  profileText: { flexShrink: 1 },
});
