import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function DropdownScreen({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState('none');

  return (
    <Layout title="DROPDOWN MENU" onBack={onBack}>
      <Section title="Uncontrolled" note="Anchored under the trigger. Close with an item, the backdrop, Android back or Escape.">
        <View style={styles.row}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button title="Actions" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem label="Edit profile" onPress={() => setPicked('edit')} />
              <DropdownMenuItem label="Account settings" onPress={() => setPicked('settings')} />
              <DropdownMenuItem label="Log out" onPress={() => setPicked('logout')} />
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
        <Caption>{`Last item: ${picked}`}</Caption>
      </Section>

      <Section title="Controlled, custom trigger" note="open + onOpenChange with an avatar as the trigger.">
        <View style={styles.row}>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="Open profile menu">
                <Avatar initials="JD" size="lg" withShadow />
              </Pressable>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem label="View profile" description="Public page" />
              <DropdownMenuItem label="Status" trailing={<Badge variant="accent" label="Away" />} />
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
        <Caption>{open ? 'State: open' : 'State: closed'}</Caption>
      </Section>

      <Section title="Disabled item" note="A disabled item is muted and does not close the menu.">
        <View style={styles.row}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button title="File" variant="outline" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem label="Open" />
              <DropdownMenuItem label="Save" />
              <DropdownMenuItem label="Export (unavailable)" disabled />
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </Section>

      <Section title="Edge cases" note="Twelve items exceed the 320pt maximum, so the menu scrolls. Near the bottom of the screen it opens upward.">
        <View style={styles.row}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button title="Long menu" variant="primary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Array.from({ length: 12 }, (_, i) => (
                <DropdownMenuItem key={i} label={`Option ${i + 1}`} />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
});
