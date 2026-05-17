import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useColors } from '@/context/ThemeContext';
import { useMemo } from 'react';

interface BarItem {
  label: string;
  value: number;
}

export default function TrendChart({ data, maxValue: max }: { data: BarItem[]; maxValue?: number }) {
  const colors = useColors();
  const maxVal = max ?? Math.max(...data.map((d) => d.value), 1);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 200,
      paddingTop: spacing.stackMd,
    },
    barColumn: {
      alignItems: 'center',
      flex: 1,
      gap: spacing.base,
      height: '100%',
      justifyContent: 'flex-end',
    },
    barValue: {
      ...typography.labelSm,
      color: colors.onSurfaceVariant,
    },
    barTrack: {
      width: 32,
      height: 120,
      backgroundColor: colors.surfaceContainer,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    barFill: {
      width: '100%',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
    },
    barLabel: {
      ...typography.labelSm,
      color: colors.onSurfaceVariant,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      {data.map((item, i) => {
        const pct = (item.value / maxVal) * 100;
        return (
          <View key={item.label} style={styles.barColumn}>
            <Text style={styles.barValue}>{formatCompact(item.value)}</Text>
            <View style={styles.barTrack}>
              <Animated.View
                style={[styles.barFill, { height: `${Math.max(pct, 1)}%` }]}
                entering={FadeIn.delay(i * 80).duration(400)}
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'jt';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'rb';
  return n.toString();
}


