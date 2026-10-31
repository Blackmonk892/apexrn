import { StyleSheet, View, type ViewProps } from 'react-native';

import { borderWidths } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';
import { Text } from './text';

export interface SeparatorProps extends ViewProps {
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Section-divider caption centred between two rules. Horizontal only. */
  label?: string;
}

export function Separator({ orientation = 'horizontal', label, style, testID, ...props }: SeparatorProps) {
  const { colors } = useTheme();
  const vertical = orientation === 'vertical';

  // React Native has no separator role, so the rule is simply removed from the
  // accessibility tree; a label stays readable as plain text.
  const rule = (ruleStyle?: ViewProps['style'], ruleTestID?: string) => (
    <View
      testID={ruleTestID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={cn(
        { backgroundColor: colors.border },
        vertical ? styles.vertical : styles.horizontal,
        ruleStyle,
      )}
    />
  );

  if (label && !vertical) {
    return (
      <View testID={testID} style={cn(styles.labelled, style)} {...props}>
        {rule(styles.fill, testID && `${testID}-rule`)}
        <Text variant="label" style={styles.caption}>{label}</Text>
        {rule(styles.fill, testID && `${testID}-rule`)}
      </View>
    );
  }

  return (
    <View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={cn({ backgroundColor: colors.border }, vertical ? styles.vertical : styles.horizontal, style)}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: { alignSelf: 'stretch', height: borderWidths.control },
  vertical: { alignSelf: 'stretch', width: borderWidths.control },
  labelled: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 12 },
  fill: { flex: 1 },
  caption: { flexShrink: 1 },
});

export default Separator;
