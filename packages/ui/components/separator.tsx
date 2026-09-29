import { StyleSheet, View, ViewProps } from 'react-native';

import { borderWidths } from '../lib/colors';
import { useTheme } from '../lib/theme';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SeparatorProps extends ViewProps {
  /**
   * The orientation of the dividing line.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Separator({ 
  orientation = 'horizontal', 
  style, 
  ...props 
}: SeparatorProps) {
  const { colors } = useTheme();

  return (
    <View
      style={cn(
        { backgroundColor: colors.border },
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        style
      )}
      accessibilityRole="none"
      importantForAccessibility="no"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  horizontal: {
    alignSelf: 'stretch',
    height: borderWidths.standard,
  },
  vertical: {
    alignSelf: 'stretch',
    width: borderWidths.standard,
  },
});

export default Separator;
