import { renderHook } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { motion, useMotion } from '@apexrn/ui';

describe('motion', () => {
  it('exposes the grammar durations', () => {
    expect(motion.enter.duration).toBe(180);
    expect(motion.exit.duration).toBe(120);
    expect(motion.selection.duration).toBe(160);
    expect(motion.press).toEqual({ damping: 15, stiffness: 400, mass: 0.5 });
  });

  it('keeps full timings when reduced motion is off', async () => {
    const { result } = await renderHook(() => useMotion());
    expect(result.current.reduceMotion).toBe(false);
    expect(result.current.enter.duration).toBe(180);
    expect(result.current.exit.duration).toBe(120);
    expect(result.current.selection.duration).toBe(160);
  });

  it('collapses every timing to 100ms under reduced motion', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const { result } = await renderHook(() => useMotion());
    expect(result.current.reduceMotion).toBe(true);
    for (const t of [result.current.enter, result.current.exit, result.current.selection]) {
      expect(t.duration).toBe(100);
    }
  });
});
