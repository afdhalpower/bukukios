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
  Platform,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useCustomers, useAddTransaction, useEditTransaction } from '@/storage/hooks';
import { scheduleDueDateReminder, cancelNotificationByTransactionId } from '@/utils/notifications';
import { formatDate } from '@/storage/database';
import { formatDateInput, parseDateInput } from '@/utils/formatters';
import MaterialIcon from '@/components/MaterialIcon';

type TransactionType = 'utang' | 'bayar';

export default function TambahTransaksiScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    customerId?: string;
    type?: 'utang' | 'bayar';
    editId?: string;
    amount?: string;
    description?: string;
    date?: string;
  }>();
  const { customers } = useCustomers();
  const { add, saving } = useAddTransaction();

  const isEditing = !!params.editId;
  const { edit: editTransaction } = useEditTransaction();

  const [txType, setTxType] = useState<TransactionType>(params.type || 'utang');
  const [selectedCustomerId, setSelectedCustomerId] = useState(params.customerId || '');
  const [selectedCustomerName, setSelectedCustomerName] = useState(() => {
    if (params.customerId) {
      const c = customers.find((cust) => cust.id === params.customerId);
      return c?.name || '';
    }
    return '';
  });
  const [amountText, setAmountText] = useState(params.amount || '');
  const [dateText, setDateText] = useState(params.date || formatDateInput(new Date()));
  const [dueDateText, setDueDateText] = useState('');
  const [description, setDescription] = useState(params.description || '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!selectedCustomerId) errs.customer = 'Pilih pelanggan terlebih dahulu';
    const amount = parseInt(amountText.replace(/\./g, ''), 10);
    if (!amount || amount <= 0) errs.amount = 'Jumlah harus lebih dari 0';
    if (!parseDateInput(dateText)) errs.date = 'Format tanggal DD/MM/YYYY';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const amount = parseInt(amountText.replace(/\./g, ''), 10);
    const date = parseDateInput(dateText)!;
    const dueDate = txType === 'utang' && dueDateText ? parseDateInput(dueDateText) || undefined : undefined;

    if (isEditing && params.editId) {
      await cancelNotificationByTransactionId(params.editId);
      await editTransaction(params.editId, { amount, description, date: formatDate(date), type: txType, customerId: selectedCustomerId });
      if (txType === 'utang' && dueDate) {
        const customer = customers.find((c) => c.id === selectedCustomerId);
        if (customer) {
          await scheduleDueDateReminder(params.editId, customer.name, amount, dueDate);
        }
      }
      Alert.alert('Berhasil', 'Transaksi berhasil diperbarui.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    const savedId = await add(selectedCustomerId, txType, amount, description, date, dueDate);

    if (txType === 'utang' && dueDate && savedId) {
      const customer = customers.find((c) => c.id === selectedCustomerId);
      if (customer) {
        await scheduleDueDateReminder(savedId, customer.name, amount, dueDate);
      }
    }

    Alert.alert('Berhasil', 'Transaksi berhasil disimpan.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  const customerSearch = selectedCustomerName.toLowerCase();
  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(customerSearch)
  );

  return (
    <View style={styles.container}>
      <View style={styles.dragHandle} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcon name="arrow-back" color={colors.primary} size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}</Text>
        </View>
        <View style={styles.avatarSmall}>
          <MaterialIcon name="person" color={colors.primary} size={20} />
        </View>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formHeaderLabel}>DETAIL PENCATATAN</Text>
              <Text style={styles.formHeaderTitle}>Input Data Transaksi</Text>
            </View>

            <Animated.View style={styles.formBody} entering={FadeInUp.duration(350)}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Pilih Pelanggan</Text>
                <View style={pickerStyles.wrapper}>
                  <Pressable
                    style={[pickerStyles.trigger, errors.customer ? { borderColor: colors.error } : {}]}
                    onPress={() => setPickerOpen(!pickerOpen)}
                  >
                    <MaterialIcon name="search" color={colors.outline} size={20} style={pickerStyles.searchIcon} />
                    <Text
                      style={[
                        pickerStyles.triggerText,
                        !selectedCustomerName && { color: colors.outline },
                      ]}
                      numberOfLines={1}
                    >
                      {selectedCustomerName || 'Cari atau pilih nama pelanggan...'}
                    </Text>
                    <MaterialIcon name={pickerOpen ? 'expand-less' : 'expand-more'} color={colors.outline} size={20} />
                  </Pressable>
                  {errors.customer && <Text style={styles.errorText}>{errors.customer}</Text>}
                  {pickerOpen && (
                    <View style={pickerStyles.dropdown}>
                      <TextInput
                        style={pickerStyles.searchInput}
                        placeholder="Cari pelanggan..."
                        placeholderTextColor={colors.outline}
                        value={selectedCustomerName}
                        onChangeText={(t) => {
                          setSelectedCustomerName(t);
                          setSelectedCustomerId('');
                        }}
                      />
                      <ScrollView style={pickerStyles.list} keyboardShouldPersistTaps="handled">
                        {filteredCustomers.length === 0 ? (
                          <Text style={pickerStyles.emptyText}>Tidak ditemukan</Text>
                        ) : (
                          filteredCustomers.map((c) => (
                            <Pressable
                              key={c.id}
                              style={[
                                pickerStyles.option,
                                selectedCustomerId === c.id && pickerStyles.optionSelected,
                              ]}
                              onPress={() => {
                                setSelectedCustomerId(c.id);
                                setSelectedCustomerName(c.name);
                                setPickerOpen(false);
                                setErrors((e) => ({ ...e, customer: '' }));
                              }}
                            >
                              <Text
                                style={[
                                  pickerStyles.optionText,
                                  selectedCustomerId === c.id && pickerStyles.optionTextSelected,
                                ]}
                              >
                                {c.name}
                              </Text>
                              <Text style={pickerStyles.optionSub}>Rp {c.totalDebt.toLocaleString('id-ID')}</Text>
                            </Pressable>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Jenis Transaksi</Text>
                <View style={styles.toggleContainer}>
                  <Pressable
                    style={[styles.toggleOption, txType === 'utang' && styles.toggleActive]}
                    onPress={() => setTxType('utang')}
                  >
                    <MaterialIcon name="arrow-circle-down" color={txType === 'utang' ? colors.primary : colors.error} size={20} />
                    <Text style={[styles.toggleLabel, txType === 'utang' && { color: colors.primary }]}>Utang</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.toggleOption, txType === 'bayar' && styles.toggleActive2]}
                    onPress={() => setTxType('bayar')}
                  >
                    <MaterialIcon name="arrow-circle-up" color={txType === 'bayar' ? colors.secondary : colors.secondary} size={20} />
                    <Text style={[styles.toggleLabel, txType === 'bayar' && { color: colors.secondary }]}>Bayar</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Jumlah (IDR)</Text>
                <View style={[styles.amountWrapper, errors.amount ? { borderColor: colors.error } : {}]}>
                  <Text style={styles.amountPrefix}>Rp</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor={colors.outline}
                    keyboardType="numeric"
                    value={amountText}
                    onChangeText={(t) => {
                      const cleaned = t.replace(/[^0-9]/g, '');
                      setAmountText(cleaned);
                      setErrors((e) => ({ ...e, amount: '' }));
                    }}
                  />
                </View>
                {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Tanggal</Text>
                <View style={[styles.dateWrapper, errors.date ? { borderColor: colors.error } : {}]}>
                  <MaterialIcon name="calendar-today" color={colors.outline} size={20} />
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={colors.outline}
                    value={dateText}
                    onChangeText={(t) => {
                      setDateText(t);
                      setErrors((e) => ({ ...e, date: '' }));
                    }}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              </View>

              {txType === 'utang' && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Jatuh Tempo (Opsional)</Text>
                  <View style={styles.dateWrapper}>
                    <MaterialIcon name="event-note" color={colors.outline} size={20} />
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={colors.outline}
                      value={dueDateText}
                      onChangeText={setDueDateText}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Catatan Opsional</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Contoh: Pembelian stok beras 50kg..."
                  placeholderTextColor={colors.outline}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <Pressable
                style={[styles.submitButton, saving && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <MaterialIcon name="save" color={colors.onPrimary} size={20} />
                )}
                <Text style={styles.submitLabel}>{saving ? 'Menyimpan...' : 'Simpan Transaksi'}</Text>
              </Pressable>
            </Animated.View>
          </View>

          <View style={styles.infoCard}>
            <MaterialIcon name="info" color={colors.onTertiaryFixed} size={20} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Informasi</Text>
              <Text style={styles.infoBody}>
                Setiap transaksi yang Anda simpan akan secara otomatis memperbarui saldo total pelanggan yang bersangkutan.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  wrapper: { position: 'relative', zIndex: 20 },
  trigger: {
    flexDirection: 'row', alignItems: 'center', paddingLeft: 36,
    paddingRight: spacing.stackMd, height: 48,
    borderWidth: 2, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLowest,
  },
  searchIcon: { position: 'absolute', left: spacing.stackMd },
  triggerText: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  dropdown: {
    position: 'absolute', top: 52, left: 0, right: 0,
    backgroundColor: colors.surfaceContainerLowest, borderWidth: 1,
    borderColor: colors.outlineVariant, borderRadius: borderRadius.lg,
    elevation: 12, zIndex: 100, maxHeight: 280,
  },
  searchInput: {
    ...typography.bodyMd, color: colors.onSurface, padding: spacing.stackMd,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  list: { maxHeight: 200 },
  option: {
    paddingHorizontal: spacing.stackMd, paddingVertical: spacing.stackSm,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  optionSelected: { backgroundColor: colors.primaryFixedDim + '33' },
  optionText: { ...typography.bodyMd, color: colors.onSurface },
  optionTextSelected: { fontFamily: 'Inter_700Bold', color: colors.primary },
  optionSub: { ...typography.labelSm, color: colors.onSurfaceVariant, marginTop: 2 },
  emptyText: { ...typography.bodyMd, color: colors.outline, textAlign: 'center', padding: spacing.stackMd },
});

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
  toggleContainer: {
    flexDirection: 'row', gap: spacing.gutter, padding: spacing.base,
    backgroundColor: colors.surfaceContainer, borderRadius: borderRadius.xl,
  },
  toggleOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.stackSm, paddingVertical: spacing.stackSm + 4, borderRadius: borderRadius.lg,
    borderWidth: 2, borderColor: 'transparent',
  },
  toggleActive: { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.primaryContainer },
  toggleActive2: { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.onSecondaryContainer },
  toggleLabel: { ...typography.labelBold, color: colors.onSurfaceVariant },
  amountWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: colors.outlineVariant,
    borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.stackMd, height: 56,
  },
  amountPrefix: { ...typography.headlineMd, color: colors.outline, marginRight: spacing.stackSm },
  amountInput: { ...typography.headlineLg, color: colors.onSurface, flex: 1, height: '100%' },
  dateWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: colors.outlineVariant,
    borderRadius: borderRadius.lg, backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.stackMd, height: 48, gap: spacing.stackSm,
  },
  dateInput: { ...typography.bodyMd, color: colors.onSurface, flex: 1, height: '100%' },
  notesInput: {
    borderWidth: 2, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerLowest, padding: spacing.stackMd,
    ...typography.bodyMd, color: colors.onSurface, minHeight: 80,
  },
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
