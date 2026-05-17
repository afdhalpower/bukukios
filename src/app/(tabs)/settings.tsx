import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Share, Linking, Platform, Alert, Modal, TextInput } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import Avatar from '@/components/Avatar';
import BukuKiosLogo from '@/components/BukuKiosLogo';
import ActionSheet from '@/components/ActionSheet';
import AboutModal from '@/components/AboutModal';
import HelpModal from '@/components/HelpModal';
import { useTheme } from '@/context/ThemeContext';
import { useDrawer } from '@/context/DrawerContext';
import { clearAllData, getCustomers, getTransactions, getProfile, saveProfile } from '@/storage/database';
import type { Profile } from '@/storage/database';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { exportCSV, exportTextReport, backupJSON, importFromJSON } from '@/utils/export';
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
  const [showHelp, setShowHelp] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [restoreJson, setRestoreJson] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [profile, setProfile] = useState<Profile>({ name: 'Admin Toko', email: 'admin@bukukios.id', initials: 'AS' });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);
    })();
  }, []);

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
          <Avatar initials={profile.initials} size={72} source={profile.avatarUrl || DEFAULT_AVATAR_URL} />
          <Text style={[styles.profileName, { color: colors.onSurface }]}>{profile.name}</Text>
          <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>{profile.email}</Text>
          <Pressable
            style={styles.editProfileButton}
            onPress={() => { setEditName(profile.name); setEditEmail(profile.email); setShowEditProfile(true); }}
          >
            <MaterialIcon name="edit" color={colors.primary} size={16} />
            <Text style={styles.editProfileLabel}>Edit Profil</Text>
          </Pressable>
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
            onPress={() => setShowHelp(true)}
          />
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '4D' }]} />
          <SettingItem
            icon="star"
            title="Beri Penilaian"
            subtitle="Bantu kami berkembang"
            onPress={() => {
              const url = Platform.select({
                android: 'https://play.google.com/store/apps/details?id=com.bukukios.app',
                ios: 'https://apps.apple.com/app/id123456789',
                web: '',
              });
              if (url) {
                Linking.openURL(url).catch(() => Alert.alert('Gagal', 'Tidak dapat membuka toko aplikasi'));
              } else {
                Alert.alert('Fitur Mobile', 'Beri penilaian tersedia di aplikasi Android atau iOS');
              }
            }}
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
          { text: 'Restore JSON', icon: 'cloud-upload', onPress: () => { setShowKelola(false); setTimeout(() => setShowRestore(true), 300); }},
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

      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <Modal visible={showEditProfile} animationType="slide" transparent={false} onRequestClose={() => setShowEditProfile(false)}>
        <View style={styles.restoreContainer}>
          <View style={styles.restoreHeader}>
            <Text style={styles.restoreTitle}>Edit Profil</Text>
            <Pressable onPress={() => setShowEditProfile(false)}>
              <MaterialIcon name="close" color={colors.onSurfaceVariant} size={24} />
            </Pressable>
          </View>
          <Text style={styles.restoreInfo}>Nama Toko</Text>
          <TextInput
            style={styles.profileInput}
            placeholder="Nama"
            placeholderTextColor={colors.outline}
            value={editName}
            onChangeText={setEditName}
          />
          <Text style={[styles.restoreInfo, { marginTop: spacing.stackMd }]}>Email</Text>
          <TextInput
            style={styles.profileInput}
            placeholder="Email"
            placeholderTextColor={colors.outline}
            value={editEmail}
            onChangeText={setEditEmail}
            keyboardType="email-address"
          />
          <Pressable
            style={[styles.restoreButton, { backgroundColor: colors.primary, marginTop: spacing.stackLg }]}
            onPress={async () => {
              const initials = editName.trim().split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) || 'AS';
              const updated: Profile = { name: editName.trim(), email: editEmail.trim(), initials };
              await saveProfile(updated);
              setProfile(updated);
              setShowEditProfile(false);
            }}
          >
            <Text style={styles.restoreButtonLabel}>Simpan</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={showRestore} animationType="slide" transparent={false} onRequestClose={() => setShowRestore(false)}>
        <View style={styles.restoreContainer}>
          <View style={styles.restoreHeader}>
            <Text style={styles.restoreTitle}>Restore Data</Text>
            <Pressable onPress={() => setShowRestore(false)}>
              <MaterialIcon name="close" color={colors.onSurfaceVariant} size={24} />
            </Pressable>
          </View>
          <Text style={styles.restoreInfo}>
            Paste konten file backup JSON di bawah ini. Data yang ada saat ini akan ditimpa.
          </Text>
          <TextInput
            style={styles.restoreInput}
            multiline
            placeholder="Paste JSON backup di sini..."
            placeholderTextColor={colors.outline}
            value={restoreJson}
            onChangeText={setRestoreJson}
          />
          <Pressable
            style={[styles.restoreButton, isRestoring && { opacity: 0.7 }]}
            disabled={isRestoring}
            onPress={async () => {
              if (!restoreJson.trim()) { Alert.alert('Error', 'Harap paste konten backup'); return; }
              setIsRestoring(true);
              const result = await importFromJSON(restoreJson);
              if (result.success) {
                Alert.alert('Berhasil', result.message);
                setShowRestore(false);
                setRestoreJson('');
              } else {
                Alert.alert('Gagal', result.message);
              }
              setIsRestoring(false);
            }}
          >
            <Text style={styles.restoreButtonLabel}>
              {isRestoring ? 'Memulihkan...' : 'Restore Data'}
            </Text>
          </Pressable>
        </View>
      </Modal>
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
  restoreContainer: {
    flex: 1, backgroundColor: colors.background, padding: spacing.containerPadding,
  },
  restoreHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.stackMd,
  },
  restoreTitle: {
    ...typography.headlineLg, color: colors.onSurface,
  },
  restoreInfo: {
    ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: spacing.stackMd,
  },
  restoreInput: {
    flex: 1, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg,
    padding: spacing.stackMd, ...typography.bodyMd, color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest, textAlignVertical: 'top',
  },
  restoreButton: {
    backgroundColor: colors.error, paddingVertical: spacing.stackMd, borderRadius: borderRadius.xl,
    alignItems: 'center', marginTop: spacing.stackMd,
  },
  restoreButtonLabel: {
    ...typography.headlineMd, color: colors.onPrimary,
  },
  editProfileButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.base,
    marginTop: spacing.stackSm, paddingVertical: spacing.base, paddingHorizontal: spacing.stackMd,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  editProfileLabel: {
    ...typography.labelBold, color: colors.primary,
  },
  profileInput: {
    borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.lg,
    padding: spacing.stackMd, ...typography.bodyMd, color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
  },
});
