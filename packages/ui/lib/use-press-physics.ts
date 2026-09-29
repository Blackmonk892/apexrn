import { useCallback, useEffect } from 'react';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { motion } from './colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UsePressPhysicsOptions {
  /** How far the surface travels into its shadow, in px (e.g. 2/4/6/8). */
  offset: number;
  /** Skips the animation entirely (still returns stable handlers/styles). */
  disabled?: boolean;
  /** Fires a light haptic impact on press-in. @default true */
  haptics?: boolean;
  /** Adds a subtle squash (scaleX/scaleY) on press for a compression feel. @default true */
  squash?: boolean;
}

/** @deprecated Use `UsePressPhysicsOptions` instead. Kept for backwards compatibility. */
export type PressPhysicsConfig = UsePressPhysicsOptions;

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------

// Stiff, low-damping spring so a press reads as a snap/impact with rebound,
// not a linear slide into the shadow.
const SPRING_CONFIG = motion.spring;
const SQUASH_AMOUNT = motion.squash; // scaleX 0.97 / scaleY 1.03 at full press

export function usePressPhysics({
  offset,
  disabled = false,
  haptics = true,
  squash = true,
}: UsePressPhysicsOptions) {
  const pressed = useSharedValue(0);
  // Reduced motion: the block still sinks (state feedback), but instantly and
  // without the squash/rebound.
  const reduceMotion = useReducedMotion();
  const animate = (to: number) =>
    reduceMotion ? to : withSpring(to, SPRING_CONFIG);

  // Reset a stuck press when the surface becomes non-interactive mid-gesture
  // (e.g. disabled toggles while a finger is down, or an interrupted scroll).
  useEffect(() => {
    if (disabled) {
      pressed.value = 0;
    }
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

  // The foreground surface sinks diagonally into the shadow and squashes
  // slightly wider/shorter, so the whole block reads as compressing rather
  // than sliding on top of a static shadow.
  const animatedSurfaceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * offset },
      { translateY: pressed.value * offset },
      { scaleX: 1 - (squash && !reduceMotion ? pressed.value * SQUASH_AMOUNT : 0) },
      { scaleY: 1 + (squash && !reduceMotion ? pressed.value * SQUASH_AMOUNT : 0) },
    ],
  }));

  // The shadow itself moves too (partway, and fades slightly) so it doesn't
  // read as a static layer the foreground merely slides on top of.
  const animatedShadowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * offset * 0.4 },
      { translateY: pressed.value * offset * 0.4 },
    ],
    opacity: 1 - pressed.value * 0.15,
  }));

  return {
    pressed,
    animatedSurfaceStyle,
    animatedShadowStyle,
    handlePressIn,
    handlePressOut,
    /** Alias for press-cancel paths (e.g. gesture interruptions). */
    handlePressCancel: handlePressOut,
  };
}
