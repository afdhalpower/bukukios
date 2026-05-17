import { Tabs } from 'expo-router';
import { useColors } from '@/context/ThemeContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface + 'CC',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'HankenGrotesk_500Medium',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Pelanggan',
          tabBarIcon: ({ color }) => <MaterialIcons name="group" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color }) => <MaterialIcons name="analytics" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Setelan',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
