import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Input,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Text,
} from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

export default function SheetScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [shareOpen, setShareOpen] = useState(false);
  const [lastEvent, setLastEvent] = useState('none');
  const note = (name: string) => (open: boolean) => setLastEvent(`${name} ${open ? 'opened' : 'closed'}`);

  return (
    <Layout id="sheet" title="SHEET" onBack={onBack}>
      <Section
        title="Uncontrolled"
        note="Drag the handle down, tap the scrim, press back, or use a close button."
      >
        <Sheet onOpenChange={note('Order sheet')}>
          <SheetTrigger asChild>
            <Button title="Open order" testID="sheet-open" />
          </SheetTrigger>
          <SheetContent sheetHeight={320} bottomInset={insets.bottom} testID="sheet-panel">
            <SheetHeader>
              <SheetTitle>Order 4821</SheetTitle>
              <Text tone="muted">Packed at 09:40, leaves the depot at 11:15.</Text>
            </SheetHeader>
            <SheetFooter>
              <SheetClose asChild>
                <Button title="Done" testID="sheet-done" />
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Section>

      <Section title="Controlled" note="The parent owns open and onOpenChange.">
        <View style={{ flexDirection: 'row' }}>
          <Button title="Share link" variant="outline" onPress={() => setShareOpen(true)} />
        </View>
        <Sheet
          open={shareOpen}
          onOpenChange={(o) => {
            setShareOpen(o);
            note('Share sheet')(o);
          }}
        >
          <SheetContent sheetHeight={300} bottomInset={insets.bottom} scrimOpacity={0.7}>
            <SheetHeader>
              <SheetTitle>Share this report</SheetTitle>
            </SheetHeader>
            <Input placeholder="Recipient email" keyboardType="email-address" autoCapitalize="none" />
            <SheetFooter style={{ marginTop: 16 }}>
              <SheetClose asChild>
                <Button title="Send" />
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Section>

      <Section title="Edge cases" note="A 5000pt request is capped at 90% of the window.">
        <Sheet>
          <SheetTrigger asChild>
            <Button title="Oversized sheet" variant="destructive" />
          </SheetTrigger>
          <SheetContent sheetHeight={5000} bottomInset={insets.bottom}>
            <SheetHeader>
              <SheetTitle>Delivery window for the northern route including weekend overrides</SheetTitle>
            </SheetHeader>
            <SheetFooter>
              <SheetClose asChild>
                <Button title="Close" />
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Section>

      <Section title="Event log">
        <Text variant="mono" testID="sheet-log">{`Last: ${lastEvent}`}</Text>
      </Section>
    </Layout>
  );
}
