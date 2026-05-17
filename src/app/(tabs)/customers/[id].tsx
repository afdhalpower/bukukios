import { useCallback, useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import Avatar from '@/components/Avatar';
import StatusChip from '@/components/StatusChip';
import TransactionCard from '@/components/TransactionCard';
import LedgerRow from '@/components/LedgerRow';
import ReceiptView from '@/components/ReceiptView';
import { springConfig, scalePress } from '@/constants/animations';
import { useCustomerDetail } from '@/storage/hooks';
import { useEditTransaction } from '@/storage/hooks';
import { parseDateInput, formatRupiah } from '@/utils/formatters';
import MaterialIcon from '@/components/MaterialIcon';
import ActionSheet from '@/components/ActionSheet';

function AnimatedButton({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => { scale.value = withSpring(scalePress.pressed, springConfig); })
    .onEnd(() => { if (onPress) onPress(); })
    .onFinalize(() => { scale.value = withSpring(scalePress.normal, springConfig); });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { customer, transactions: txns, refresh } = useCustomerDetail(id!);
  const { remove: removeTransaction } = useEditTransaction();
  const [filterType, setFilterType] = useState<'semua' | 'utang' | 'bayar'>('semua');
  const [filterDays, setFilterDays] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'transaksi' | 'ledger'>('transaksi');
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [displayCount, setDisplayCount] = useState(20);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filteredTxns = txns.filter((txn) => {
    if (filterType !== 'semua' && txn.type !== filterType) return false;
    if (filterDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - filterDays);
      const parts = txn.date.split(' ');
      const day = parseInt(parts[0], 10);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const month = monthNames.indexOf(parts[1]);
      const year = parseInt(parts[2], 10);
      const txnDate = new Date(year, month, day);
      if (txnDate < cutoff) return false;
    }
    return true;
  });

  useEffect(() => {
    setDisplayCount(20);
  }, [filterType, filterDays]);

  const visibleTxns = filteredTxns.slice(0, displayCount);

  function showFilterDialog() {
    setShowFilterSheet(true);
  }

  const filterActions = [
    { text: 'Semua', onPress: () => { setFilterType('semua'); setFilterDays(null); } },
    { text: 'Utang saja', onPress: () => setFilterType('utang') },
    { text: 'Bayar saja', onPress: () => setFilterType('bayar') },
    { text: '7 hari terakhir', onPress: () => setFilterDays(7) },
    { text: '30 hari terakhir', onPress: () => setFilterDays(30) },
    { text: '3 bulan terakhir', onPress: () => setFilterDays(90) },
    { text: 'Reset Filter', onPress: () => { setFilterType('semua'); setFilterDays(null); }, style: 'cancel' as const },
  ];

  async function handleDeleteTransaction(txnId: string) {
    Alert.alert(
      'Hapus Transaksi',
      'Yakin ingin menghapus transaksi ini? Tindakan ini tidak bisa dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await removeTransaction(txnId);
            refresh();
          },
        },
      ],
    );
  }

  function handleEditTransaction(txn: any) {
    router.push({
      pathname: '/tambah-transaksi',
      params: {
        customerId: id,
        type: txn.type,
        editId: txn.id,
        amount: txn.amount.toString(),
        description: txn.description,
        date: txn.date,
      },
    });
  }

  const ledgerData = useMemo(() => {
    const sorted = [...txns].sort((a, b) => {
      const parseTxnDate = (dateStr: string) => {
        const parts = dateStr.split(' ');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const day = parseInt(parts[0], 10);
        const month = months.indexOf(parts[1]);
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      };
      return parseTxnDate(a.date).getTime() - parseTxnDate(b.date).getTime();
    });

    let balance = 0;
    return sorted.map((txn) => {
      const debit = txn.type === 'utang' ? txn.amount : 0;
      const credit = txn.type === 'bayar' ? txn.amount : 0;
      balance += debit - credit;
      return { ...txn, debit, credit, balance };
    });
  }, [txns]);

  function handleViewReceipt(txn: any) {
    setSelectedTxn(txn);
  }

  if (!customer) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Pelanggan tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcon name="arrow-back" color={colors.primary} size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Layar Detail Pelanggan</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/customers/edit-pelanggan', params: { id } })}
            style={styles.headerIconButton}
          >
            <MaterialIcon name="edit" color={colors.primary} size={22} />
          </Pressable>
          <Avatar initials={customer.initials} size={40} />
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Avatar initials={customer.initials} size={64} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{customer.name}</Text>
                <Text style={styles.profileSince}>
                  Pelanggan sejak {customer.since}
                </Text>
                <View style={styles.badges}>
                  <StatusChip label={customer.status === 'lunas' ? 'Lunas' : 'Aktif'} variant={customer.status === 'lunas' ? 'lunas' : 'utang'} />
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryLabel}>{customer.category}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.debtSection}>
              <Text style={styles.debtLabel}>TOTAL UTANG SAAT INI</Text>
              <Text style={styles.debtAmount}>
                {formatRupiah(customer.totalDebt)}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <AnimatedButton
              style={styles.primaryButton}
              onPress={() => router.push({ pathname: '/tambah-transaksi', params: { customerId: id, type: 'utang' } })}
            >
              <MaterialIcon name="add-circle" color={colors.onPrimary} size={20} />
              <Text style={styles.primaryButtonLabel}>Tambah Utang</Text>
            </AnimatedButton>
            <AnimatedButton
              style={styles.secondaryButton}
              onPress={() => router.push({ pathname: '/tambah-transaksi', params: { customerId: id, type: 'bayar' } })}
            >
              <MaterialIcon name="payments" color={colors.secondary} size={20} />
              <Text style={styles.secondaryButtonLabel}>Bayar</Text>
            </AnimatedButton>
          </View>

          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>
              {viewMode === 'transaksi' ? 'Riwayat Transaksi' : 'Buku Besar'}
            </Text>
            <View style={styles.headerActions}>
              <Pressable
                style={[styles.viewToggle, viewMode === 'transaksi' && styles.viewToggleActive]}
                onPress={() => setViewMode('transaksi')}
              >
                <MaterialIcon name="receipt" color={viewMode === 'transaksi' ? colors.onPrimary : colors.primary} size={16} />
                <Text style={[styles.viewToggleLabel, viewMode === 'transaksi' && { color: colors.onPrimary }]}>Transaksi</Text>
              </Pressable>
              <Pressable
                style={[styles.viewToggle, viewMode === 'ledger' && styles.viewToggleActive]}
                onPress={() => setViewMode('ledger')}
              >
                <MaterialIcon name="table-chart" color={viewMode === 'ledger' ? colors.onPrimary : colors.primary} size={16} />
                <Text style={[styles.viewToggleLabel, viewMode === 'ledger' && { color: colors.onPrimary }]}>Ledger</Text>
              </Pressable>
              {viewMode === 'transaksi' && (
                <Pressable style={styles.filterButton} onPress={showFilterDialog}>
                  <MaterialIcon name="filter-list" color={colors.primary} size={18} />
                  <Text style={styles.filterLabel}>
                    Filter{(filterType !== 'semua' || filterDays) ? ' ✓' : ''}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {viewMode === 'transaksi' ? (
            <View style={styles.transactionList}>
              {filteredTxns.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcon name="receipt-long" color={colors.outline} size={48} />
                  <Text style={styles.emptyTitle}>Belum Ada Transaksi</Text>
                  <Text style={styles.emptySubtitle}>
                    Tambahkan utang atau pembayaran baru untuk mulai mencatat.
                  </Text>
                </View>
              ) : (
                visibleTxns.map((txn, index) => (
                  <TransactionCard
                    key={txn.id}
                    type={txn.type}
                    description={txn.description}
                    amount={txn.amount}
                    invoice={txn.invoice}
                    location={txn.location}
                    date={txn.date}
                    status={txn.status}
                    index={index}
                    dueDate={txn.dueDate}
                    onEdit={() => handleEditTransaction(txn)}
                    onDelete={() => handleDeleteTransaction(txn.id)}
                  />
                ))
              )}
              {displayCount < filteredTxns.length && (
                <Pressable
                  style={styles.loadMore}
                  onPress={() => setDisplayCount(prev => prev + 50)}
                >
                  <Text style={styles.loadMoreLabel}>Tampilkan Lebih Banyak</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.ledgerContainer}>
              <View style={styles.ledgerHeader}>
                <Text style={styles.ledgerTitle}>Saldo Berjalan</Text>
                <Text style={styles.ledgerBalance}>{formatRupiah(customer.totalDebt)}</Text>
              </View>
              <View style={styles.ledgerTableHeader}>
                <Text style={[styles.ledgerCell, styles.ledgerDateHeader]}>Tanggal</Text>
                <Text style={[styles.ledgerCell, styles.ledgerDescHeader]}>Keterangan</Text>
                <Text style={[styles.ledgerCell, styles.ledgerAmountHeader]}>Debit</Text>
                <Text style={[styles.ledgerCell, styles.ledgerAmountHeader]}>Kredit</Text>
                <Text style={[styles.ledgerCell, styles.ledgerBalanceHeader]}>Saldo</Text>
              </View>
              {ledgerData.map((row, index) => (
                <LedgerRow
                  key={row.id}
                  date={row.date.split(',')[0]}
                  description={row.description}
                  debit={row.debit}
                  credit={row.credit}
                  balance={row.balance}
                  index={index}
                />
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      <ActionSheet
        visible={showFilterSheet}
        title="Filter Transaksi"
        message="Pilih filter:"
        actions={filterActions}
        onClose={() => setShowFilterSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerPadding,
    height: 64,
    backgroundColor: colors.surface + 'CC',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '4D',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headlineLg,
    color: colors.primary,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.containerPadding,
    gap: spacing.stackLg,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.xl,
    padding: spacing.stackLg,
    gap: spacing.stackMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    gap: spacing.stackMd,
    alignItems: 'flex-start',
  },
  profileInfo: {
    gap: 2,
    flex: 1,
  },
  profileName: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  profileSince: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.stackSm,
    marginTop: spacing.stackSm,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.full,
  },
  categoryLabel: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
  debtSection: {
    alignItems: 'flex-end',
  },
  debtLabel: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  debtAmount: {
    ...typography.displayLg,
    color: colors.error,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.gutter,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.stackSm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.stackMd,
    borderRadius: borderRadius.xl,
  },
  primaryButtonLabel: {
    ...typography.labelBold,
    color: colors.onPrimary,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.stackSm,
    borderWidth: 2,
    borderColor: colors.secondary,
    paddingVertical: spacing.stackMd,
    borderRadius: borderRadius.xl,
  },
  secondaryButtonLabel: {
    ...typography.labelBold,
    color: colors.secondary,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  viewToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  viewToggleLabel: {
    ...typography.labelBold,
    color: colors.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  filterLabel: {
    ...typography.labelBold,
    color: colors.primary,
  },
  transactionList: {
    gap: spacing.stackSm,
  },
  loadMore: {
    alignItems: 'center',
    paddingVertical: spacing.stackSm,
  },
  loadMoreLabel: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: spacing.stackMd,
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.onSurfaceVariant,
  },
  emptySubtitle: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: 'center',
    paddingHorizontal: spacing.containerPadding,
  },
  ledgerContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.stackMd,
    backgroundColor: colors.primary,
  },
  ledgerTitle: {
    ...typography.labelBold,
    color: colors.onPrimary,
  },
  ledgerBalance: {
    ...typography.headlineMd,
    color: colors.onPrimary,
  },
  ledgerTableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.stackSm,
    backgroundColor: colors.surfaceContainer,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  ledgerCell: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  ledgerDateHeader: { width: 70 },
  ledgerDescHeader: { flex: 1, marginRight: spacing.stackSm },
  ledgerAmountHeader: { width: 80, textAlign: 'right' },
  ledgerBalanceHeader: { width: 90, textAlign: 'right', ...typography.labelBold, color: colors.onSurface },
});
