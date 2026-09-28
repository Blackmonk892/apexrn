import {
  StyleSheet,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

type Falsy = false | null | undefined;

type AnyRNStyle = ViewStyle | TextStyle | ImageStyle;

/**
 * Merges multiple React Native style values, filtering out falsy values.
 * Accepts view/text/image styles, registered style IDs, and nested arrays —
 * unlike `Object.assign`-based merging this preserves transform arrays and
 * `StyleSheet.create` numeric IDs. The intersection return type assigns
 * cleanly to View, Text, and TextInput `style` props.
 */
export function cn(
  ...styles: Array<StyleProp<AnyRNStyle> | Falsy>
): StyleProp<ViewStyle> & StyleProp<TextStyle> {
  const filtered = styles.filter(
    (s): s is StyleProp<AnyRNStyle> => Boolean(s),
  );
  return StyleSheet.flatten(filtered as StyleProp<AnyRNStyle>) as StyleProp<ViewStyle> &
    StyleProp<TextStyle>;
}
