import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBar,
  AppBarAction,
  BellIcon,
  BottomNav,
  BottomNavItem,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerItem,
  DrawerTrigger,
  HomeIcon,
  MenuIcon,
  Text,
  UserIcon,
  useTheme,
} from '@apexrn/ui';

/** Hero view for the landing page: the three parts the leader lines point at. */
export function Showcase() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('home');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Drawer>
        <AppBar
          title="Inbox"
          leading={
            <DrawerTrigger asChild>
              <AppBarAction label="Open menu" icon={<MenuIcon size={22} color={colors.foreground} />} />
            </DrawerTrigger>
          }
        />
        <DrawerContent topInset={insets.top} bottomInset={insets.bottom}>
          <DrawerHeader title="ApexRN" subtitle="Signed in" />
          <DrawerItem label="Home" active />
          <DrawerItem label="Inbox" badge={12} />
          <DrawerItem label="Settings" />
        </DrawerContent>
      </Drawer>
      <View style={styles.body}>
        <Text variant="title">12 unread</Text>
        <Text tone="muted">Copied into this app with one command.</Text>
        <View style={styles.actions}>
          <Button variant="primary">Reply</Button>
          <Button variant="outline">Archive</Button>
        </View>
      </View>
      <BottomNav value={tab} onValueChange={setTab} bottomInset={insets.bottom}>
        <BottomNavItem value="home" label="Home" icon={(c) => <HomeIcon size={22} color={c} />} />
        <BottomNavItem value="alerts" label="Alerts" badge={3} icon={(c) => <BellIcon size={22} color={c} />} />
        <BottomNavItem value="me" label="Me" icon={(c) => <UserIcon size={22} color={c} />} />
      </BottomNav>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, padding: 16, gap: 12 },
  actions: { gap: 12, marginTop: 8 },
});
