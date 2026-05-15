import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Animated, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import BukuKiosLogo from './BukuKiosLogo';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon as any} size={20} color={colors.onSurfaceVariant} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const techStack = [
  'Expo SDK 55',
  'React Native',
  'TypeScript',
  'Reanimated',
  'AsyncStorage',
  'Expo Router',
];

export default function AboutModal({ visible, onClose }: AboutModalProps) {
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

            <View style={styles.logoSection}>
              <BukuKiosLogo size={80} color={colors.primary} accentColor={colors.secondary} />
              <Text style={styles.appName}>BukuKios</Text>
              <Text style={styles.tagline}>Buku Besar Digital</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <InfoRow icon="info" label="Versi" value="1.0.0 Beta" />
              <InfoRow icon="person" label="Developer" value="Afdhal RZ" />
              <InfoRow icon="description" label="Lisensi" value="MIT" />
              <InfoRow icon="smartphone" label="Platform" value="React Native" />
            </View>

            <View style={styles.divider} />

            <Text style={styles.techTitle}>Teknologi</Text>
            <View style={styles.chipContainer}>
              {techStack.map((tech) => (
                <View key={tech} style={styles.chip}>
                  <Text style={styles.chipText}>{tech}</Text>
                </View>
              ))}
            </View>

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
    alignItems: 'center',
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
  logoSection: {
    alignItems: 'center',
    gap: spacing.stackSm,
    paddingTop: spacing.stackLg,
  },
  appName: {
    ...typography.headlineLg,
    color: colors.primary,
  },
  tagline: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.outlineVariant + '4D',
    marginVertical: spacing.stackSm,
  },
  infoSection: {
    width: '100%',
    gap: spacing.stackMd,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  infoLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    width: 80,
  },
  infoValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: 'HankenGrotesk_600SemiBold',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  techTitle: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    alignSelf: 'flex-start',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.stackSm,
  },
  chip: {
    paddingHorizontal: spacing.stackMd,
    paddingVertical: spacing.stackSm - 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '12',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  chipText: {
    ...typography.labelSm,
    color: colors.primary,
    fontFamily: 'HankenGrotesk_600SemiBold',
    fontWeight: '600',
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
