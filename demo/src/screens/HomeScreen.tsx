import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Layout from '../components/Layout';
import { useShowcaseTheme } from '../context/ThemeContext';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { isDark } = useShowcaseTheme();
  const textColor = isDark ? '#FFF' : '#000';

  // Component registry menu options
  const componentsList = [
    { id: 'button', name: '🔴 BUTTONS' },
    { id: 'card', name: '📦 CARDS' },
    { id: 'forms', name: '📝 FORMS & INPUTS (BATCH)' },
    { id: 'feedback', name: '🔔 FEEDBACK (BATCH)' },
    { id: 'display', name: '🖼️ DATA DISPLAY (BATCH)' },
    { id: 'overlay', name: '✨ OVERLAYS & MENUS (BATCH)' },
    { id: 'navigation', name: '🧭 NAV & LAYOUT (BATCH)' },
    { id: 'input', name: '⌨️ INPUT' },
    { id: 'checkbox', name: '☑️ CHECKBOX' },
    { id: 'radiogroup', name: '🔘 RADIO GROUP' },
    { id: 'switch', name: '🎚️ SWITCH' },
    { id: 'slider', name: '🎛️ SLIDER' },
    { id: 'badge', name: '🏷️ BADGE' },
    { id: 'progress', name: '📊 PROGRESS' },
    { id: 'skeleton', name: '🦴 SKELETON' },
    { id: 'alert', name: '⚠️ ALERT' },
    { id: 'toast', name: '🍞 TOAST' },
    { id: 'avatar', name: '👤 AVATAR' },
    { id: 'accordion', name: '📚 ACCORDION' },
    { id: 'carousel', name: '🎠 CAROUSEL' },
    { id: 'marquee', name: '🏎️ MARQUEE' },
    { id: 'listitem', name: '📃 LIST ITEM' },
    { id: 'dialog', name: '💬 DIALOG' },
    { id: 'sheet', name: '🗂️ SHEET' },
    { id: 'dropdown', name: '🔽 DROPDOWN MENU' },
    { id: 'select', name: '📋 SELECT' },
    { id: 'datepicker', name: '📅 DATE PICKER' },
    { id: 'tabs', name: '📑 TABS' },
    { id: 'separator', name: '➖ SEPARATOR' },
    { id: 'fab', name: '➕ FAB' },
    { id: 'label', name: '🏷️ LABEL' },
    { id: 'input_otp', name: '🔢 INPUT OTP' },
    { id: 'textarea', name: '📝 TEXTAREA' },
  ];

  return (
    <Layout title="APEXRN SHOWCASE">
      <Text style={[styles.subtitle, { color: isDark ? '#AAA' : '#757575' }]}>
        BRUTALISM COMPONENT PLAYGROUND
      </Text>
      
      <View style={styles.menuList}>
        {componentsList.map((item) => (
          <Pressable 
            key={item.id} 
            style={[styles.menuItem, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]} 
            onPress={() => onNavigate(item.id)}
          >
            <Text style={[styles.menuText, { color: textColor }]}>{item.name}</Text>
            <Text style={{ color: textColor, fontWeight: '900' }}>→</Text>
          </Pressable>
        ))}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 24 },
  menuList: { gap: 16 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  menuText: { fontSize: 16, fontWeight: '900' },
});