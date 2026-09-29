import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

function Panel({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.panel, { borderColor: colors.border, backgroundColor: colors.background }]}>
      <Text style={[styles.panelText, { color: colors.foreground }]}>{children}</Text>
    </View>
  );
}

export default function TabsScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState('profile');

  return (
    <Layout title="TABS" onBack={onBack}>
      <Section title="Controlled" note="value + onValueChange. The selected tab is an inverted block, not just a colour change.">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Panel>Your profile details live here.</Panel>
          </TabsContent>
          <TabsContent value="settings">
            <Panel>Manage notifications and privacy.</Panel>
          </TabsContent>
        </Tabs>
        <Caption>{`Selected: ${tab}`}</Caption>
      </Section>

      <Section title="Uncontrolled, three tabs, one disabled" note="defaultValue keeps its own state.">
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="admin" disabled>
              Admin
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Panel>Account overview.</Panel>
          </TabsContent>
          <TabsContent value="billing">
            <Panel>Invoices and payment methods.</Panel>
          </TabsContent>
          <TabsContent value="admin">
            <Panel>Admins only.</Panel>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="keepMounted" note="Inactive content stays mounted (state survives) but is hidden from view and screen readers.">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">One</TabsTrigger>
            <TabsTrigger value="b">Two</TabsTrigger>
            <TabsTrigger value="c">Three</TabsTrigger>
            <TabsTrigger value="d">Four</TabsTrigger>
          </TabsList>
          <TabsContent value="a" keepMounted>
            <Panel>First panel</Panel>
          </TabsContent>
          <TabsContent value="b" keepMounted>
            <Panel>Second panel</Panel>
          </TabsContent>
          <TabsContent value="c">
            <Panel>Third panel (unmounted when inactive)</Panel>
          </TabsContent>
          <TabsContent value="d">
            <Panel>Fourth panel</Panel>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Edge cases">
        <Tabs defaultValue="x">
          <TabsList>
            <TabsTrigger value="x">Overview and activity</TabsTrigger>
            <TabsTrigger value="y">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="x">
            <Panel>Long tab labels truncate to one line.</Panel>
          </TabsContent>
        </Tabs>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 2, padding: 16 },
  panelText: { fontSize: 15, fontWeight: '600' },
});
