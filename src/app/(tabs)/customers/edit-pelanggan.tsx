import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { getCustomer, saveCustomer, deleteCustomer } from '@/storage/database';
import type { Customer } from '@/types';
import MaterialIcon from '@/components/MaterialIcon';

export default function EditPelangganScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'Grosir' | 'Eceran'>('Eceran');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      if (!id) return;
      const c = await getCustomer(id);
      if (c) {
        setCustomer(c);
        setName(c.name);
        setPhone(c.phone);
        setCategory(c.category === 'Grosir' ? 'Grosir' : 'Eceran');
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nama pelanggan wajib diisi';
    if (!phone.trim()) errs.phone = 'Nomor telepon wajib diisi';
    else if (!/^08\d{8,13}$/.test(phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Format nomor telepon tidak valid';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate() || !customer) return;
    setSaving(true);
    try {
      const updated: Customer = {
        ...customer,
        name: name.trim(),
        phone: phone.trim(),
        category,
      };
      await saveCustomer(updated);
      Alert.alert('Berhasil', `Data "${updated.name}" berhasil diperbarui.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;
    if (customer.totalDebt > 0) {
      Alert.alert(
        'Tidak Bisa Dihapus',
        `Pelanggan "${customer.name}" masih memiliki utang aktif sebesar Rp ${customer.totalDebt.toLocaleString('id-ID')}. Lunasi terlebih dahulu sebelum menghapus.`,
        [{ text: 'OK' }],
      );
      return;
    }
    Alert.alert(
      'Hapus Pelanggan',
      `Yakin ingin menghapus "${customer.name}"? Semua riwayat transaksi juga akan dihapus. Tindakan ini tidak bisa dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteCustomer(customer.id);
            if (ok) {
              Alert.alert('Berhasil', 'Pelanggan berhasil dihapus.', [
                { text: 'OK', onPress: () => router.dismiss(2) },
              ]);
            } else {
              Alert.alert('Gagal', 'Tidak bisa menghapus pelanggan.');
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Pelanggan tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dragHandle} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcon name="arrow-back" color={colors.primary} size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Pelanggan</Text>
        </View>
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <MaterialIcon name="delete" color={colors.error} size={22} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formHeaderLabel}>DATA PELANGGAN</Text>
              <Text style={styles.formHeaderTitle}>Edit Data Pelanggan</Text>
            </View>

            <View style={styles.formBody}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Nama Pelanggan *</Text>
                <View style={[styles.inputWrapper, errors.name ? { borderColor: colors.error } : {}]}>
                  <MaterialIcon name="person" color={colors.outline} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nama pelanggan"
                    placeholderTextColor={colors.outline}
                    value={name}
                    onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: '' })); }}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Nomor Telepon *</Text>
                <View style={[styles.inputWrapper, errors.phone ? { borderColor: colors.error } : {}]}>
                  <MaterialIcon name="phone" color={colors.outline} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nomor telepon"
                    placeholderTextColor={colors.outline}
                    value={phone}
                    onChangeText={(t) => { setPhone(t); setErrors((e) => ({ ...e, phone: '' })); }}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Kategori</Text>
                <View style={styles.categoryRow}>
                  <Pressable
                    style={[styles.categoryOption, category === 'Eceran' && styles.categoryActive]}
                    onPress={() => setCategory('Eceran')}
                  >
                    <MaterialIcon
                      name={category === 'Eceran' ? 'radio-button-checked' : 'radio-button-unchecked'}
                      color={category === 'Eceran' ? colors.primary : colors.outline}
                      size={20}
                    />
                    <Text style={[styles.categoryLabel, category === 'Eceran' && { color: colors.primary }]}>
                      Eceran
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.categoryOption, category === 'Grosir' && styles.categoryActive]}
                    onPress={() => setCategory('Grosir')}
                  >
                    <MaterialIcon
                      name={category === 'Grosir' ? 'radio-button-checked' : 'radio-button-unchecked'}
                      color={category === 'Grosir' ? colors.primary : colors.outline}
                      size={20}
                    />
                    <Text style={[styles.categoryLabel, category === 'Grosir' && { color: colors.primary }]}>
                      Grosir
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.submitButton, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <MaterialIcon name="save" color={colors.onPrimary} size={20} />
                )}
                <Text style={styles.submitLabel}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.containerPadding, height: 64,
    backgroundColor: colors.surface + 'CC',
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '4D',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.headlineMd, color: colors.primary },
  deleteButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { padding: spacing.containerPadding, gap: spacing.stackLg, maxWidth: 600, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  formCard: {
    backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant,
    borderRadius: borderRadius.xl, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  formHeader: { padding: spacing.containerPadding, paddingBottom: spacing.stackLg, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  formHeaderLabel: { ...typography.labelBold, color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.base },
  formHeaderTitle: { ...typography.headlineLg, color: colors.onSurface },
  formBody: { padding: spacing.containerPadding, gap: spacing.stackLg },
  field: { gap: spacing.base },
  fieldLabel: { ...typography.labelBold, color: colors.onSurfaceVariant },
  errorText: { ...typography.labelSm, color: colors.error, marginTop: 2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: colors.outlineVariant,
    borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.stackMd, height: 48,
  },
  inputIcon: { marginRight: spacing.stackSm },
  input: { ...typography.bodyMd, color: colors.onSurface, flex: 1, height: '100%' },
  categoryRow: { flexDirection: 'row', gap: spacing.stackMd },
  categoryOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.stackSm, paddingVertical: spacing.stackSm + 4, borderRadius: borderRadius.lg,
    borderWidth: 2, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainer,
  },
  categoryActive: { borderColor: colors.primary, backgroundColor: colors.primaryContainer + '44' },
  categoryLabel: { ...typography.labelBold, color: colors.onSurfaceVariant },
  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.stackSm,
    backgroundColor: colors.primary, paddingVertical: spacing.stackMd, borderRadius: borderRadius.xl, height: 56,
  },
  submitLabel: { ...typography.headlineMd, color: colors.onPrimary },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant,
    alignSelf: 'center', marginTop: spacing.stackSm,
  },
});
