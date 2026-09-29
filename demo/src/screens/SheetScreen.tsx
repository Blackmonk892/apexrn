import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Input, Sheet, SheetContent, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

export default function SheetScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [tallOpen, setTallOpen] = useState(false);
  const [changes, setChanges] = useState<string[]>([]);
  const log = (name: string) => (open: boolean) => setChanges((c) => [`${name}: ${open ? 'open' : 'closed'}`, ...c].slice(0, 4));
  const heading = [styles.heading, { color: colors.foreground }];
  const body = [styles.body, { color: colors.foreground }];

  return (
    <Layout title="SHEET" onBack={onBack}>
      <Section
        title="Standard"
        note="Slides up from the bottom. Close with the button, the backdrop, a downward drag, the Android back button or Escape."
      >
        <View style={styles.row}>
          <Button title="Open sheet" onPress={() => setMenuOpen(true)} />
        </View>
        <Sheet
          open={menuOpen}
          onOpenChange={(o) => {
            setMenuOpen(o);
            log('menu')(o);
          }}
        >
          {({ handleDismiss }) => (
            <SheetContent sheetHeight={300}>
              <Text style={heading}>Menu</Text>
              <Text style={body}>Drag the handle down, tap outside, or press the button.</Text>
              <Button title="Close sheet" onPress={handleDismiss} style={styles.gap} />
            </SheetContent>
          )}
        </Sheet>
        <Caption>{changes.length ? changes.join('  |  ') : 'No changes yet'}</Caption>
      </Section>

      <Section title="With inputs" note="The sheet lifts above the keyboard.">
        <View style={styles.row}>
          <Button title="Edit profile" variant="outline" onPress={() => setFormOpen(true)} />
        </View>
        <Sheet open={formOpen} onOpenChange={setFormOpen}>
          {({ handleDismiss }) => (
            <SheetContent sheetHeight={460}>
              <Text style={heading}>Edit profile</Text>
              <View style={styles.form}>
                <Input placeholder="Username" />
                <Input placeholder="Email address" keyboardType="email-address" autoCapitalize="none" />
              </View>
              <Button title="Save changes" variant="primary" onPress={handleDismiss} style={styles.gap} />
            </SheetContent>
          )}
        </Sheet>
      </Section>

      <Section title="Edge cases" note="A sheetHeight taller than the screen is capped at 90% of the window height.">
        <View style={styles.row}>
          <Button title="Oversized sheet" variant="destructive" onPress={() => setTallOpen(true)} />
        </View>
        <Sheet open={tallOpen} onOpenChange={setTallOpen}>
          {({ handleDismiss }) => (
            <SheetContent sheetHeight={5000}>
              <Text style={heading}>Capped</Text>
              <Text style={body}>Requested 5000pt; rendered at most 90% of the window.</Text>
              <Button title="Close" onPress={handleDismiss} style={styles.gap} />
            </SheetContent>
          )}
        </Sheet>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  heading: { fontSize: 22, fontWeight: '900', textTransform: 'uppercase' },
  body: { fontSize: 15, lineHeight: 21, marginTop: 8, fontWeight: '500' },
  form: { gap: 16, marginTop: 20 },
  gap: { marginTop: 24 },
});
