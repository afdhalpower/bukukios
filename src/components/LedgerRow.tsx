import { View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { formatRupiah } from '@/utils/formatters';
import { useColors } from '@/context/ThemeContext';
import { useMemo } from 'react';

interface LedgerRowProps {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  index?: number;
}

export default function LedgerRow({ date, description, debit, credit, balance, index = 0 }: LedgerRowProps) {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.base,
      paddingHorizontal: spacing.stackSm,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant + '4D',
    },
    rowEven: {
      backgroundColor: colors.surfaceContainer + '33',
    },
    dateCell: {
      ...typography.labelSm,
      color: colors.onSurfaceVariant,
      width: 70,
    },
    descCell: {
      ...typography.bodyMd,
      color: colors.onSurface,
      flex: 1,
      marginRight: spacing.stackSm,
    },
    amountCell: {
      ...typography.labelSm,
      color: colors.onSurfaceVariant,
      width: 80,
      textAlign: 'right',
    },
    debitText: {
      color: colors.error,
    },
    creditText: {
      color: colors.secondary,
    },
    balanceCell: {
      ...typography.labelBold,
      width: 90,
      textAlign: 'right',
    },
  }), [colors]);

  return (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={styles.dateCell}>{date}</Text>
      <Text style={styles.descCell} numberOfLines={1}>{description}</Text>
      <Text style={[styles.amountCell, debit > 0 && styles.debitText]}>
        {debit > 0 ? formatRupiah(debit) : '-'}
      </Text>
      <Text style={[styles.amountCell, credit > 0 && styles.creditText]}>
        {credit > 0 ? formatRupiah(credit) : '-'}
      </Text>
      <Text style={[styles.balanceCell, balance < 0 ? styles.debitText : styles.creditText]}>
        {formatRupiah(Math.abs(balance))}
      </Text>
    </View>
  );
}


