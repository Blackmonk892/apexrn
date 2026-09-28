import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShowcaseTheme } from '../context/ThemeContext';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}

export default function Layout({ title, children, onBack }: LayoutProps) {
  const { isDark, toggleTheme } = useShowcaseTheme();
  const currentStyles = isDark ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.root, currentStyles.root]} edges={['top', 'bottom']}>
      {/* Top Header Bar */}
      <View style={[styles.header, currentStyles.header]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <Pressable
              onPress={onBack}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the component list"
            >
              <Text style={currentStyles.text}>← BACK</Text>
            </Pressable>
          )}
          <Text style={[styles.headerTitle, currentStyles.text]}>{title}</Text>
        </View>

        {/* Universal Switcher Button */}
        <Pressable
          onPress={toggleTheme}
          style={styles.themeToggle}
          accessibilityRole="button"
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          <Text style={styles.toggleText}>{isDark ? '☀️ LIGHT' : '🌙 DARK'}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
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
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  themeToggle: {
    backgroundColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  toggleText: { color: '#FFF', fontWeight: '800', fontSize: 11 },
  container: { padding: 20, paddingBottom: 60 },
});

const lightStyles = StyleSheet.create({
  root: { backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#F0F0F0', borderBottomColor: '#000000' },
  text: { color: '#000000' },
});

const darkStyles = StyleSheet.create({
  root: { backgroundColor: '#1A1A1A' },
  header: { backgroundColor: '#2A2A2A', borderBottomColor: '#FFFFFF' },
  text: { color: '#FFFFFF' },
});
