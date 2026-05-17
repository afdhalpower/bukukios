import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useColors } from '@/context/ThemeContext';
import Avatar from '@/components/Avatar';
import BukuKiosLogo from '@/components/BukuKiosLogo';
import SummaryCard from '@/components/SummaryCard';
import TrendChart from '@/components/TrendChart';
import { useDrawer } from '@/context/DrawerContext';
import { useCustomers } from '@/storage/hooks';
import { getTransactions } from '@/storage/database';
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { Transaction } from '@/types';
import { formatRupiah } from '@/utils/formatters';
import MaterialIcon from '@/components/MaterialIcon';
import { DEFAULT_AVATAR_URL } from '@/constants/theme';

function monthLabel(dateStr: string): string {
  const parts = dateStr.split(' ');
  return parts[1] || '';
}

const MONTH_ORDER: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

export default function ReportsScreen() {
  const colors = useColors();
  const { openDrawer } = useDrawer();
  const { customers } = useCustomers();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      getTransactions().then(setTransactions);
    }, [])
  );

  const totalPiutang = customers.reduce((s, c) => s + c.totalDebt, 0);
  const totalDibayar = transactions
    .filter((t) => t.type === 'bayar')
    .reduce((s, t) => s + t.amount, 0);
  const totalUtang = transactions
    .filter((t) => t.type === 'utang')
    .reduce((s, t) => s + t.amount, 0);
  const outstanding = totalUtang - totalDibayar;

  const topCustomers = [...customers]
    .filter((c) => c.totalDebt > 0)
    .sort((a, b) => b.totalDebt - a.totalDebt)
    .slice(0, 5);

  const monthlyMap: Record<string, number> = {};
  transactions.forEach((t) => {
    if (t.type === 'utang') {
      const m = monthLabel(t.date);
      monthlyMap[m] = (monthlyMap[m] || 0) + t.amount;
    }
  });
  const sortedMonths = Object.entries(monthlyMap)
    .sort(([a], [b]) => (MONTH_ORDER[a] || 0) - (MONTH_ORDER[b] || 0));
  const chartData = sortedMonths.map(([label, value]) => ({ label, value }));

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.containerPadding, height: 64,
      backgroundColor: colors.surface + 'CC',
      borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '4D',
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.stackMd },
    brand: { ...typography.headlineLg, color: colors.primary, fontWeight: '700' },
    content: { padding: spacing.containerPadding, gap: spacing.stackLg, paddingBottom: 40 },
    pageTitle: { ...typography.displayLg, color: colors.onSurface },
    summaryGrid: { gap: spacing.gutter },
    card: {
      backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant,
      borderRadius: borderRadius.xl, padding: spacing.stackLg,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    cardTitle: { ...typography.headlineMd, color: colors.onSurface, marginBottom: spacing.stackMd },
    rankList: { gap: spacing.stackSm },
    rankItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.stackMd },
    rankBadge: {
      width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceContainerHigh,
      alignItems: 'center', justifyContent: 'center',
    },
    rankNumber: { ...typography.labelBold, color: colors.onSurfaceVariant },
    rankInfo: { flex: 1 },
    rankName: { ...typography.headlineMd, color: colors.onSurface },
    rankCategory: { ...typography.labelSm, color: colors.onSurfaceVariant },
    rankAmount: { ...typography.headlineMd, color: colors.error },
    emptyState: { alignItems: 'center', paddingVertical: 80, gap: spacing.stackMd },
    emptyTitle: { ...typography.headlineMd, color: colors.onSurfaceVariant },
    emptySubtitle: { ...typography.bodyMd, color: colors.outline, textAlign: 'center' },
  }), [colors]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={openDrawer}>
            <MaterialIcon name="menu" color={colors.primary} size={24} />
          </Pressable>
          <BukuKiosLogo size={32} showText={false} color={colors.primary} accentColor={colors.secondary} />
        </View>
        <Avatar initials="AS" size={40} source={DEFAULT_AVATAR_URL} />
      </View>

      <View style={styles.content}>
        <Text style={styles.pageTitle}>Laporan Keuangan</Text>

        <View style={styles.summaryGrid}>
          <SummaryCard title="Total Piutang" amount={formatRupiah(totalPiutang)} icon="account-balance" large />
          <SummaryCard title="Total Dibayar" amount={formatRupiah(totalDibayar)} icon="payments" />
          <SummaryCard title="Outstanding" amount={formatRupiah(outstanding)} icon="warning" />
        </View>

        {chartData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tren Piutang per Bulan</Text>
            <TrendChart data={chartData} />
          </View>
        )}

        {topCustomers.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pelanggan dengan Utang Tertinggi</Text>
            <View style={styles.rankList}>
              {topCustomers.map((c, i) => (
                <View key={c.id} style={styles.rankItem}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankNumber}>{i + 1}</Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankName}>{c.name}</Text>
                    <Text style={styles.rankCategory}>{c.category}</Text>
                  </View>
                  <Text style={styles.rankAmount}>{formatRupiah(c.totalDebt)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {chartData.length === 0 && topCustomers.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcon name="analytics" color={colors.outline} size={48} />
            <Text style={styles.emptyTitle}>Belum Ada Data</Text>
            <Text style={styles.emptySubtitle}>
              Tambahkan transaksi untuk melihat laporan keuangan.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

}
