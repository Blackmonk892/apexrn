import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { motion, useMotion } from './motion';

const STEPS = 3;

function Block({ index, step, color, size, still }: { index: number; step: { value: number }; color: string; size: number; still: boolean }) {
  // Opacity of the fill layer is animated; the outline stays put so layout never changes.
  const fill = useAnimatedStyle(() => ({ opacity: still ? (index === 1 ? 1 : 0) : Math.floor(step.value) === index ? 1 : 0 }));
  return (
    <View
      testID="loading-block"
      style={{ width: size, height: size, borderWidth: 2, borderColor: color }}
    >
      <Animated.View testID="loading-fill" style={[{ flex: 1, backgroundColor: color }, fill]} />
    </View>
  );
}

export function LoadingBlocks({ color, size = 6 }: { color: string; size?: number }) {
  const { reduceMotion } = useMotion();
  const step = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    step.value = withRepeat(withTiming(STEPS, { duration: motion.selection.duration * STEPS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(step);
  }, [reduceMotion, step]);

  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel="Loading" style={{ flexDirection: 'row', gap: size / 2 }}>
      {Array.from({ length: STEPS }, (_, i) => (
        <Block key={i} index={i} step={step} color={color} size={size} still={reduceMotion} />
      ))}
    </View>
  );
}

export default LoadingBlocks;
