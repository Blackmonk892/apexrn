import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Toast, Toaster, useToast } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

type Kind = 'default' | 'primary' | 'destructive' | 'success' | 'warning' | 'long' | 'short';

const CONTENT: Record<Kind, { title: string; description?: string; variant: 'default' | 'primary' | 'destructive' | 'success' | 'warning'; duration?: number }> = {
  default: { title: 'File uploaded', description: 'report.pdf is ready to share.', variant: 'default' },
  primary: { title: 'Achievement unlocked', description: 'You finished your first task.', variant: 'primary' },
  destructive: { title: 'Could not save', description: 'Check your connection and try again.', variant: 'destructive' },
  success: { title: 'Profile saved', description: 'Your changes are live.', variant: 'success' },
  warning: { title: 'Storage almost full', description: '92% of your space is used.', variant: 'warning' },
  long: {
    title: 'A notification title that is long enough to wrap across two lines and then stop',
    description: 'The description can take three lines before it is clipped, so a long explanation still fits inside the toast without pushing past the screen edge.',
    variant: 'default',
  },
  short: { title: 'Quick one', variant: 'primary', duration: 1200 },
};

// The one-liner most apps want: no visible state, just call toast().
function ImperativeDemo() {
  const toast = useToast();
  return (
    <Section title="toast() API" note="Wrap the app in <Toaster>, then call toast('Saved') from anywhere. Rapid calls queue, one on screen at a time.">
      <View style={styles.row}>
        <Button title="toast('Saved')" size="sm" onPress={() => toast('Saved')} />
        <Button title="success" size="sm" onPress={() => toast.success('Uploaded', 'report.pdf is ready.')} />
        <Button title="error" size="sm" variant="destructive" onPress={() => toast.error('Could not save')} />
        <Button title="Queue 3" size="sm" variant="outline" onPress={() => { toast('One'); toast('Two'); toast.warning('Three'); }} />
      </View>
    </Section>
  );
}

export default function ToastScreen(props: { onBack: () => void }) {
  return (
    <Toaster>
      <ControlledToastScreen {...props} />
    </Toaster>
  );
}

function ControlledToastScreen({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState<Kind | null>(null);
  const [dismissals, setDismissals] = useState(0);
  const content = active ? CONTENT[active] : CONTENT.default;

  return (
    <Layout
      title="TOAST"
      onBack={onBack}
      overlay={
        <Toast
          visible={active !== null}
          title={content.title}
          description={content.description}
          variant={content.variant}
          duration={content.duration}
          onDismiss={() => {
            setActive(null);
            setDismissals((n) => n + 1);
          }}
        />
      }
    >
      <Section title="Variants" note="Slides in from the top, dismisses itself after 3 seconds, or on tap. Destructive adds an error glyph and is announced as an error.">
        <View style={styles.row}>
          <Button title="Default" onPress={() => setActive('default')} />
          <Button title="Primary" variant="primary" onPress={() => setActive('primary')} />
          <Button title="Destructive" variant="destructive" onPress={() => setActive('destructive')} />
          <Button title="Success" onPress={() => setActive('success')} />
          <Button title="Warning" onPress={() => setActive('warning')} />
        </View>
        <Caption>{`onDismiss calls: ${dismissals}`}</Caption>
      </Section>

      <ImperativeDemo />

      <Section title="Duration" note="duration in milliseconds: this one lasts 1.2 seconds.">
        <View style={styles.row}>
          <Button title="Quick toast" size="sm" onPress={() => setActive('short')} />
        </View>
      </Section>

      <Section title="Edge cases" note="Long copy is clamped (title 2 lines, description 3). Press the button twice quickly: onDismiss still fires once per showing.">
        <View style={styles.row}>
          <Button title="Long copy" variant="outline" onPress={() => setActive('long')} />
        </View>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
});
