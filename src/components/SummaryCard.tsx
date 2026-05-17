import { Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { spacing, borderRadius, typography } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import GradientCard from './GradientCard';
import { useColors } from '@/context/ThemeContext';
import { useMemo } from 'react';

interface SummaryCardProps {
  title: string;
  amount: string;
  trend?: string;
  trendIcon?: keyof typeof MaterialIcons.glyphMap;
  icon?: keyof typeof MaterialIcons.glyphMap;
  subtitle?: string;
  large?: boolean;
}

export default function SummaryCard({
  title,
  amount,
  trend,
  trendIcon,
  icon,
  subtitle,
  large,
}: SummaryCardProps) {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    gradientCard: {
      minHeight: 200,
      justifyContent: 'space-between',
    },
    gradientLabel: {
      ...typography.labelSm,
      color: '#ffffffCC',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    gradientAmount: {
      ...typography.displayLg,
      color: '#ffffff',
      marginTop: spacing.base,
      fontSize: 36,
      lineHeight: 44,
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.base,
      backgroundColor: '#ffffff1A',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 9999,
      alignSelf: 'flex-start',
      marginTop: spacing.stackSm,
    },
    trendBadgeText: {
      ...typography.labelSm,
      color: '#ffffffCC',
    },
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: borderRadius.xl,
      padding: spacing.stackLg,
      justifyContent: 'center',
      minHeight: 120,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    label: {
      ...typography.labelSm,
      color: colors.outline,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      flex: 1,
    },
    amount: {
      ...typography.headlineLg,
      color: colors.primary,
      marginTop: spacing.stackSm,
    },
    subtitle: {
      ...typography.labelSm,
      color: colors.onSurfaceVariant,
      marginTop: spacing.base,
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.stackSm,
    },
  }), [colors]);

  if (large) {
    return (
      <GradientCard
        gradientColors={[colors.primary, colors.primaryContainer, colors.secondary]}
        style={styles.gradientCard}
      >
        <Text style={styles.gradientLabel}>{title}</Text>
        <Text style={styles.gradientAmount}>{amount}</Text>
        {trend && (
          <Animated.View style={styles.trendBadge} entering={FadeIn.delay(300).duration(400)}>
            {trendIcon && (
              <MaterialIcons name={trendIcon} size={16} color="#ffffffCC" />
            )}
            <Text style={styles.trendBadgeText}>{trend}</Text>
          </Animated.View>
        )}
      </GradientCard>
    );
  }

  return (
    <Animated.View style={styles.card} entering={FadeIn.duration(400).springify()}>
      <Animated.View style={styles.iconRow}>
        {icon && <MaterialIcons name={icon} size={20} color={colors.tertiary} />}
        <Text style={styles.label}>{title}</Text>
      </Animated.View>
      <Text style={styles.amount}>{amount}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Animated.View>
  );
}


