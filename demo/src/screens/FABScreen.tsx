import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, FAB, Text, borderWidths, spacing, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

/** A bounded stage: the FAB is absolutely positioned, so it needs a positioned parent to sit in. */
function Stage({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.stage, { borderColor: colors.border, backgroundColor: colors.muted }]}>{children}</View>;
}

function Plus({ disabled }: { disabled?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text variant="title" tone="inherit" style={{ color: disabled ? colors.mutedForeground : colors.primaryForeground }}>
      +
    </Text>
  );
}

export default function FABScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState('None yet');
  const [shown, setShown] = useState(true);
  const log = (name: string) => () => setEvent(name);

  return (
    <Layout
      id="fab"
      title="FAB"
      onBack={onBack}
      overlay={
        <FAB
          testID="fab-compose"
          accessibilityLabel="Compose a note"
          icon={<Plus />}
          label="Compose"
          insets={{ bottom: insets.bottom, right: insets.right }}
          onPress={log('Composed')}
        />
      }
    >
      <View style={styles.log}>
        <Text variant="label" tone="muted">
          Event log
        </Text>
        <Text variant="mono" testID="fab-log">
          {event}
        </Text>
      </View>

      <Section title="Variants" note="Icon only, and extended with a sentence-case label.">
        <Stage>
          <FAB accessibilityLabel="Add item" icon={<Plus />} onPress={log('Added')} />
        </Stage>
        <Stage>
          <FAB accessibilityLabel="New note" icon={<Plus />} label="New note" onPress={log('New note')} />
        </Stage>
      </Section>

      <Section title="Placement" note="Edge offset is fixed; pass insets so it clears the home indicator and rounded corners.">
        <Stage>
          <FAB accessibilityLabel="Add item, bottom left" icon={<Plus />} placement="bottom-left" />
        </Stage>
        <Stage>
          <FAB accessibilityLabel="Add item, bottom center" icon={<Plus />} placement="bottom-center" />
        </Stage>
        <Stage>
          <FAB accessibilityLabel="Add item, with insets" icon={<Plus />} insets={{ bottom: 24, right: 24 }} />
        </Stage>
      </Section>

      <Section title="States" note="Disabled sits flat and dashed. Hidden leaves the accessibility tree and ignores touches.">
        <Stage>
          <FAB disabled accessibilityLabel="Add item, unavailable" icon={<Plus disabled />} />
        </Stage>
        <Stage>
          <FAB visible={shown} accessibilityLabel="Add item, toggled" icon={<Plus />} label="Add item" />
        </Stage>
        <Button
          variant="outline"
          title={shown ? 'Hide the button' : 'Show the button'}
          onPress={() => setShown((v) => !v)}
        />
      </Section>

      <Section title="In context" note="The Compose button at the bottom right of this screen is a real overlay, placed with the device insets.">
        <Text tone="muted">Tap it and the event log above reads Composed.</Text>
      </Section>

      <Section title="Edge cases" note="A label longer than the stage truncates to one line instead of overflowing.">
        <Stage>
          <FAB
            accessibilityLabel="Start a new conversation with the whole team"
            icon={<Plus />}
            label="Start a new conversation with the whole team"
          />
        </Stage>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stage: { height: 140, borderWidth: borderWidths.control, overflow: 'hidden' },
  log: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
