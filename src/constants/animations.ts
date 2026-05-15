import { withSpring, withTiming, Easing } from 'react-native-reanimated';

export const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

export const timingConfig: Parameters<typeof withTiming>[1] = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
};

export const scalePress = { pressed: 0.96, normal: 1 };
