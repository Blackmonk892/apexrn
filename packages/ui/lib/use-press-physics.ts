import { useCallback, useEffect } from 'react';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { motion } from './motion';

export interface UsePressPhysicsOptions {
  /** Shadow depth in px. The surface travels exactly this far on both axes. */
  depth: number;
  /** Skips the animation and the haptic (still returns stable handlers/styles). */
  disabled?: boolean;
  /** Fires a light haptic impact on press-in. @default true */
  haptics?: boolean;
}

export function usePressPhysics({ depth, disabled = false, haptics = true }: UsePressPhysicsOptions) {
  const pressed = useSharedValue(0);
  // Reduced motion keeps the sink (it is state feedback) but makes it instant.
  const reduceMotion = useReducedMotion();
  const animate = (to: number) => (reduceMotion ? to : withSpring(to, motion.press));

  // A surface that turns non-interactive mid-gesture would otherwise stay sunk.
  useEffect(() => {
    if (disabled) pressed.value = 0;
  }, [disabled, pressed]);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    pressed.value = animate(1);
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [disabled, haptics, pressed, reduceMotion]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    pressed.value = animate(0);
  }, [disabled, pressed, reduceMotion]);

  const animatedSurfaceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * depth },
      { translateY: pressed.value * depth },
    ],
  }));

  return { pressed, animatedSurfaceStyle, handlePressIn, handlePressOut };
}
