import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function AlertDialogScreen({ onBack }: { onBack: () => void }) {
  const [log, setLog] = useState('none');
  const [open, setOpen] = useState(false);

  return (
    <Layout id="alertdialog" title="ALERT DIALOG" onBack={onBack}>
      <Section
        title="Destructive (default)"
        note="Tapping the backdrop does nothing: the user has to choose. The Android back button and Escape count as Cancel."
      >
        <View style={styles.row}>
          <AlertDialog
            title="Delete account?"
            description="All your data is removed immediately. You cannot undo this."
            actionText="Delete account"
            onCancel={() => setLog('Cancelled')}
            onAction={() => setLog('Confirmed')}
          >
            <Button title="Delete account" variant="destructive" testID="alertdialog-open" />
          </AlertDialog>
        </View>
        <Caption>{`Last choice: ${log}`}</Caption>
      </Section>

      <Section title="Non-destructive action" note="destructive={false} styles the action as a primary button and drops the title icon.">
        <View style={styles.row}>
          <AlertDialog
            title="Sign out?"
            description="You will need your password to sign in again."
            cancelText="Stay signed in"
            actionText="Sign out"
            destructive={false}
            onCancel={() => setLog('Stayed signed in')}
            onAction={() => setLog('Signed out')}
          >
            <Button title="Sign out" variant="outline" />
          </AlertDialog>
        </View>
      </Section>

      <Section title="Compound parts" note="The same parts the convenience props are built from.">
        <View style={styles.row}>
          <AlertDialog destructive onCancel={() => setLog('Kept the project')}>
            <AlertDialogTrigger asChild>
              <Button title="Archive project" variant="outline" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive this project?</AlertDialogTitle>
                <AlertDialogDescription>Members lose access until you restore it from settings.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel title="Keep project" />
                <AlertDialogAction title="Archive" onPress={() => setLog('Archived')} />
              </AlertDialogFooter>
            </AlertDialogContent>
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
          onAction={() => setLog('Discarded')}
          onCancel={() => setLog('Kept editing')}
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
