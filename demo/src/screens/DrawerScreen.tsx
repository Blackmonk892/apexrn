import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBarAction,
  BellIcon,
  Button,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerItem,
  DrawerList,
  DrawerSection,
  DrawerTrigger,
  HomeIcon,
  MenuIcon,
  SearchIcon,
  Text,
  UserIcon,
} from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

const PUSH_DISTANCE = 260;
const icon = (Icon: typeof HomeIcon) => (c: string) => <Icon size={20} color={c} />;

function Index({ current, onPick }: { current: string; onPick: (v: string) => void }) {
  return (
    <>
      <DrawerList>
        <DrawerSection label="Workspace" />
        <DrawerItem number={1} label="Home" icon={icon(HomeIcon)} active={current === 'Home'} onPress={() => onPick('Home')} testID="drawer-item-home" />
        <DrawerItem number={2} label="Inbox" icon={icon(BellIcon)} badge={12} active={current === 'Inbox'} onPress={() => onPick('Inbox')} testID="drawer-item-inbox" />
        <DrawerItem number={3} label="Search" icon={icon(SearchIcon)} active={current === 'Search'} onPress={() => onPick('Search')} />
        <DrawerSection label="Account" />
        <DrawerItem number={4} label="Profile" icon={icon(UserIcon)} active={current === 'Profile'} onPress={() => onPick('Profile')} />
        <DrawerItem number={5} label="Billing, locked" icon={icon(UserIcon)} disabled />
        <DrawerItem number={6} label="Pin menu open" closeOnPress={false} onPress={() => onPick('Pin menu open')} />
      </DrawerList>
      <DrawerFooter>
        <Text variant="label" tone="muted">Version</Text>
        <Text variant="mono">0.1.0</Text>
      </DrawerFooter>
    </>
  );
}

export default function DrawerScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState('Home');
  const [state, setState] = useState('closed');
  const [rightOpen, setRightOpen] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);
  const progress = useSharedValue(0);
  const pushStyle = useAnimatedStyle(() => ({ flex: 1, transform: [{ translateX: progress.value * PUSH_DISTANCE }] }));

  const pick = (v: string) => setCurrent(v);

  return (
    <Drawer onOpenChange={(o) => setState(o ? 'opened' : 'closed')}>
      <Animated.View style={pushStyle}>
        <Layout
          id="drawer"
          title="DRAWER"
          onBack={onBack}
          overlay={
            <>
              <DrawerContent edgeWidth={24} topInset={insets.top} bottomInset={insets.bottom} testID="drawer-panel">
                <DrawerHeader title="ApexRN" subtitle="Signed in as demo" />
                <Index current={current} onPick={pick} />
              </DrawerContent>

              <Drawer open={rightOpen} onOpenChange={setRightOpen}>
                <DrawerContent side="right" width={260} edgeWidth={0} topInset={insets.top} bottomInset={insets.bottom}>
                  <DrawerHeader title="Filters" />
                  <Index current={current} onPick={pick} />
                </DrawerContent>
              </Drawer>

              <Drawer open={pushOpen} onOpenChange={setPushOpen} progress={progress}>
                <DrawerContent variant="push" width={PUSH_DISTANCE} edgeWidth={0} topInset={insets.top} bottomInset={insets.bottom}>
                  <DrawerHeader title="Pushed" subtitle="Screen follows" />
                  <Index current={current} onPick={pick} />
                </DrawerContent>
              </Drawer>
            </>
          }
        >
          <Section title="Left overlay, uncontrolled" note="Swipe in from the left edge, or use the trigger. The inverted block slides to the current item.">
            <DrawerTrigger asChild>
              <Button title="Open menu" testID="drawer-open" icon={(color) => <MenuIcon size={18} color={color} />} />
            </DrawerTrigger>
          </Section>

          <Section title="Right overlay, controlled" note="side right, with open and onOpenChange.">
            <View style={{ flexDirection: 'row' }}>
              <AppBarAction label="Open right drawer" icon={(c) => <MenuIcon size={20} color={c} />} onPress={() => setRightOpen(true)} />
            </View>
          </Section>

          <Section title="Push" note="variant push leaves the screen undimmed. This screen translates with the progress shared value.">
            <Button title="Open push drawer" variant="outline" onPress={() => setPushOpen(true)} />
          </Section>

          <Section title="Event log">
            <Text variant="mono" testID="drawer-log">{`Selected: ${current}`}</Text>
            <Text variant="mono" testID="drawer-state">{`Drawer: ${state}`}</Text>
          </Section>
        </Layout>
      </Animated.View>
    </Drawer>
  );
}
