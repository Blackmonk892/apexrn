import { Dimensions, PixelRatio, type ScaledSize } from 'react-native';

export type { ScaledSize };

// Baseline dimensions for a standard mobile device (e.g., iPhone 11/13/14 Pro)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

function windowSize(): ScaledSize {
  // Read lazily on every call so rotation / foldables / split-screen
  // always use the current window instead of a stale import-time snapshot.
  return Dimensions.get('window');
}

/** Current window width in points. */
export function screenWidth(): number {
  return windowSize().width;
}

/** Current window height in points. */
export function screenHeight(): number {
  return windowSize().height;
}

/**
 * Scales width/horizontal spacing based on screen width.
 */
export const scale = (size: number) => (screenWidth() / guidelineBaseWidth) * size;

/**
 * Scales height/vertical spacing based on screen height.
 */
export const verticalScale = (size: number) => (screenHeight() / guidelineBaseHeight) * size;

/**
 * Scales with a factor (default 0.5). Useful for typography and margins
 * where you don't want it to scale *too* aggressively on large screens like tablets.
 */
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/**
 * Normalizes font size based on pixel ratio and screen width.
 * Respects the user's font-scale accessibility setting and clamps runaway
 * growth on very large screens (tablets / desktop).
 */
export const normalize = (size: number) => {
  const fontScale = PixelRatio.getFontScale() || 1;
  const newSize = size * (screenWidth() / guidelineBaseWidth);
  const scaled = newSize * Math.min(fontScale, 1.3);
  const capped = Math.min(scaled, size * 1.6);
  return Math.round(PixelRatio.roundToNearestPixel(capped));
};
