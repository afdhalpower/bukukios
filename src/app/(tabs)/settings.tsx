import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Share, Linking } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import Avatar from '@/components/Avatar';
import BukuKiosLogo from '@/components/BukuKiosLogo';
import ActionSheet from '@/components/ActionSheet';
import AboutModal from '@/components/AboutModal';
import { useTheme } from '@/context/ThemeContext';
import { useDrawer } from '@/context/DrawerContext';
import { clearAllData, getCustomers, getTransactions } from '@/storage/database';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { exportCSV, exportTextReport, backupJSON } from '@/utils/export';
import { requestNotificationPermission, cancelAllNotifications, getScheduledNotifications } from '@/utils/notifications';
import MaterialIcon from '@/components/MaterialIcon';
import { DEFAULT_AVATAR_URL } from '@/constants/theme';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingItem({ icon, title, subtitle, onPress, rightElement, danger }: SettingItemProps) {
  const iconColor = danger ? colors.error : colors.onSurfaceVariant;
  const titleColor = danger ? colors.error : colors.onSurface;

  return (
    <Pressable
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={title}
    >
      <View style={[styles.iconCircle, { backgroundColor: danger ? colors.error + '15' : colors.primary + '15' }]}>
        <MaterialIcon name={icon} color={iconColor} size={22} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: titleColor }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>{subtitle}</Text>}
      </View>
      {rightElement}
      {!rightElement && onPress && (
        <MaterialIcon name="chevron-right" color={colors.onSurfaceVariant} size={20} />
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.primary }]}>{title}</Text>
  );
}

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { openDrawer } = useDrawer();
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showKelola, setShowKelola] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    (async () => {
      const scheduled = await getScheduledNotifications();
      setNotificationsEnabled(scheduled.length > 0);
    })();
  }, []);

  const [showNotifAlert, setShowNotifAlert] = useState(false);
  const [showResetResult, setShowResetResult] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
    } else {
      await cancelAllNotifications();
      setNotificationsEnabled(false);
      setShowNotifAlert(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Menu" onPress={openDrawer}>
          <MaterialIcon name="menu" color={colors.primary} size={24} />
        </Pressable>
        <BukuKiosLogo size={32} showText={false} color={colors.primary} accentColor={colors.secondary} />
        <Avatar initials="AS" size={40} source={DEFAULT_AVATAR_URL} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Avatar initials="AS" size={72} source={DEFAULT_AVATAR_URL} />
          <Text style={[styles.profileName, { color: colors.onSurface }]}>Admin Toko</Text>
          <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>admin@bukukios.id</Text>
        </View>

        <SectionHeader title="Tampilan" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingItem
            icon={theme === 'dark' ? 'dark-mode' : 'light-mode'}
            title="Mode Gelap"
            subtitle={theme === 'dark' ? 'Aktif' : 'Nonaktif'}
            rightElement={
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.outlineVariant + '4D', true: colors.primary }}
                thumbColor={colors.background}
              />
            }
          />
        </View>

        <SectionHeader title="Notifikasi" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingItem
            icon="notifications"
            title="Pengingat Jatuh Tempo"
            subtitle={notificationsEnabled ? 'Aktif' : 'Nonaktif'}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.outlineVariant + '4D', true: colors.primary }}
                thumbColor={colors.background}
              />
            }
          />
        </View>

        <SectionHeader title="Data" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingItem
            icon="storage"
            title="Kelola Data"
            subtitle="Cadangan & pulihkan data"
            onPress={() => setShowKelola(true)}
          />
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '4D' }]} />
          <SettingItem
            icon="delete-forever"
            title="Reset Data"
            subtitle="Hapus semua data pelanggan & transaksi"
            onPress={() => setShowReset(true)}
            danger
          />
        </View>

        <SectionHeader title="Tentang" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingItem
            icon="info"
            title="Versi Aplikasi"
            subtitle="1.0.0 (Beta)"
            onPress={() => setShowAbout(true)}
          />
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '4D' }]} />
          <SettingItem
            icon="help"
            title="Bantuan"
            subtitle="Panduan penggunaan & FAQ"
            onPress={() => setShowAbout(true)}
          />
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '4D' }]} />
          <SettingItem
            icon="star"
            title="Beri Penilaian"
            subtitle="Bantu kami berkembang"
            onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.bukukios.app')}
          />
        </View>

        <View style={styles.footer}>
          <BukuKiosLogo size={24} showText color={colors.onSurfaceVariant + '80'} accentColor={colors.error + '80'} />
          <Text style={[styles.footerText, { color: colors.onSurfaceVariant + '80' }]}>
            Buku Besar Digital — v1.0.0
          </Text>
        </View>
      </ScrollView>

      <ActionSheet
        visible={showKelola}
        title="Kelola Data"
        message="Pilih aksi:"
        actions={[
          { text: 'Export CSV', icon: 'table-chart', onPress: async () => {
            try { const csv = await exportCSV(); await Share.share({ message: csv, title: 'bukukios-transaksi.csv' }); }
            catch { setShowNotifAlert(true); }
          }},
          { text: 'Export Laporan', icon: 'description', onPress: async () => {
            try { const report = await exportTextReport(); await Share.share({ message: report, title: 'bukukios-laporan.txt' }); }
            catch { setShowNotifAlert(true); }
          }},
          { text: 'Backup JSON', icon: 'backup', onPress: async () => {
            try { const json = await backupJSON(); await Share.share({ message: json, title: 'bukukios-backup.json' }); }
            catch { setShowNotifAlert(true); }
          }},
          { text: 'Batal', style: 'cancel' },
        ]}
        onClose={() => setShowKelola(false)}
      />

      <ActionSheet
        visible={showReset}
        title="Reset Data"
        message="Semua data pelanggan dan transaksi akan dihapus. Tindakan ini tidak bisa dibatalkan."
        actions={[
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Reset', style: 'destructive', icon: 'delete-forever', onPress: async () => {
              setIsResetting(true);
              await clearAllData();
              setIsResetting(false);
              setShowResetResult(true);
            },
          },
        ]}
        onClose={() => setShowReset(false)}
      />

      <ActionSheet
        visible={showNotifAlert}
        title="Informasi"
        message="Semua pengingat jatuh tempo telah dibatalkan."
        actions={[{ text: 'OK', onPress: () => {} }]}
        onClose={() => setShowNotifAlert(false)}
      />

      <ActionSheet
        visible={showResetResult}
        title="Berhasil"
        message="Semua data telah direset."
        actions={[{ text: 'OK', onPress: () => {} }]}
        onClose={() => setShowResetResult(false)}
      />

      <AboutModal
        visible={showAbout}
        onClose={() => setShowAbout(false)}
      />
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
  scrollView: { flex: 1 },
  profileSection: {
    alignItems: 'center', paddingVertical: spacing.stackLg,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '4D',
  },
  profileName: { ...typography.headlineMd, marginTop: spacing.stackSm },
  profileEmail: { ...typography.bodyMd, marginTop: 2 },
  sectionHeader: {
    ...typography.labelSm, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.8, paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.stackMd, paddingBottom: spacing.stackSm,
  },
  card: {
    marginHorizontal: spacing.containerPadding,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.stackMd, paddingVertical: spacing.stackMd,
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  settingText: { flex: 1, marginLeft: spacing.stackSm },
  settingTitle: { ...typography.bodyMd, fontWeight: '600' },
  settingSubtitle: { ...typography.bodyMd, marginTop: 2 },
  divider: { height: 1, marginHorizontal: spacing.stackMd },
  footer: {
    alignItems: 'center', paddingVertical: spacing.stackLg, gap: spacing.stackSm,
  },
  footerText: { ...typography.bodyMd },
});
