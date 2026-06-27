import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
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
    <View style={[styles.root, currentStyles.root]}>
      {/* Top Header Bar */}
      <View style={[styles.header, currentStyles.header]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <Pressable onPress={onBack} style={styles.backButton}>
              <Text style={currentStyles.text}>← BACK</Text>
            </Pressable>
          )}
          <Text style={[styles.headerTitle, currentStyles.text]}>{title}</Text>
        </View>
        
        {/* Universal Switcher Button */}
        <Pressable onPress={toggleTheme} style={styles.themeToggle}>
          <Text style={styles.toggleText}>{isDark ? '☀️ LIGHT' : '🌙 DARK'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
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
  root: { backgroundColor: '#121212' },
  header: { backgroundColor: '#1E1E1E', borderBottomColor: '#FFFFFF' },
  text: { color: '#FFFFFF' },
});