import { Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { typography } from '@/constants/theme';
import { useColors } from '@/context/ThemeContext';
import { useMemo } from 'react';

type Variant = 'utang' | 'lunas' | 'bayar';

interface StatusChipProps {
  label: string;
  variant: Variant;
}

export default function StatusChip({ label, variant }: StatusChipProps) {
  const colors = useColors();
  const variantStyles: Record<Variant, { bg: string; text: string }> = {
    utang: { bg: colors.tertiary + '1A', text: colors.tertiary },
    lunas: { bg: colors.secondary + '1A', text: colors.secondary },
    bayar: { bg: colors.secondaryContainer + '4D', text: colors.onSecondaryContainer },
  };
  const v = variantStyles[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(v.bg, { duration: 250 }),
  }));

  return (
    <Animated.View style={[styles.chip, animatedStyle]}>
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.labelBold,
    textTransform: 'uppercase',
  },
});
