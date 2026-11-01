import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { AppBar, AppBarAction, BellIcon, CloseIcon, MenuIcon, SearchIcon, Text as UIText, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function AppBarScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [log, setLog] = useState('none');
  const [active, setActive] = useState(false);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const frame = { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.muted };

  return (
    <Layout id="appbar" title="APP BAR" onBack={onBack}>
      <Section title="Back + actions" note="onBack fills the leading slot. Actions are icon-only, so label is required.">
        <View style={frame}>
          <AppBar
            title="Inbox"
            onBack={() => setLog('back')}
            trailing={
              <>
                <AppBarAction label="Search" icon={(c) => <SearchIcon size={20} color={c} />} onPress={() => setLog('search')} />
                <AppBarAction label="Notifications" icon={(c) => <BellIcon size={20} color={c} />} onPress={() => setLog('bell')} />
              </>
            }
          />
        </View>
        <UIText variant="mono" testID="appbar-log">{`Last press: ${log}`}</UIText>
      </Section>

      <Section title="Variants" note="The bar fills; actions stay on the base surface so they keep contrast.">
        <View style={[frame, styles.stack]}>
          <AppBar title="Default" subtitle="Base fill" />
          <AppBar variant="primary" title="Primary" subtitle="Brand fill" />
          <AppBar variant="accent" title="Accent" subtitle="Highlight fill" />
          <AppBar
            variant="inverse"
            title="Inverse"
            subtitle="Ink fill"
            trailing={<AppBarAction label="Close" icon={(c) => <CloseIcon size={20} color={c} />} />}
          />
        </View>
      </Section>

      <Section title="Large" note="Title on its own row, for top-level screens. Wraps to two lines, then truncates.">
        <View style={frame}>
          <AppBar
            size="large"
            title="Your projects"
            subtitle="12 active"
            leading={<AppBarAction label="Menu" icon={(c) => <MenuIcon size={20} color={c} />} />}
            trailing={<AppBarAction label="Search" icon={(c) => <SearchIcon size={20} color={c} />} />}
          />
        </View>
      </Section>

      <Section title="Collapsing large title" note="scrollY drives it: the large title fades up, the compact title fades in. Scroll the list.">
        <View style={[frame, styles.scroller]}>
          <AppBar
            size="large"
            title="Your projects"
            scrollY={scrollY}
            collapseDistance={56}
            onBack={() => {}}
            trailing={<AppBarAction label="Search projects" icon={(c) => <SearchIcon size={20} color={c} />} />}
          />
          <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} nestedScrollEnabled>
            {PROJECTS.map((name, i) => (
              <View key={name} style={[styles.row, { borderBottomColor: colors.border }]}>
                <UIText variant="mono">{String(i + 1).padStart(2, '0')}</UIText>
                <UIText variant="strong">{name}</UIText>
              </View>
            ))}
          </Animated.ScrollView>
        </View>
      </Section>

      <Section title="States" note="active inverts the action; disabled goes muted and loses its shadow.">
        <View style={frame}>
          <AppBar
            title="Editor"
            onBack={() => {}}
            trailing={
              <>
                <AppBarAction label="Pin" active={active} onPress={() => setActive(!active)} icon={(c) => <BellIcon size={20} color={c} />} />
                <AppBarAction label="Search" disabled icon={(c) => <SearchIcon size={20} color={c} />} />
              </>
            }
          />
        </View>
        <Caption>{`Pin is ${active ? 'on' : 'off'}`}</Caption>
      </Section>

      <Section title="Stress" note="A long title next to two actions must truncate, not push actions off. A third action warns in development.">
        <View style={frame}>
          <AppBar
            title="An extremely long screen title that cannot possibly fit"
            subtitle="A long subtitle that also cannot fit on one line at all"
            onBack={() => {}}
            trailing={
              <>
                <AppBarAction label="Search" icon={(c) => <SearchIcon size={20} color={c} />} />
                <AppBarAction label="Menu" icon={(c) => <MenuIcon size={20} color={c} />} />
              </>
            }
          />
        </View>
      </Section>
    </Layout>
  );
}

const PROJECTS = ['Harbor redesign', 'Field notes', 'Ledger sync', 'Night shift', 'Brick wall', 'Signal flare', 'Concrete type', 'Cold storage'];

const styles = StyleSheet.create({
  stack: { gap: 0 },
  scroller: { height: 320 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 2 },
});
