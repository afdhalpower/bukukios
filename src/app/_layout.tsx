import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/context/ThemeContext';
import { DrawerProvider } from '@/context/DrawerContext';
import { colors } from '@/constants/theme';
import { initializeDatabase } from '@/storage/database';
import SplashOverlay from '@/components/SplashOverlay';
import SideMenu from '@/components/SideMenu';
import { requestNotificationPermission } from '@/utils/notifications';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="tambah-transaksi"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(tabs)/customers/tambah-pelanggan"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(tabs)/customers/edit-pelanggan"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
  });
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => {
      setDbReady(true);
      requestNotificationPermission();
    });
  }, []);

  const ready = fontsLoaded && dbReady;

  useEffect(() => {
    if (ready) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <DrawerProvider>
          {ready ? <AppContent /> : <SplashOverlay visible />}
          <SideMenu />
        </DrawerProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
