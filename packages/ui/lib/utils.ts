import { ImageStyle, TextStyle, ViewStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;

/**
 * Merges multiple style objects, filtering out falsy values.
 * The ApexRN equivalent of shadcn's cn() utility.
 */
export function cn(...styles: (Style | undefined | null | false)[]): Style {
  return Object.assign({}, ...styles.filter(Boolean));
}