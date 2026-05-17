import { View, Text, StyleSheet, Pressable, Share, Alert } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { formatRupiah } from '@/utils/formatters';
import { formatDueDate, isOverdue, daysUntilDue } from '@/storage/database';
import type { Transaction, Customer } from '@/types';

interface ReceiptViewProps {
  transaction: Transaction;
  customer: Customer;
  onClose?: () => void;
}

export default function ReceiptView({ transaction, customer, onClose }: ReceiptViewProps) {
  async function handleShare() {
    try {
      const text = generateReceiptText();
      await Share.share({ message: text, title: 'Invoice' });
    } catch {
      Alert.alert('Gagal', 'Tidak bisa membagikan invoice.');
    }
  }

  async function handleSaveImage() {
    try {
      const text = `INVOICE ${transaction.invoice}\n${transaction.description}\n${formatRupiah(transaction.amount)}\n${transaction.date}`;
      await Share.share({ message: text, title: 'Invoice - BukuKios' });
    } catch {
      Alert.alert('Gagal', 'Tidak bisa menyimpan invoice.');
    }
  }

  function generateReceiptText(): string {
    let text = `INVOICE ${transaction.invoice}\n`;
    text += `${'='.repeat(30)}\n\n`;
    text += `Pelanggan: ${customer.name}\n`;
    text += `Telepon: ${customer.phone}\n`;
    text += `Kategori: ${customer.category}\n\n`;
    text += `Deskripsi: ${transaction.description}\n`;
    text += `Jumlah: ${formatRupiah(transaction.amount)}\n`;
    text += `Tanggal: ${transaction.date}\n`;
    text += `Lokasi: ${transaction.location}\n`;
    if (transaction.dueDate) {
      text += `Jatuh Tempo: ${formatDueDate(transaction.dueDate)}\n`;
    }
    text += `\nStatus: ${transaction.status}\n`;
    text += `${'='.repeat(30)}\n`;
    text += `BukuKios - Buku Besar Digital`;
    return text;
  }

  const overdue = isOverdue(transaction.dueDate);
  const days = daysUntilDue(transaction.dueDate);

  return (
    <View style={styles.container}>
      <View style={styles.receipt}>
        <View style={styles.header}>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>&times;</Text>
            </Pressable>
          )}
          <Text style={styles.logoText}>BukuKios</Text>
          <Text style={styles.invoiceNumber}>{transaction.invoice || 'BUKTI PEMBAYARAN'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PELANGGAN</Text>
          <Text style={styles.value}>{customer.name}</Text>
          <Text style={styles.subValue}>{customer.phone} • {customer.category}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DETAIL TRANSAKSI</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Deskripsi</Text>
            <Text style={styles.value}>{transaction.description}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Jumlah</Text>
            <Text style={[styles.amount, { color: transaction.type === 'utang' ? colors.error : colors.secondary }]}>
              {formatRupiah(transaction.amount)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal</Text>
            <Text style={styles.value}>{transaction.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lokasi</Text>
            <Text style={styles.value}>{transaction.location}</Text>
          </View>
          {transaction.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Jatuh Tempo</Text>
              <Text style={[styles.value, overdue && { color: colors.error }]}>
                {formatDueDate(transaction.dueDate)}
                {overdue && ` (Terlambat ${Math.abs(days)} hari)`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: transaction.type === 'utang' ? colors.errorContainer : colors.secondaryContainer }]}>
            <Text style={[styles.statusText, { color: transaction.type === 'utang' ? colors.error : colors.secondary }]}>
              {transaction.status}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BukuKios — Buku Besar Digital</Text>
          <Text style={styles.footerSub}>v1.0.0</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={handleShare}>
          <MaterialIcon name="share" color={colors.onPrimary} size={20} />
          <Text style={styles.actionLabel}>Bagikan</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={handleSaveImage}>
          <MaterialIcon name="download" color={colors.onPrimary} size={20} />
          <Text style={styles.actionLabel}>Simpan</Text>
        </Pressable>
      </View>
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
    padding: spacing.containerPadding,
  },
  receipt: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xl,
    padding: spacing.stackLg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.stackMd,
  },
  logoText: {
    ...typography.headlineLg,
    color: colors.primary,
    fontWeight: '800',
  },
  invoiceNumber: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    marginTop: spacing.base,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.stackMd,
  },
  section: {
    gap: spacing.stackSm,
    marginBottom: spacing.stackMd,
  },
  sectionLabel: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.base,
  },
  label: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  value: {
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: 'right',
    flex: 1,
  },
  subValue: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  amount: {
    ...typography.headlineMd,
    fontWeight: '700',
  },
  statusSection: {
    alignItems: 'center',
    marginTop: spacing.stackMd,
  },
  statusBadge: {
    paddingHorizontal: spacing.stackMd,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.labelBold,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.stackLg,
    paddingTop: spacing.stackMd,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  footerText: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
  footerSub: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.stackMd,
    marginTop: spacing.stackMd,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.stackSm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.stackMd,
    borderRadius: borderRadius.xl,
  },
  actionLabel: {
    ...typography.labelBold,
    color: colors.onPrimary,
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 22,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
});
