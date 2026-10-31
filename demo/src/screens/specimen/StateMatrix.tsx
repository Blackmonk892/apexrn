import { Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BrutalSurface,
  Button,
  Checkbox,
  Input,
  LoadingBlocks,
  Separator,
  Text,
  useTheme,
} from '@apexrn/ui';

const STATES = ['idle', 'pressed', 'focused', 'disabled', 'error', 'loading'] as const;
type State = (typeof STATES)[number];

// A missing entry is a state the component has no prop for yet; the cell says
// so instead of faking it.
type Row = { name: string; cells: Partial<Record<State, ReactNode>> };

function Block(props: { focused?: boolean; disabled?: boolean; invalid?: boolean; children?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <BrutalSurface
      pressable={false}
      elevation="control"
      borderWidth="control"
      backgroundColor={colors.surface}
      style={styles.stretch}
      surfaceStyle={styles.block}
      {...props}
    />
  );
}

// A press can't be held for a static image, so this draws what the press ends
// on: the surface moved onto its shadow by the full depth, with the depth at 0.
function PressedBlock() {
  const { colors, elevation } = useTheme();
  const depth = elevation.control;
  return (
    <View style={{ alignSelf: 'stretch', marginRight: depth, marginBottom: depth, transform: [{ translateX: depth }, { translateY: depth }] }}>
      <BrutalSurface
        pressable={false}
        elevation="flat"
        borderWidth="control"
        backgroundColor={colors.surface}
        surfaceStyle={styles.block}
      />
    </View>
  );
}

function useRows(): Row[] {
  const { colors } = useTheme();
  return [
    {
      name: 'Surface',
      cells: {
        idle: <Block />,
        pressed: <PressedBlock />,
        focused: <Block focused />,
        disabled: <Block disabled />,
        error: <Block invalid />,
        loading: <Block><LoadingBlocks color={colors.foreground} /></Block>,
      },
    },
    {
      name: 'Button',
      cells: {
        idle: <Button size="sm">Save</Button>,
        disabled: <Button size="sm" disabled>Save</Button>,
        loading: <Button size="sm" loading>Save</Button>,
      },
    },
    {
      name: 'Input',
      cells: {
        idle: <Input placeholder="Email" accessibilityLabel="Email" />,
        disabled: <Input placeholder="Email" accessibilityLabel="Email" disabled />,
        error: <Input defaultValue="ana@" accessibilityLabel="Email" error />,
      },
    },
    {
      name: 'Checkbox',
      cells: {
        idle: (
          <View style={styles.pair}>
            <Checkbox accessibilityLabel="Unchecked" />
            <Checkbox defaultChecked accessibilityLabel="Checked" />
          </View>
        ),
        disabled: <Checkbox defaultChecked disabled accessibilityLabel="Checked, disabled" />,
      },
    },
  ];
}

export function StateMatrix() {
  const rows = useRows();
  return (
    <View>
      {rows.map((row, i) => (
        <Fragment key={row.name}>
          {i > 0 ? <Separator /> : null}
          <View style={styles.row}>
            <Text variant="body" style={styles.name}>{row.name}</Text>
            <View style={styles.grid}>
              {STATES.map((state) => (
                <View key={state} style={styles.cell}>
                  <View style={styles.specimen}>
                    {row.cells[state] ?? <Text variant="mono" tone="muted">not wired</Text>}
                  </View>
                  <Text variant="mono">{state}</Text>
                </View>
              ))}
            </View>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 16, gap: 12 },
  name: { fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  // space-between pins each state name to the cell bottom, so names line up across a row of mixed heights.
  cell: { width: '33.333%', paddingRight: 12, gap: 8, justifyContent: 'space-between' },
  specimen: { minHeight: 56, justifyContent: 'center', alignItems: 'flex-start' },
  stretch: { alignSelf: 'stretch' },
  block: { height: 40, alignItems: 'center', justifyContent: 'center' },
  pair: { flexDirection: 'row', gap: 16 },
});
