import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColors } from '@/context/ThemeContext';
import { useEffect, useMemo } from 'react';

interface FABProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  isOpen?: boolean;
}

export default function FAB({ icon = 'add', onPress, isOpen = false }: FABProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulse.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      position: 'absolute',
      bottom: 80,
      right: 20,
      zIndex: 50,
    },
    fab: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
      overflow: 'hidden',
    },
    icon: {
      zIndex: 2,
    },
  }), [colors]);

  return (
    <Pressable
      onPress={onPress}
      style={styles.wrapper}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => {
        scale.value = withSpring(1);
        rotation.value = withSpring(isOpen ? 0 : 45);
      }}
    >
      <Animated.View style={[styles.fab, animatedStyle]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <MaterialIcons name={icon} size={28} color={colors.onPrimary} style={styles.icon} />
      </Animated.View>
    </Pressable>
  );
}


