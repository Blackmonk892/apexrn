import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBarAction,
  BellIcon,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerItem,
  DrawerTrigger,
  HomeIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  useTheme,
} from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const icon = (Icon: typeof HomeIcon) => (c: string) => <Icon size={20} color={c} />;

function Items({ current, onPick }: { current: string; onPick: (v: string) => void }) {
  const { colors } = useTheme();
  return (
    <ScrollView>
      <DrawerItem label="Home" active={current === 'Home'} onPress={() => onPick('Home')} icon={icon(HomeIcon)} />
      <DrawerItem label="Inbox" badge={12} active={current === 'Inbox'} onPress={() => onPick('Inbox')} icon={icon(BellIcon)} />
      <DrawerItem label="Search" active={current === 'Search'} onPress={() => onPick('Search')} icon={icon(SearchIcon)} />
      <DrawerItem label="Profile" active={current === 'Profile'} onPress={() => onPick('Profile')} icon={icon(UserIcon)} />
      <DrawerItem label="Billing (locked)" disabled icon={icon(UserIcon)} />
      <DrawerItem label="Stay open" closeOnPress={false} onPress={() => onPick('Stay open')} />
      <Text style={{ color: colors.mutedForeground, padding: 16, fontSize: 12, fontWeight: '700' }}>
        Swipe the panel towards its edge, tap the scrim, or use the Android back button to close.
      </Text>
    </ScrollView>
  );
}

export default function DrawerScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [current, setCurrent] = useState('Home');
  const [open, setOpen] = useState(false);
  const [state, setState] = useState('closed');

  return (
    <Layout title="DRAWER" onBack={onBack}>
      <Section title="Left, uncontrolled" note="DrawerTrigger opens it. Items close it unless closeOnPress is false.">
        <Drawer onOpenChange={(o) => setState(o ? 'opened' : 'closed')}>
          <DrawerTrigger asChild>
            <Button title="Open menu" icon={<MenuIcon size={18} color={colors.foreground} />} />
          </DrawerTrigger>
          <DrawerContent topInset={insets.top} bottomInset={insets.bottom}>
            <DrawerHeader title="ApexRN" subtitle="Signed in as demo" />
            <Items current={current} onPick={setCurrent} />
          </DrawerContent>
        </Drawer>
        <Caption>{`Current: ${current} / drawer ${state}`}</Caption>
      </Section>

      <Section title="Right, controlled" note="side='right' with open and onOpenChange, opened from an app bar action.">
        <View style={{ flexDirection: 'row' }}>
          <AppBarAction label="Open right drawer" icon={(c) => <MenuIcon size={20} color={c} />} onPress={() => setOpen(true)} />
        </View>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent side="right" width={260} topInset={insets.top} bottomInset={insets.bottom}>
            <DrawerHeader title="Filters" />
            <Items current={current} onPick={setCurrent} />
          </DrawerContent>
        </Drawer>
        <Caption>{`Controlled open: ${open}`}</Caption>
      </Section>

      <Section title="No swipe" note="swipeToClose={false} leaves the scrim, back button and items as the ways out.">
        <Drawer>
          <DrawerTrigger asChild>
            <Button title="Open, no swipe" />
          </DrawerTrigger>
          <DrawerContent swipeToClose={false} topInset={insets.top} bottomInset={insets.bottom}>
            <DrawerHeader title="Pinned" subtitle="Swipe disabled" />
            <Items current={current} onPick={setCurrent} />
          </DrawerContent>
        </Drawer>
      </Section>
    </Layout>
  );
}
