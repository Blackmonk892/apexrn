import { StyleSheet } from 'react-native';

/**
 * Merges multiple style values (objects or nested arrays), filtering out falsy values.
 * Flattens array styles for clean React Native application.
 */
export function cn(...styles: any[]): any {
  return StyleSheet.flatten(styles) ?? {};
}