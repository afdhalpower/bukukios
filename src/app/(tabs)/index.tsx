import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import SummaryCard from '@/components/SummaryCard';
import CustomerCard from '@/components/CustomerCard';
import Avatar from '@/components/Avatar';
import BukuKiosLogo from '@/components/BukuKiosLogo';
import FAB from '@/components/FAB';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCustomers } from '@/storage/hooks';
import { useTheme } from '@/context/ThemeContext';
import { useDrawer } from '@/context/DrawerContext';
import { formatRupiah } from '@/utils/formatters';
import MaterialIcon from '@/components/MaterialIcon';
import { DEFAULT_AVATAR_URL } from '@/constants/theme';

export default function BerandaScreen() {
  const router = useRouter();
  const { customers, loading, refresh } = useCustomers();
  const { theme, toggleTheme } = useTheme();
  const { openDrawer } = useDrawer();
  const hc = theme === 'dark' ? colors.onSurface : colors.primary;
  const totalPiutang = customers.reduce((sum, c) => sum + c.totalDebt, 0);
  const perluDitagih = customers.filter(
    (c) => c.status === 'aktif' && c.totalDebt > 0
  ).length;
  const [isAdding, setIsAdding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsAdding(false);
      refresh();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable accessibilityLabel="Menu" onPress={openDrawer}>
            <MaterialIcon name="menu" color={hc} size={24} />
          </Pressable>
          <BukuKiosLogo size={32} showText={false} color={hc} accentColor={colors.secondary} />
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={toggleTheme} style={styles.themeToggle} accessibilityLabel={theme === 'light' ? 'Mode gelap' : 'Mode terang'}>
            <MaterialIcon name={theme === 'light' ? 'dark-mode' : 'light-mode'} color={hc} size={22} />
          </Pressable>
          <Avatar initials="AS" size={40} source={DEFAULT_AVATAR_URL} />
        </View>
      </View>

      <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        <View style={styles.content}>
          <View style={styles.summaryGrid}>
            <View style={styles.bentoMain}>
              <SummaryCard
                title="Total Piutang"
                amount={formatRupiah(totalPiutang)}
                trend="+12% dari bulan lalu"
                trendIcon="trending-up"
                large
              />
            </View>
            <View style={styles.bentoSecondary}>
              <SummaryCard
                title="Pelanggan Aktif"
                amount={`${customers.length} Orang`}
                subtitle={`${perluDitagih} Perlu ditagih segera`}
                icon="group"
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => router.push('/tambah-transaksi')}
            >
              <MaterialIcon name="add" color={colors.onPrimary} size={20} />
              <Text style={styles.addButtonLabel}>Transaksi Baru</Text>
            </Pressable>
          </View>

          <View style={styles.listCard}>
            {customers.slice(0, 5).map((customer, index) => (
              <View key={customer.id}>
                <CustomerCard
                  name={customer.name}
                  initials={customer.initials}
                  phone={customer.phone || ''}
                  amount={customer.totalDebt}
                  status={customer.totalDebt > 0 ? 'utang' : 'lunas'}
                  onPress={() => router.push(`/customers/${customer.id}`)}
                  index={index}
                />
                {index < customers.slice(0, 5).length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>

          <Pressable
            style={styles.viewAll}
            onPress={() => router.push('/customers')}
          >
            <Text style={styles.viewAllText}>Lihat Semua Pelanggan</Text>
            <MaterialIcon name="chevron-right" color={colors.primary} size={18} />
          </Pressable>
        </View>
      </ScrollView>

      <FAB onPress={() => { setIsAdding(true); router.push('/tambah-transaksi'); }} isOpen={isAdding} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    gap: spacing.stackMd,
  },
  brand: {
    ...typography.headlineLg,
    color: colors.primary,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.stackLg,
    gap: spacing.stackLg,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  summaryGrid: {
    gap: spacing.gutter,
  },
  bentoMain: {},
  bentoSecondary: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.stackMd,
    paddingVertical: spacing.stackSm,
    borderRadius: borderRadius.full,
    gap: spacing.stackSm,
  },
  addButtonLabel: {
    ...typography.labelBold,
    color: colors.onPrimary,
  },
  listCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: spacing.stackMd,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.stackMd,
    gap: spacing.base,
  },
  viewAllText: {
    ...typography.labelBold,
    color: colors.primary,
  },
});
