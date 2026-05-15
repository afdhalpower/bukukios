import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Animated, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FaqItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

function FaqItem({ question, answer, defaultOpen }: FaqItemProps) {
  const [open, setOpen] = useState(defaultOpen || false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <View style={styles.faqItem}>
      <Pressable style={styles.faqHeader} onPress={toggle}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <MaterialIcons
          name={open ? 'expand-less' : 'expand-more'}
          size={20}
          color={colors.onSurfaceVariant}
        />
      </Pressable>
      {open && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

const faqs: FaqItemProps[] = [
  {
    question: 'Cara menambah pelanggan baru',
    answer: 'Buka tab "Pelanggan" di bagian bawah, lalu tap tombol "+" (FAB) di pojok kanan bawah. Isi nama, inisial, dan kategori pelanggan (Grosir/Eceran), lalu tap "Simpan".',
  },
  {
    question: 'Cara mencatat transaksi utang',
    answer: 'Buka detail pelanggan, tap tombol "Tambah Utang". Pilih tanggal (DD/MM/YYYY), masukkan jumlah, dan tambahkan deskripsi jika perlu. Atur jatuh tempo (opsional). Tap "Simpan" untuk mencatat.',
  },
  {
    question: 'Cara mencatat pembayaran',
    answer: 'Buka detail pelanggan, tap tombol "Bayar". Masukkan jumlah yang dibayarkan dan tanggal pembayaran. Tap "Simpan" untuk mencatat. Status pelanggan akan otomatis berubah menjadi "Lunas" jika utang lunas.',
  },
  {
    question: 'Cara melihat laporan keuangan',
    answer: 'Buka tab "Laporan" di bagian bawah. Di sini Anda bisa melihat total piutang, total yang sudah dibayar, tren bulanan dalam bentuk grafik, dan ranking pelanggan berdasarkan jumlah utang.',
  },
  {
    question: 'Cara export data',
    answer: 'Buka tab "Pengaturan", gulir ke bagian "Data", tap "Kelola Data". Pilih "Export CSV" untuk data transaksi, "Export Laporan" untuk ringkasan, atau "Backup JSON" untuk cadangan data lengkap.',
  },
  {
    question: 'Apa arti status Aktif / Lunas?',
    answer: '"Aktif" berarti pelanggan masih memiliki utang yang belum dibayar. "Lunas" berarti semua utang pelanggan sudah dibayar. Status berubah otomatis saat Anda mencatat transaksi baru atau pembayaran.',
  },
  {
    question: 'Cara mengaktifkan pengingat jatuh tempo',
    answer: 'Buka tab "Pengaturan", cari bagian "Notifikasi". Aktifkan toggle "Pengingat Jatuh Tempo". Anda akan mendapat notifikasi H-3 dan pada hari H jatuh tempo utang pelanggan.',
  },
];

export default function HelpModal({ visible, onClose }: HelpModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, damping: 14, stiffness: 120, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, scaleAnim]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            styles.modal,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </Pressable>

            <View style={styles.headerSection}>
              <MaterialIcons name="help" size={40} color={colors.primary} />
              <Text style={styles.headerTitle}>Bantuan & FAQ</Text>
              <Text style={styles.headerSubtitle}>Panduan penggunaan aplikasi BukuKios</Text>
            </View>

            <View style={styles.divider} />

            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}

            <Pressable style={styles.tutupButton} onPress={onClose}>
              <Text style={styles.tutupText}>Tutup</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.stackLg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  scrollContent: {
    padding: spacing.stackLg,
    gap: spacing.stackMd,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.stackMd,
    right: spacing.stackMd,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '10',
    zIndex: 1,
  },
  headerSection: {
    alignItems: 'center',
    gap: spacing.stackSm,
    paddingTop: spacing.stackLg,
  },
  headerTitle: {
    ...typography.headlineLg,
    color: colors.primary,
  },
  headerSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.outlineVariant + '4D',
    marginVertical: spacing.stackSm,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.stackMd,
    backgroundColor: colors.surfaceContainerLowest,
  },
  faqQuestion: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.stackSm,
  },
  faqAnswer: {
    padding: spacing.stackMd,
    paddingTop: 0,
    backgroundColor: colors.surfaceContainerLowest,
  },
  faqAnswerText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  tutupButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.stackMd,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    marginTop: spacing.stackSm,
  },
  tutupText: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
});
