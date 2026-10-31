import { Easing, useReducedMotion, type EasingFunction, type EasingFunctionFactory } from 'react-native-reanimated';

const enterEasing = Easing.bezier(0.2, 0, 0, 1);

export const motion = {
  press: { damping: 15, stiffness: 400, mass: 0.5 },
  enter: { duration: 180, easing: enterEasing },
  exit: { duration: 120, easing: Easing.bezier(0.3, 0, 1, 1) },
  selection: { duration: 160, easing: enterEasing },
  reduced: { duration: 100 },
} as const;

type Timing = { duration: number; easing: EasingFunction | EasingFunctionFactory };

// Reduced motion keeps a short linear fade so state changes stay visible; callers swap movement for opacity.
const reducedTiming: Timing = { duration: motion.reduced.duration, easing: Easing.linear };

export function useMotion(): { reduceMotion: boolean; enter: Timing; exit: Timing; selection: Timing } {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return { reduceMotion, enter: reducedTiming, exit: reducedTiming, selection: reducedTiming };
  }
  return { reduceMotion, enter: motion.enter, exit: motion.exit, selection: motion.selection };
}
