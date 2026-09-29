import React, { useState } from 'react';
import { View } from 'react-native';
import { BellIcon, BottomNav, BottomNavItem, HomeIcon, SearchIcon, UserIcon, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

const icon = (Icon: typeof HomeIcon) => (c: string) => <Icon size={22} color={c} />;

export default function BottomNavScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState('home');
  const [unread, setUnread] = useState(3);
  const frame = { borderWidth: 2, borderColor: colors.border };

  return (
    <Layout title="BOTTOM NAV" onBack={onBack}>
      <Section title="Controlled, four items" note="The selected block slides (transform only). Labels are always visible.">
        <View style={frame}>
          <BottomNav
            value={tab}
            onValueChange={(v) => {
              setTab(v);
              if (v === 'alerts') setUnread(0);
            }}
          >
            <BottomNavItem value="home" label="Home" icon={icon(HomeIcon)} />
            <BottomNavItem value="search" label="Search" icon={icon(SearchIcon)} />
            <BottomNavItem value="alerts" label="Alerts" badge={unread} icon={icon(BellIcon)} />
            <BottomNavItem value="me" label="Me" icon={icon(UserIcon)} />
          </BottomNav>
        </View>
        <Caption>{`Selected: ${tab}. The badge clears when Alerts opens.`}</Caption>
      </Section>

      <Section title="Uncontrolled, three items" note="defaultValue keeps its own state. String badges work too.">
        <View style={frame}>
          <BottomNav defaultValue="b">
            <BottomNavItem value="a" label="Feed" icon={icon(HomeIcon)} />
            <BottomNavItem value="b" label="Explore" icon={icon(SearchIcon)} badge="NEW" />
            <BottomNavItem value="c" label="Account" icon={icon(UserIcon)} />
          </BottomNav>
        </View>
      </Section>

      <Section title="Edge cases" note="Disabled item, two items, a long label, and a badge past two digits.">
        <View style={[frame, { gap: 16 }]}>
          <BottomNav defaultValue="a">
            <BottomNavItem value="a" label="Open" icon={icon(HomeIcon)} />
            <BottomNavItem value="b" label="Locked" disabled icon={icon(UserIcon)} />
          </BottomNav>
          <BottomNav defaultValue="a">
            <BottomNavItem value="a" label="Notifications and mentions" icon={icon(BellIcon)} badge={128} />
            <BottomNavItem value="b" label="Home" icon={icon(HomeIcon)} />
            <BottomNavItem value="c" label="Search" icon={icon(SearchIcon)} />
          </BottomNav>
        </View>
      </Section>
    </Layout>
  );
}
