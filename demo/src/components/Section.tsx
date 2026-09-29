import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderWidths, useTheme } from '@apexrn/ui';

/** Titled block used by every component demo so variants/sizes/states read the same way. */
export default function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={[styles.head, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {note ? <Text style={[styles.note, { color: colors.mutedForeground }]}>{note}</Text> : null}
      {children}
    </View>
  );
}

/** Small caption under a specimen. */
export function Caption({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.caption, { color: colors.mutedForeground }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  section: { marginTop: 28, gap: 12 },
  head: { borderBottomWidth: borderWidths.standard, paddingBottom: 6 },
  title: { fontSize: 14, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  note: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '700' },
});
