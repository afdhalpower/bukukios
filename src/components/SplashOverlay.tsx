import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import BukuKiosLogo from './BukuKiosLogo';

interface SplashOverlayProps {
  visible: boolean;
}

export default function SplashOverlay({ visible }: SplashOverlayProps) {
  if (!visible) return null;

  return (
    <Animated.View
      style={styles.container}
      exiting={FadeOut.duration(400)}
    >
      <Animated.View entering={ZoomIn.springify().damping(12).stiffness(100)}>
        <BukuKiosLogo size={80} color="#ffffff" accentColor="#ffb2b9" />
      </Animated.View>
      <Text style={styles.subtitle}>Buku Besar Digital</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4648d4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 100,
  },
  subtitle: {
    fontFamily: 'HankenGrotesk_400Regular',
    fontSize: 16,
    color: '#ffffffCC',
    letterSpacing: 0.5,
  },
});
