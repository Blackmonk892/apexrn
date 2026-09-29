import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FAB, borderWidths, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section, { Caption } from '../components/Section';

/** A bounded stage: the FAB is absolutely positioned, so it needs a positioned parent to sit in. */
function Stage({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.stage, { borderColor: colors.border, backgroundColor: colors.muted }]}>{children}</View>;
}

export default function FABScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const [count, setCount] = useState(0);
  const plus = <Text style={[styles.plus, { color: colors.primaryForeground }]}>+</Text>;

  return (
    <Layout title="FAB" onBack={onBack}>
      <Section title="Icon" note="Anchored bottom-right of its parent. Override position with style.">
        <Stage>
          <FAB accessibilityLabel="Add item" onPress={() => setCount((n) => n + 1)}>
            {plus}
          </FAB>
        </Stage>
        <Caption>{`Presses: ${count}`}</Caption>
      </Section>

      <Section title="Extended" note="A label makes the button extend horizontally.">
        <Stage>
          <FAB label="New note" onPress={() => setCount((n) => n + 1)} />
        </Stage>
      </Section>

      <Section title="Size" note="size sets the side length of the icon button.">
        <Stage>
          <FAB size={72} accessibilityLabel="Add item (large)" style={styles.second}>
            {plus}
          </FAB>
          <FAB size={48} accessibilityLabel="Add item (small)">
            {plus}
          </FAB>
        </Stage>
      </Section>

      <Section title="Disabled">
        <Stage>
          <FAB disabled accessibilityLabel="Add item (unavailable)">
            <Text style={[styles.plus, { color: colors.mutedForeground }]}>+</Text>
          </FAB>
        </Stage>
        <Caption>Muted fill, no shadow, not pressable.</Caption>
      </Section>
    </Layout>
  );
}

const styles = StyleSheet.create({
  stage: { height: 150, borderWidth: borderWidths.standard, overflow: 'hidden' },
  second: { right: 110 },
  plus: { fontSize: 28, fontWeight: '900', lineHeight: 32 },
});
