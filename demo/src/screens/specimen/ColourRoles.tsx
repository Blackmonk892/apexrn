import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Separator, Text, borderWidths, useTheme, type ColorScheme } from '@apexrn/ui';
import { formatRatio } from './contrast';

type Role = keyof ColorScheme;

// Each group is a role and the role its ratio is measured against: text pairs
// against their fill, borders and the shadow against the page (the gate's pairs).
const GROUPS: { role: Role; on?: Role }[][] = [
  [{ role: 'background' }, { role: 'foreground', on: 'background' }],
  [{ role: 'surface' }, { role: 'surfaceForeground', on: 'surface' }],
  [{ role: 'muted' }, { role: 'mutedForeground', on: 'muted' }],
  [{ role: 'primary' }, { role: 'primaryForeground', on: 'primary' }],
  [{ role: 'secondary' }, { role: 'secondaryForeground', on: 'secondary' }],
  [{ role: 'accent' }, { role: 'accentForeground', on: 'accent' }],
  [{ role: 'destructive' }, { role: 'destructiveForeground', on: 'destructive' }],
  [{ role: 'success' }, { role: 'successForeground', on: 'success' }],
  [{ role: 'warning' }, { role: 'warningForeground', on: 'warning' }],
  [{ role: 'border', on: 'background' }, { role: 'input', on: 'background' }, { role: 'ring', on: 'background' }],
  [{ role: 'shadow', on: 'background' }, { role: 'scrim' }],
];

function RoleRow({ role, on }: { role: Role; on?: Role }) {
  const { colors, scrimOpacity } = useTheme();
  const value = colors[role];
  const isText = role === 'foreground' || role.endsWith('Foreground');

  const reading = on ? formatRatio(value, colors[on]) : '';
  const detail = role === 'scrim' ? `${value} at ${Math.round(scrimOpacity * 100)}%` : value;

  return (
    <View testID={`role-${role}`} style={styles.row}>
      <View style={[styles.swatch, { backgroundColor: value, borderColor: colors.border }]} />
      <View style={styles.name}>
        <Text variant="mono" numberOfLines={1}>{role}</Text>
        <Text variant="mono" tone="muted">{detail}</Text>
      </View>
      <View style={styles.sampleSlot}>
        {isText && on ? (
          <View style={[styles.sample, { backgroundColor: colors[on], borderColor: colors.border }]}>
            <Text variant="body" tone="inherit" style={[styles.sampleText, { color: value }]}>Aa</Text>
          </View>
        ) : null}
      </View>
      <Text variant="mono" style={styles.reading}>{reading}</Text>
    </View>
  );
}

export function ColourRoles() {
  return (
    <View>
      {GROUPS.map((group, i) => (
        <Fragment key={group[0].role}>
          {i > 0 ? <Separator /> : null}
          <View style={styles.group}>
            {group.map((r) => <RoleRow key={r.role} {...r} />)}
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { paddingVertical: 8, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatch: { width: 24, height: 24, borderWidth: borderWidths.control },
  name: { flex: 1, minWidth: 0 },
  sampleSlot: { width: 44 },
  sample: { height: 28, borderWidth: borderWidths.control, alignItems: 'center', justifyContent: 'center' },
  sampleText: { fontWeight: '800' },
  reading: { width: 72, textAlign: 'right' },
});
