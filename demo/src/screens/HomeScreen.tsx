import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrutalSurface, useTheme } from '@apexrn/ui';
import Layout from '../components/Layout';
import Section from '../components/Section';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

// One entry per component demo, in dependency order (plan §5.3).
const GROUPS: { title: string; items: { id: string; name: string }[] }[] = [
  {
    title: 'Atoms',
    items: [
      { id: 'button', name: 'Button' },
      { id: 'label', name: 'Label' },
      { id: 'separator', name: 'Separator' },
      { id: 'badge', name: 'Badge' },
      { id: 'avatar', name: 'Avatar' },
      { id: 'skeleton', name: 'Skeleton' },
      { id: 'progress', name: 'Progress' },
      { id: 'alert', name: 'Alert' },
      { id: 'card', name: 'Card' },
      { id: 'listitem', name: 'List item' },
      { id: 'fab', name: 'FAB' },
    ],
  },
  {
    title: 'Inputs',
    items: [
      { id: 'input', name: 'Input' },
      { id: 'textarea', name: 'Textarea' },
      { id: 'checkbox', name: 'Checkbox' },
      { id: 'switch', name: 'Switch' },
      { id: 'radiogroup', name: 'Radio group' },
      { id: 'slider', name: 'Slider' },
      { id: 'input_otp', name: 'Input OTP' },
    ],
  },
  {
    title: 'Motion and navigation',
    items: [
      { id: 'marquee', name: 'Marquee' },
      { id: 'carousel', name: 'Carousel' },
      { id: 'accordion', name: 'Accordion' },
      { id: 'tabs', name: 'Tabs' },
      { id: 'toast', name: 'Toast' },
    ],
  },
  {
    title: 'Overlays',
    items: [
      { id: 'sheet', name: 'Sheet' },
      { id: 'dialog', name: 'Dialog' },
      { id: 'alertdialog', name: 'Alert dialog' },
      { id: 'dropdown', name: 'Dropdown menu' },
      { id: 'select', name: 'Select' },
      { id: 'datepicker', name: 'Date picker' },
    ],
  },
  {
    title: 'Older combined screens',
    items: [
      { id: 'forms', name: 'Forms and inputs' },
      { id: 'feedback', name: 'Feedback' },
      { id: 'display', name: 'Data display' },
      { id: 'overlay', name: 'Overlays and menus' },
      { id: 'navigation', name: 'Navigation and layout' },
    ],
  },
];

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { colors } = useTheme();

  return (
    <Layout title="APEXRN">
      <Text style={[styles.lede, { color: colors.foreground }]}>
        Every screen renders the real component from the library barrel, with its variants and states.
      </Text>

      {GROUPS.map((group) => (
        <Section key={group.title} title={group.title}>
          <View style={styles.list}>
            {group.items.map((item) => (
              <BrutalSurface
                key={item.id}
                offset={4}
                onPress={() => onNavigate(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name} demo`}
                surfaceStyle={styles.row}
              >
                <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.arrow, { color: colors.foreground }]}>→</Text>
              </BrutalSurface>
            ))}
          </View>
        </Section>
      ))}
    </Layout>
  );
}

const styles = StyleSheet.create({
  lede: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  list: { gap: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  name: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.4 },
  arrow: { fontSize: 16, fontWeight: '900' },
});
