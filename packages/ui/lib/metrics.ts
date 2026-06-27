import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline dimensions for a standard mobile device (e.g., iPhone 11/13/14 Pro)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scales width/horizontal spacing based on screen width.
 */
export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scales height/vertical spacing based on screen height.
 */
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Scales with a factor (default 0.5). Useful for typography and margins 
 * where you don't want it to scale *too* aggressively on large screens like tablets.
 */
export const moderateScale = (size: number, factor = 0.5) => 
  size + (scale(size) - size) * factor;

/**
 * Normalizes font size based on pixel ratio and screen width.
 */
export const normalize = (size: number) => {
  const newSize = size * (SCREEN_WIDTH / guidelineBaseWidth);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};