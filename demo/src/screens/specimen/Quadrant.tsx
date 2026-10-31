import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  ApexRNProvider,
  BackIcon,
  BellIcon,
  CheckIcon,
  CloseIcon,
  HomeIcon,
  InfoIcon,
  MenuIcon,
  SearchIcon,
  Separator,
  Text,
  UserIcon,
  WarningIcon,
  borderWidths,
  textStyles,
  useTheme,
  type IconProps,
  type PresetName,
  type TextVariant,
} from '@apexrn/ui';
import { ColourRoles } from './ColourRoles';
import { DepthStair } from './DepthStair';
import { StateMatrix } from './StateMatrix';

const TYPE: { variant: TextVariant; sample: string }[] = [
  { variant: 'display', sample: 'Ship the parts' },
  { variant: 'title', sample: 'Delete account?' },
  { variant: 'body', sample: 'Changes save when you leave this screen.' },
  { variant: 'label', sample: 'Shipping address' },
  { variant: 'mono', sample: 'AX-014  12.50  2026-10-31' },
];

const ICONS: { name: string; Icon: (p: IconProps) => ReactNode }[] = [
  { name: 'menu', Icon: MenuIcon },
  { name: 'back', Icon: BackIcon },
  { name: 'close', Icon: CloseIcon },
  { name: 'search', Icon: SearchIcon },
  { name: 'check', Icon: CheckIcon },
  { name: 'home', Icon: HomeIcon },
  { name: 'bell', Icon: BellIcon },
  { name: 'user', Icon: UserIcon },
  { name: 'warning', Icon: WarningIcon },
  { name: 'info', Icon: InfoIcon },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="title">{title}</Text>
      {children}
    </View>
  );
}

function TypeScale() {
  return (
    <View style={styles.typeList}>
      {TYPE.map(({ variant, sample }) => {
        const { fontSize, lineHeight, fontWeight } = textStyles[variant];
        return (
          <View key={variant} testID={`type-${variant}`} style={styles.typeRow}>
            <Text variant="mono" tone="muted">{`${variant} ${fontSize}/${lineHeight} ${fontWeight}`}</Text>
            <Text variant={variant}>{sample}</Text>
          </View>
        );
      })}
    </View>
  );
}

function IconSet() {
  const { colors } = useTheme();
  return (
    <View style={styles.iconGrid}>
      {ICONS.map(({ name, Icon }) => (
        <View key={name} style={styles.iconCell}>
          <Icon color={colors.foreground} size={24} />
          <Text variant="mono" tone="muted">{name}</Text>
        </View>
      ))}
    </View>
  );
}

function Sheet({ preset, mode, style }: { preset: PresetName; mode: 'light' | 'dark'; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View
      testID={`quadrant-${preset}-${mode}`}
      style={[styles.sheet, { backgroundColor: colors.background }, style]}
    >
      <View style={styles.head}>
        <Text variant="label" testID={`quadrant-title-${preset}-${mode}`}>{`${preset}  ${mode}`}</Text>
        <Separator style={styles.headRule} />
      </View>
      <Section title="Colour roles"><ColourRoles /></Section>
      <Section title="Type scale"><TypeScale /></Section>
      <Section title="Borders and depth"><DepthStair /></Section>
      <Section title="States"><StateMatrix /></Section>
      <Section title="Icons"><IconSet /></Section>
    </View>
  );
}

export function Quadrant(props: { preset: PresetName; mode: 'light' | 'dark'; style?: StyleProp<ViewStyle> }) {
  return (
    <ApexRNProvider preset={props.preset} defaultMode={props.mode}>
      <Sheet {...props} />
    </ApexRNProvider>
  );
}

const styles = StyleSheet.create({
  sheet: { padding: 16, paddingBottom: 40, gap: 24 },
  head: { gap: 8 },
  headRule: { height: borderWidths.container },
  section: { gap: 12 },
  typeList: { gap: 16 },
  typeRow: { gap: 4 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  iconCell: { width: '25%', gap: 8 },
});
