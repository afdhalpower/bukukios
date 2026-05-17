import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useColors } from '@/context/ThemeContext';
import { useMemo } from 'react';

const AVATAR_PALETTE = [
  '#0e4c5e', '#2c694e', '#8b122c', '#104d5f', '#316e52',
  '#005a5a', '#4a2c6e', '#6e4a2c', '#2c4a6e', '#5a2c5a',
];

function hashColor(initials: string): string {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

interface AvatarProps {
  initials: string;
  size?: number;
  bgColor?: string;
  textColor?: string;
  source?: string;
}

export default function Avatar({
  initials,
  size = 48,
  bgColor,
  textColor = '#ffffff',
  source,
}: AvatarProps) {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create({
    image: {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    fallback: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    initials: {
      fontWeight: '700',
    },
  }), [colors]);

  if (source) {
    return (
      <Animated.View entering={ZoomIn.springify().duration(400)}>
        <Image
          source={{ uri: source }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={ZoomIn.springify().duration(400)}
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor || hashColor(initials),
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            color: textColor,
            fontSize: size * 0.4,
          },
        ]}
      >
        {initials}
      </Text>
    </Animated.View>
  );
}


