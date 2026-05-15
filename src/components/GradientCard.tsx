import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '@/constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';

interface GradientCardProps {
  gradientColors: readonly [string, string, ...string[]];
  children: ReactNode;
  style?: any;
  large?: boolean;
}

export default function GradientCard({ gradientColors, children, style }: GradientCardProps) {
  return (
    <Animated.View entering={FadeIn.duration(400).springify()} style={[styles.card, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    minHeight: 120,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  content: {
    padding: spacing.stackLg,
    justifyContent: 'center',
    flex: 1,
  },
});
