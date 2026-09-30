import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { borderWidths, touchTarget, useTheme } from '@apexrn/ui';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  /** Rendered above the scroll area (toasts, FABs): positioned against the screen, not the scroll content. */
  overlay?: React.ReactNode;
}

/** Demo chrome. Every colour comes from the library theme, so a broken theme looks broken here. */
export default function Layout({ title, children, onBack, overlay }: LayoutProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  const isEmbed = typeof window !== 'undefined' && (window.location.search.includes('embed=1') || window.location.search.includes('frame=0'));

  if (isEmbed) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={[styles.container, { padding: 14 }]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {overlay}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.muted, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <Pressable
              onPress={onBack}
              style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the component list"
            >
              <Text style={[styles.chipText, { color: colors.foreground }]}>← BACK</Text>
            </Pressable>
          )}
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <Pressable
          onPress={toggleTheme}
          style={[styles.chip, { backgroundColor: colors.foreground, borderColor: colors.border }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          <Text style={[styles.chipText, { color: colors.background }]}>{isDark ? 'LIGHT' : 'DARK'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: borderWidths.heavy,
    gap: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  chip: {
    minHeight: touchTarget - 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: borderWidths.standard,
  },
  chipText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, flexShrink: 1 },
  container: { padding: 20, paddingBottom: 60 },
});
