import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AlertDialog, Button } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function AlertDialogScreen({ onBack }: { onBack: () => void }) {
  const [log, setLog] = useState('none');
  const [open, setOpen] = useState(false);

  return (
    <Layout title="ALERT DIALOG" onBack={onBack}>
      <Section
        title="Destructive (default)"
        note="Tapping the backdrop does nothing: the user has to choose. The Android back button and Escape count as Cancel."
      >
        <View style={styles.row}>
          <AlertDialog
            title="Delete account?"
            description="All your data is removed immediately. You cannot undo this."
            actionText="Delete account"
            onCancel={() => setLog('cancel')}
            onAction={() => setLog('delete')}
          >
            <Button title="Delete account" variant="destructive" />
          </AlertDialog>
        </View>
        <Caption>{`Last choice: ${log}`}</Caption>
      </Section>

      <Section title="Non-destructive action" note="destructive={false} styles the action as a primary button.">
        <View style={styles.row}>
          <AlertDialog
            title="Sign out?"
            description="You will need your password to sign in again."
            cancelText="Stay signed in"
            actionText="Sign out"
            destructive={false}
            onCancel={() => setLog('stay')}
            onAction={() => setLog('sign out')}
          >
            <Button title="Sign out" variant="outline" />
          </AlertDialog>
        </View>
      </Section>

      <Section title="Controlled" note="open + onOpenChange, opened from code.">
        <View style={styles.row}>
          <Button title="Open from code" variant="primary" onPress={() => setOpen(true)} />
        </View>
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="Discard changes?"
          description="Your edits have not been saved."
          cancelText="Keep editing"
          actionText="Discard"
          onAction={() => setLog('discard')}
          onCancel={() => setLog('keep editing')}
        />
      </Section>

      <Section title="Edge cases" note="Long button labels wrap onto separate rows on narrow screens.">
        <View style={styles.row}>
          <AlertDialog
            title="Title only"
            cancelText="Go back without changing anything"
            actionText="Continue anyway"
            destructive={false}
          >
            <Button title="No description" variant="outline" />
          </AlertDialog>
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
});
