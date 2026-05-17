import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from 'react-native-reanimated';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { springConfig } from '@/constants/animations';
import { useColors } from '@/context/ThemeContext';
import { useMemo } from 'react';
import Avatar from './Avatar';
import StatusChip from './StatusChip';
import { formatRupiah } from '@/utils/formatters';

interface CustomerCardProps {
  name: string;
  initials: string;
  phone?: string;
  amount: number;
  status: 'utang' | 'lunas';
  onPress: () => void;
  index?: number;
}

export default function CustomerCard({
  name,
  initials,
  phone,
  amount,
  status,
  onPress,
  index = 0,
}: CustomerCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const hasDebt = amount > 0;

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.97, springConfig);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, springConfig);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: borderRadius.xl,
      padding: spacing.stackMd,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.stackMd,
      flex: 1,
    },
    right: {
      alignItems: 'flex-end',
      gap: spacing.base,
    },
    name: {
      ...typography.headlineMd,
      color: colors.onSurface,
    },
    phone: {
      ...typography.labelSm,
      color: colors.onSurfaceVariant,
    },
    amount: {
      ...typography.headlineMd,
      color: colors.tertiary,
    },
  }), [colors]);

  return (
    <GestureDetector gesture={tap}>
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300).springify()}>
        <Animated.View style={[styles.card, animatedStyle]} onTouchEnd={onPress}>
          <View style={styles.left}>
            <Avatar initials={initials} />
            <View>
              <Text style={styles.name}>{name}</Text>
              {phone && <Text style={styles.phone}>{phone}</Text>}
            </View>
          </View>
          <View style={styles.right}>
            <StatusChip label={status === 'utang' ? 'UTANG' : 'LUNAS'} variant={status} />
            {hasDebt && <Text style={styles.amount}>{formatRupiah(amount)}</Text>}
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}


