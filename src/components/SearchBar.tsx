import { TextInput, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { timingConfig } from '@/constants/animations';
import { useState, useMemo } from 'react';
import { useColors } from '@/context/ThemeContext';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({
  placeholder = 'Cari nama atau nomor telepon...',
  value,
  onChangeText,
}: SearchBarProps) {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: borderRadius.xl,
      height: 48,
      paddingHorizontal: spacing.stackMd,
    },
    icon: {
      position: 'absolute',
      left: spacing.stackMd,
    },
    input: {
      ...typography.bodyMd,
      color: colors.onSurface,
      flex: 1,
      marginLeft: 28,
      height: '100%',
    },
    clearButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [colors]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(isFocused ? colors.primary : colors.outlineVariant, timingConfig),
    borderWidth: withTiming(isFocused ? 2 : 1, timingConfig),
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <MaterialIcons
        name="search"
        size={20}
        color={colors.outline}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          style={styles.clearButton}
          accessibilityLabel="Hapus pencarian"
        >
          <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
      )}
    </Animated.View>
  );
}


