import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface BukuKiosLogoProps {
  size?: number;
  showText?: boolean;
  color?: string;
  accentColor?: string;
}

export default function BukuKiosLogo({
  size = 48,
  showText = true,
  color = '#4648d4',
  accentColor = '#a93349',
}: BukuKiosLogoProps) {
  const iconSize = size * 0.45;
  const badgeSize = size * 0.2;

  return (
    <View style={[styles.container, { width: size, height: size + (showText ? 30 : 0) }]}>
      <View style={[styles.iconWrapper, { width: size, height: size, borderRadius: size * 0.25 }]}>
        <View style={[styles.bgLayer, { backgroundColor: color + '15' }]} />
        <View style={[styles.accentBar, { width: size * 0.06, backgroundColor: accentColor }]} />
        <MaterialIcons name="menu-book" size={iconSize} color={color} style={styles.bookIcon} />
        <View style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, backgroundColor: accentColor }]}>
          <Text style={[styles.badgeText, { fontSize: badgeSize * 0.55 }]}>K</Text>
        </View>
      </View>
      {showText && (
        <Text style={[styles.text, { color }]}>BukuKios</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: '10%',
    bottom: '10%',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  bookIcon: {
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  text: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
});
