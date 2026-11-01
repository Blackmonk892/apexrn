import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Text,
  spacing,
} from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function CardScreen({ onBack }: { onBack: () => void }) {
  const [log, setLog] = useState('Opened: none');

  return (
    <Layout id="card" title="CARD" onBack={onBack}>
      <Section
        title="Variants"
        note="Status cards add a top rule in the status colour, and an icon and word in the header."
      >
        <View style={styles.stack}>
          <Card testID="card-default">
            <CardHeader>
              <CardTitle>Workspace backup</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Last run finished at 02:14 and saved 1,204 files.</CardDescription>
            </CardContent>
          </Card>
          <Card variant="success" testID="card-success">
            <CardHeader>
              <CardTitle>Payment received</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Invoice 2041 was settled in full.</CardDescription>
            </CardContent>
          </Card>
          <Card variant="warning" testID="card-warning">
            <CardHeader>
              <CardTitle>Storage almost full</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>4.6 of 5 GB used. Exports stop at the limit.</CardDescription>
            </CardContent>
          </Card>
          <Card variant="destructive" testID="card-destructive">
            <CardHeader>
              <CardTitle>Sync failed</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>The server rejected the last 3 changes.</CardDescription>
            </CardContent>
          </Card>
        </View>
      </Section>

      <Section title="States" note="A card with onPress sinks and reports as a button. Disabled is dashed and flat.">
        <View style={styles.stack}>
          <Card
            onPress={() => setLog('Opened: Release notes')}
            accessibilityLabel="Open release notes"
            accessibilityHint="Opens the release notes"
            testID="card-press"
          >
            <CardHeader>
              <CardTitle>Release notes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>See what changed in version 2.0.</CardDescription>
            </CardContent>
          </Card>
          <Card disabled onPress={() => setLog('Opened: Archive')} accessibilityLabel="Open archive">
            <CardHeader>
              <CardTitle>Archive</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Unavailable while a sync is running.</CardDescription>
            </CardContent>
          </Card>
        </View>
        <Text variant="mono" testID="card-log">{log}</Text>
      </Section>

      <Section title="In context" note="Header and footer rules run edge to edge; the card owns the one shadow.">
        <Card>
          <CardHeader>
            <CardTitle>Pro plan</CardTitle>
            <CardDescription>Billed monthly, cancel any time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Text variant="mono">EUR 9.00 / month</Text>
            <View style={styles.row}>
              <Badge variant="accent" label="Popular" />
              <Badge variant="outline" label="14-day trial" />
            </View>
          </CardContent>
          <CardFooter>
            <Button title="Start trial" variant="primary" />
          </CardFooter>
        </Card>
      </Section>

      <Section title="Edge cases">
        <View style={styles.narrow}>
          <Card variant="warning">
            <CardHeader>
              <CardTitle>A card title that is far too long for a narrow container</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Description text wraps inside the border.</CardDescription>
            </CardContent>
          </Card>
        </View>
        <Text variant="body" tone="muted">Title and description wrap inside a 220pt container.</Text>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  narrow: { width: 220 },
});
