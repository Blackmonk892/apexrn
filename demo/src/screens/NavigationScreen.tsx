import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent, Separator, FAB, Label, InputOTP, Textarea, useTheme } from '@apexrn/ui';

export default function NavigationScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const textColor = colors.foreground;

  const [tabValue, setTabValue] = useState('tab1');
  const [otp, setOtp] = useState('');

  return (
    <Layout title="NAV & LAYOUT" onBack={onBack}>
      <Text style={[styles.label, { color: textColor }]}>TABS</Text>
      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList>
          <TabsTrigger value="tab1">Home</TabsTrigger>
          <TabsTrigger value="tab2">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <Text style={{ marginTop: 12, color: textColor }}>Home content goes here.</Text>
        </TabsContent>
        <TabsContent value="tab2">
          <Text style={{ marginTop: 12, color: textColor }}>Settings content goes here.</Text>
        </TabsContent>
      </Tabs>

      <Text style={[styles.label, { color: textColor }]}>SEPARATOR</Text>
      <Text style={{ color: textColor }}>Above</Text>
      <Separator style={{ marginVertical: 12 }} />
      <Text style={{ color: textColor }}>Below</Text>

      <Text style={[styles.label, { color: textColor }]}>LABEL</Text>
      <Label>Standard Label</Label>
      <Label disabled>Disabled Label</Label>

      <Text style={[styles.label, { color: textColor }]}>INPUT OTP</Text>
      <InputOTP value={otp} onChangeText={setOtp} length={4} />

      <Text style={[styles.label, { color: textColor }]}>TEXTAREA</Text>
      <Textarea placeholder="Type your message..." />

      {/* FAB is absolute positioned */}
      <FAB label="+" onPress={() => console.log('FAB pressed')} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginTop: 24, marginBottom: 12, letterSpacing: 1 },
});
