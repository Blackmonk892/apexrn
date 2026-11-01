import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AlertDialog,
  AppBar,
  Button,
  Label,
  ListItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Switch,
  Text,
  spacing,
} from '@apexrn/ui';
import Layout from '../../components/Layout';

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [sync, setSync] = useState(true);
  const [language, setLanguage] = useState('en');
  const [deleted, setDeleted] = useState(false);

  return (
    <Layout id="ref-settings" title="SETTINGS" onBack={onBack}>
      <View style={styles.page}>
        <AppBar title="Settings" subtitle="Maya Okafor" />

        <View style={styles.group}>
          <Label>Notifications</Label>
          <Separator />
          <ListItem
            title="Push notifications"
            description="Messages and mentions"
            trailing={<Switch checked={push} onCheckedChange={setPush} accessibilityLabel="Push notifications" testID="ref-switch-push" />}
          />
          <Separator />
          <ListItem
            title="Email digest"
            description="One summary each morning"
            trailing={<Switch checked={email} onCheckedChange={setEmail} accessibilityLabel="Email digest" />}
          />
          <Separator />
        </View>

        <View style={styles.group}>
          <Label>Preferences</Label>
          <Separator />
          <ListItem
            title="Sync over mobile data"
            description="Off keeps syncing to Wi-Fi"
            trailing={<Switch checked={sync} onCheckedChange={setSync} accessibilityLabel="Sync over mobile data" />}
          />
          <Separator />
          <View style={styles.field}>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger label="Language" testID="ref-select-language" />
              <SelectContent title="Language">
                <SelectItem label="English" value="en" />
                <SelectItem label="Deutsch" value="de" />
                <SelectItem label="Español" value="es" />
                <SelectItem label="Français" value="fr" />
              </SelectContent>
            </Select>
          </View>
          <Separator />
        </View>

        <View style={styles.group}>
          <Label>Danger zone</Label>
          <Separator />
          <ListItem title="Export my data" description="A ZIP of your messages and files" meta="48 MB" onPress={() => {}} />
          <Separator />
          <View style={styles.field}>
            <AlertDialog
              title="Delete account"
              description="This removes your messages, files and subscriptions. You cannot undo it."
              actionText="Delete account"
              onAction={() => setDeleted(true)}
            >
              <Button variant="destructive" testID="ref-delete-account">
                Delete account
              </Button>
            </AlertDialog>
            {deleted ? (
              <Text variant="mono" tone="muted" testID="ref-settings-log">
                Deletion requested
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  group: { gap: spacing.sm },
  field: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, gap: spacing.sm },
});
