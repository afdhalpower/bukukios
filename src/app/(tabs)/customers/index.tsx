import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import CustomerCard from '@/components/CustomerCard';
import SearchBar from '@/components/SearchBar';
import Avatar from '@/components/Avatar';
import BukuKiosLogo from '@/components/BukuKiosLogo';
import FAB from '@/components/FAB';
import { useDrawer } from '@/context/DrawerContext';
import { useCustomers } from '@/storage/hooks';

export default function CustomerListScreen() {
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const { customers, loading, refresh } = useCustomers();
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={openDrawer}>
            <MaterialIcon name="menu" color={colors.primary} size={24} />
          </Pressable>
          <BukuKiosLogo size={32} showText={false} color={colors.primary} accentColor={colors.secondary} />
        </View>
        <Avatar initials="AS" size={40} source="https://lh3.googleusercontent.com/aida-public/AB6AXuDj1dEucV-szJbQ7tssvb-enoaXmNndFTJTWPyHmOfQV94G24gzB2Y7gB9e9mihGfJ28tdnmg94EEegeU1-0YHVncqujZBXrSmSpJVZyCEhNfWeRXnbXyUloKXJDzlHJiDS0EQzDklzQVxUP-gDWe3-y_2JXX7mAtX2UajC0dlNFLaLsbca5VSgRKOaOwzocdpTUI8NEggB8duCgJcLIatH5mPUWxGigUDtkK8gMHwr6GglOp0IeeKmO-rWd-iKnmbp36c1dCR1yw" />
      </View>

      <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Daftar Pelanggan</Text>
            <Text style={styles.subtitle}>
              Kelola kontak dan pantau saldo utang piutang.
            </Text>
          </View>

          <SearchBar value={search} onChangeText={setSearch} />

          <View style={styles.list}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcon name="search-off" color={colors.outline} size={48} />
                <Text style={styles.emptyTitle}>Tidak Ditemukan</Text>
                <Text style={styles.emptySubtitle}>
                  {search ? 'Tidak ada pelanggan dengan nama atau nomor tersebut.' : 'Belum ada pelanggan. Tekan tombol + untuk menambahkan.'}
                </Text>
              </View>
            ) : (
              filtered.map((customer, index) => (
                <CustomerCard
                  key={customer.id}
                  name={customer.name}
                  initials={customer.initials}
                  phone={customer.phone}
                  amount={customer.totalDebt}
                  status={customer.totalDebt > 0 ? 'utang' : 'lunas'}
                  onPress={() => router.push(`/customers/${customer.id}`)}
                  index={index}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <FAB onPress={() => router.push('/customers/tambah-pelanggan')} />
    </View>
  );
}

function MaterialIcon({ name, color, size }: { name: any; color: string; size: number }) {
  const MaterialIcons = require('@expo/vector-icons/MaterialIcons').default;
  return <MaterialIcons name={name} size={size} color={color} />;
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.containerPadding,
    gap: spacing.stackMd,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 100,
  },
  titleSection: {
    gap: spacing.base,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  list: {
    gap: spacing.stackSm,
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
});
