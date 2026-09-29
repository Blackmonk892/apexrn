import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppBar, AppBarAction, BellIcon, CloseIcon, MenuIcon, SearchIcon, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function AppBarScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [log, setLog] = useState('none');
  const [active, setActive] = useState(false);
  const frame = { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.muted };

  return (
    <Layout title="APP BAR" onBack={onBack}>
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
        <Caption>{`Last press: ${log}`}</Caption>
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

      <Section title="Stress" note="A long title next to three actions must truncate, not push actions off.">
        <View style={frame}>
          <AppBar
            title="An extremely long screen title that cannot possibly fit"
            subtitle="A long subtitle that also cannot fit on one line at all"
            onBack={() => {}}
            trailing={
              <>
                <AppBarAction label="One" icon={(c) => <SearchIcon size={20} color={c} />} />
                <AppBarAction label="Two" icon={(c) => <BellIcon size={20} color={c} />} />
                <AppBarAction label="Three" icon={(c) => <MenuIcon size={20} color={c} />} />
              </>
            }
          />
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({ stack: { gap: 0 } });
