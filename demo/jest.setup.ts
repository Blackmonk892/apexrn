import 'react-native-gesture-handler/jestSetup';
import { useReducedMotion } from 'react-native-reanimated';

jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
// Reanimated's mock omits useReducedMotion, which the press physics read.
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  useReducedMotion: jest.fn(() => false),
}));

// Tests override this with mockReturnValue; clear it so one test's override can't leak.
beforeEach(() => {
  jest.mocked(useReducedMotion).mockReset().mockReturnValue(false);
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy', Soft: 'soft', Rigid: 'rigid' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));
