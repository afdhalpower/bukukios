import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { saveCustomer } from '@/storage/database';
import { getInitials, getCurrentMonthYear } from '@/utils/formatters';
import MaterialIcon from '@/components/MaterialIcon';

export default function TambahPelangganScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'Grosir' | 'Eceran'>('Eceran');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const newCustomer = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
        initials: getInitials(name),
        totalDebt: 0,
        status: 'lunas' as const,
        category,
        since: getCurrentMonthYear(),
      };
      await saveCustomer(newCustomer);
      Alert.alert('Berhasil', `Pelanggan "${newCustomer.name}" berhasil ditambahkan.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan pelanggan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.dragHandle} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcon name="arrow-back" color={colors.primary} size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Tambah Pelanggan</Text>
        </View>
        <View style={styles.avatarSmall}>
          <MaterialIcon name="person-add" color={colors.primary} size={20} />
        </View>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formHeaderLabel}>DATA PELANGGAN</Text>
              <Text style={styles.formHeaderTitle}>Input Data Pelanggan Baru</Text>
            </View>

            <View style={styles.formBody}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Nama Pelanggan *</Text>
                <View style={[styles.inputWrapper, errors.name ? { borderColor: colors.error } : {}]}>
                  <MaterialIcon name="person" color={colors.outline} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Ahmad Hidayat"
                    placeholderTextColor={colors.outline}
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      setErrors((e) => ({ ...e, name: '' }));
                    }}
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
                    placeholder="Contoh: 0812-3456-7890"
                    placeholderTextColor={colors.outline}
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t);
                      setErrors((e) => ({ ...e, phone: '' }));
                    }}
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
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <MaterialIcon name="person-add" color={colors.onPrimary} size={20} />
                )}
                <Text style={styles.submitLabel}>{saving ? 'Menyimpan...' : 'Simpan Pelanggan'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MaterialIcon name="info" color={colors.onTertiaryFixed} size={20} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Informasi</Text>
              <Text style={styles.infoBody}>
                Pelanggan baru akan ditambahkan dengan saldo utang Rp 0. Anda dapat mulai mencatat transaksi setelah pelanggan dibuat.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  avatarSmall: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.onPrimary,
  },
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
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.stackMd,
    padding: spacing.containerPadding, backgroundColor: colors.tertiaryFixed, borderRadius: borderRadius.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  infoText: { flex: 1, gap: spacing.base },
  infoTitle: { ...typography.labelBold, color: colors.onTertiaryFixed },
  infoBody: { ...typography.bodyMd, color: colors.onTertiaryFixed + 'E6' },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant,
    alignSelf: 'center', marginTop: spacing.stackSm,
  },
});
