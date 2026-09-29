import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function DialogScreen({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState(false);
  const [interactions, setInteractions] = useState(0);

  return (
    <Layout title="DIALOG" onBack={onBack}>
      <Section title="Uncontrolled" note="DialogTrigger asChild wraps your own button. Close with the backdrop, Android back or Escape.">
        <View style={styles.row}>
          <Dialog>
            <DialogTrigger asChild>
              <Button title="Open dialog" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Welcome back</DialogTitle>
                <DialogDescription>Nothing else needs your attention right now.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </View>
      </Section>

      <Section title="Controlled, with actions" note="open + onOpenChange; the footer holds the actions.">
        <View style={styles.row}>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button title="Delete file" variant="outline" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this file?</DialogTitle>
                <DialogDescription>You cannot undo this. The file is removed for everyone with access.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button title="Cancel" variant="outline" size="sm" onPress={() => setOpen(false)} />
                <Button title="Delete" variant="destructive" size="sm" onPress={() => setOpen(false)} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </View>
        <Caption>{open ? 'State: open' : 'State: closed'}</Caption>
      </Section>

      <Section title="defaultOpen and onInteractOutside" note="A backdrop tap calls onInteractOutside instead of closing. Close it with the button.">
        <View style={styles.row}>
          <Dialog>
            <DialogTrigger asChild>
              <Button title="Open locked dialog" variant="primary" />
            </DialogTrigger>
            <DialogContent onInteractOutside={() => setInteractions((n) => n + 1)}>
              <DialogHeader>
                <DialogTitle>Locked</DialogTitle>
                <DialogDescription>Tapping outside does not close this one.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button title="Stay" size="sm" variant="outline" />
                </DialogTrigger>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </View>
        <Caption>{`Outside taps: ${interactions}`}</Caption>
      </Section>

      <Section title="Edge cases" note="Long title and description wrap inside the 400pt maximum width.">
        <View style={styles.row}>
          <Dialog>
            <DialogTrigger asChild>
              <Button title="Open long dialog" variant="outline" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>A dialog title that is long enough to wrap onto several lines</DialogTitle>
                <DialogDescription>
                  The description also wraps. The dialog grows with its content and stays centred with its hard
                  shadow inside the screen edge, even on a 320pt wide device.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
});
