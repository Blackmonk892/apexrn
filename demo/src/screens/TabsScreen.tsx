import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/components/tabs';

export default function TabsScreen({ onBack }: { onBack: () => void }) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  const [tab1, setTab1] = useState('one');
  const [tab2, setTab2] = useState('account');

  return (
    <Layout title="TABS COMPONENT" onBack={onBack}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>DEFAULT TABS (2 ITEMS)</Text>
        <Tabs value={tab1} onValueChange={setTab1}>
          <TabsList>
            <TabsTrigger value="one">Profile</TabsTrigger>
            <TabsTrigger value="two">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="one">
            <View style={[styles.contentBox, { backgroundColor: isDark ? '#111' : '#FFF' }]}>
              <Text style={{ color: textColor }}>This is your profile content block.</Text>
            </View>
          </TabsContent>
          <TabsContent value="two">
            <View style={[styles.contentBox, { backgroundColor: isDark ? '#111' : '#FFF' }]}>
              <Text style={{ color: textColor }}>Manage your settings here.</Text>
            </View>
          </TabsContent>
        </Tabs>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>TABS (3 ITEMS + DISABLED STATE)</Text>
        <Tabs value={tab2} onValueChange={setTab2}>
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="admin" disabled>Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <View style={[styles.contentBox, { backgroundColor: isDark ? '#111' : '#FFF' }]}>
              <Text style={{ color: textColor }}>Account overview.</Text>
            </View>
          </TabsContent>
          <TabsContent value="billing">
            <View style={[styles.contentBox, { backgroundColor: isDark ? '#111' : '#FFF' }]}>
              <Text style={{ color: textColor }}>Billing details.</Text>
            </View>
          </TabsContent>
          <TabsContent value="admin">
            <View style={[styles.contentBox, { backgroundColor: isDark ? '#111' : '#FFF' }]}>
              <Text style={{ color: textColor }}>You cannot see this.</Text>
            </View>
          </TabsContent>
        </Tabs>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 36 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 1 },
  contentBox: {
    padding: 24,
    borderWidth: 2,
    borderColor: '#000',
    marginTop: 16,
  },
});
