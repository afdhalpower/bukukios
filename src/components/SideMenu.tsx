import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useDrawer } from '@/context/DrawerContext';
import BukuKiosLogo from './BukuKiosLogo';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.75, 300);

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  segment: string;
}

const menuItems: MenuItem[] = [
  { label: 'Beranda', icon: 'dashboard', route: '/', segment: '(tabs)' },
  { label: 'Pelanggan', icon: 'people', route: '/customers', segment: 'customers' },
  { label: 'Laporan', icon: 'bar-chart', route: '/reports', segment: 'reports' },
  { label: 'Pengaturan', icon: 'settings', route: '/settings', segment: 'settings' },
];

export default function SideMenu() {
  const { isOpen, closeDrawer } = useDrawer();
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const [rendered, setRendered] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRendered(false);
      });
    }
  }, [isOpen, slideAnim, backdropAnim]);

  const [pendingRoute, setPendingRoute] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (!isOpen && pendingRoute) {
      const typedRoute = pendingRoute.route as any;
      router.push(typedRoute);
      setPendingRoute(null);
    }
  }, [isOpen, pendingRoute, router]);

  const currentSegment = segments[segments.length - 1];

  const handleNavigate = (item: MenuItem) => {
    setPendingRoute(item);
    closeDrawer();
  };

  if (!rendered && !isOpen) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4],
            }),
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + spacing.stackMd,
          },
        ]}
      >
        <View style={styles.logoSection}>
          <BukuKiosLogo size={40} color={colors.onPrimary} accentColor="#ffb2b9" />
          <Text style={styles.appName}>BukuKios</Text>
          <Text style={styles.appTagline}>Buku Besar Digital</Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => {
            const isActive = currentSegment === item.segment;
            return (
              <Pressable
                key={item.segment}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => handleNavigate(item)}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={22}
                  color={isActive ? colors.primary : colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.menuLabel,
                    isActive && styles.menuLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
                {isActive && <View style={styles.activeDot} />}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: spacing.stackLg,
    paddingHorizontal: spacing.stackMd,
    backgroundColor: colors.primary,
    gap: spacing.stackSm,
  },
  appName: {
    ...typography.headlineMd,
    color: colors.onPrimary,
  },
  appTagline: {
    ...typography.bodyMd,
    color: colors.onPrimary + 'CC',
  },
  menuSection: {
    paddingVertical: spacing.stackSm,
    gap: spacing.base,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.stackMd,
    paddingVertical: spacing.stackMd,
    gap: spacing.stackMd,
    marginHorizontal: spacing.stackSm,
    borderRadius: borderRadius.lg,
  },
  menuItemActive: {
    backgroundColor: colors.primary + '12',
  },
  menuLabel: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  menuLabelActive: {
    color: colors.primary,
    fontFamily: 'HankenGrotesk_700Bold',
    fontWeight: '700',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
