import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { opacity, spacing } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { Text } from './text';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ListItemProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  /** One line, truncated. Raises the row from 56 to 72. */
  description?: string;
  /** Mono text on the right, for times, counts and amounts. Sits before `trailing`. */
  meta?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Without `onPress` the row is plain content: no role, no press feedback. */
  onPress?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ListItem({
  title,
  description,
  meta,
  leading,
  trailing,
  onPress,
  disabled,
  style,
  testID,
  ...props
}: ListItemProps) {
  const { colors } = useTheme();

  // minHeight, not height: at large font scale the row grows instead of clipping.
  const base: ViewStyle = { minHeight: description ? 72 : 56, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.md };
  // A row has no border to turn dashed, so the disabled cue is opacity alone.
  const disabledStyle: ViewStyle | undefined = disabled ? { opacity: opacity.disabled } : undefined;

  const content = (
    <>
      {leading ? <View style={styles.slot}>{leading}</View> : null}
      <View style={styles.body}>
        <Text variant="body" numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text variant="body" tone="muted" numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text variant="mono" tone="muted">
          {meta}
        </Text>
      ) : null}
      {trailing ? <View style={styles.slot}>{trailing}</View> : null}
    </>
  );

  if (!onPress) {
    return (
      <View
        testID={testID}
        style={[styles.row, base, disabledStyle, style]}
        accessibilityState={disabled ? { disabled: true } : undefined}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      {...props}
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.row, base, pressed && { backgroundColor: colors.muted }, disabledStyle, style]}
    >
      {content}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  body: { flex: 1 },
  slot: { justifyContent: 'center', alignItems: 'center' },
});

export default ListItem;
