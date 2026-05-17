import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { memo, useMemo } from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { spacing, borderRadius, typography } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColors } from '@/context/ThemeContext';
import StatusChip from './StatusChip';
import { isOverdue, daysUntilDue, formatDueDate } from '@/storage/database';
import { formatRupiah } from '@/utils/formatters';

interface TransactionCardProps {
  type: 'utang' | 'bayar';
  description: string;
  amount: number;
  invoice?: string;
  location?: string;
  date: string;
  status: 'UTANG' | 'BAYAR';
  index?: number;
  dueDate?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onReceipt?: () => void;
}

function TransactionCard({
  type,
  description,
  amount,
  invoice,
  location,
  date,
  status,
  index = 0,
  dueDate,
  onEdit,
  onDelete,
  onReceipt,
}: TransactionCardProps) {
  const colors = useColors();
  const isDebt = type === 'utang';
  const iconColor = isDebt ? colors.error : colors.onSecondaryContainer;
  const iconBg = isDebt ? colors.errorContainer : colors.secondaryContainer;
  const amountColor = isDebt ? colors.error : colors.onSecondaryContainer;
  const overdue = isDebt && isOverdue(dueDate);
  const days = daysUntilDue(dueDate);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: borderRadius.lg,
      padding: spacing.stackMd,
      paddingTop: spacing.stackSm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    cardOverdue: {
      borderColor: colors.error + '66',
      backgroundColor: colors.errorContainer + '22',
    },
    menuButton: {
      position: 'absolute',
      top: spacing.base,
      right: spacing.base,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    left: {
      flexDirection: 'row',
      gap: spacing.stackMd,
      flex: 1,
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    details: {
      gap: 2,
      flex: 1,
    },
    description: {
      ...typography.headlineMd,
      color: colors.onSurface,
    },
    meta: {
      ...typography.bodyMd,
      color: colors.onSurfaceVariant,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.base,
    },
    date: {
      ...typography.labelSm,
      color: colors.onSurfaceVariant,
    },
    dueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    dueText: {
      ...typography.labelSm,
      color: colors.onSurfaceVariant,
    },
    right: {
      alignItems: 'flex-end',
      gap: spacing.base,
    },
    amount: {
      ...typography.headlineMd,
    },
    overdueBadge: {
      backgroundColor: colors.error,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginTop: 2,
    },
    overdueLabel: {
      ...typography.labelSm,
      color: colors.onError,
      fontWeight: '700',
      fontSize: 9,
    },
  }), [colors]);

  return (
    <Animated.View
      style={[styles.card, overdue && styles.cardOverdue]}
      entering={FadeInRight.delay(index * 60).duration(300).springify()}
    >
      {(onEdit || onDelete) && (
        <Pressable
          style={styles.menuButton}
          onPress={() => {
            const buttons: any[] = [
              { text: 'Batal', style: 'cancel' as const },
            ];
            if (onReceipt) {
              buttons.splice(1, 0, { text: 'Struk', onPress: onReceipt });
            }
            if (onEdit) {
              buttons.splice(1, 0, { text: 'Edit', onPress: onEdit });
            }
            if (onDelete) {
              buttons.splice(1, 0, {
                text: 'Hapus',
                style: 'destructive' as const,
                onPress: onDelete,
              });
            }
            Alert.alert('Aksi', 'Pilih aksi untuk transaksi ini:', buttons);
          }}
        >
          <MaterialIcons name="more-vert" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      )}
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <MaterialIcons
              name={isDebt ? 'trending-up' : 'check-circle'}
              size={20}
              color={iconColor}
            />
          </View>
          <View style={styles.details}>
            <Text style={styles.description}>{description}</Text>
            {(invoice || location) && (
              <Text style={styles.meta}>
                {invoice}
                {invoice && location ? ' \u2022 ' : ''}
                {location}
              </Text>
            )}
            <View style={styles.dateRow}>
              <MaterialIcons
                name="calendar-today"
                size={14}
                color={colors.onSurfaceVariant}
              />
              <Text style={styles.date}>{date}</Text>
            </View>
            {dueDate && isDebt && (
              <View style={styles.dueRow}>
                <MaterialIcons
                  name={overdue ? 'warning' : 'event'}
                  size={14}
                  color={overdue ? colors.error : colors.onSurfaceVariant}
                />
                <Text style={[styles.dueText, overdue && { color: colors.error }]}>
                  Jatuh tempo: {formatDueDate(dueDate)}
                  {overdue && ` (Terlambat ${Math.abs(days)} hari)`}
                  {!overdue && days <= 3 && days >= 0 && ` (${days} hari lagi)`}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isDebt ? '+ ' : '- '}
            {formatRupiah(amount)}
          </Text>
          <StatusChip label={status} variant={isDebt ? 'utang' : 'bayar'} />
          {overdue && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueLabel}>OVERDUE</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default memo(TransactionCard);


