import { useEffect, useRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useColors } from '@/context/ThemeContext';

export interface ActionSheetAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  icon?: string;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  message?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
}

export default function ActionSheet({ visible, title, message, actions, onClose }: ActionSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  function getActionColor(style?: 'default' | 'cancel' | 'destructive') {
    if (style === 'destructive') return colors.error;
    if (style === 'cancel') return colors.onSurfaceVariant;
    return colors.onSurface;
  }
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      backdropAnim.setValue(0);
    }
  }, [visible, slideAnim, backdropAnim]);

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#000',
    },
    sheet: {
      backgroundColor: colors.surfaceContainerHigh,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingTop: spacing.stackSm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 10,
    },
    header: {
      alignItems: 'center',
      paddingVertical: spacing.stackMd,
      paddingHorizontal: spacing.stackMd,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant + '4D',
      gap: spacing.base,
    },
    title: {
      ...typography.headlineMd,
      color: colors.onSurface,
    },
    message: {
      ...typography.bodyMd,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    actionsContainer: {
      paddingVertical: spacing.stackSm,
      gap: spacing.base,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.stackMd,
      paddingVertical: spacing.stackMd,
      gap: spacing.stackMd,
      marginHorizontal: spacing.stackSm,
      borderRadius: borderRadius.lg,
    },
    actionItemPressed: {
      backgroundColor: colors.primary + '12',
    },
    actionText: {
      ...typography.bodyLg,
    },
    cancelGap: {
      height: spacing.stackSm,
    },
    cancelContainer: {
      paddingBottom: spacing.stackSm,
    },
    cancelItem: {
      alignItems: 'center',
      paddingVertical: spacing.stackMd,
      marginHorizontal: spacing.stackSm,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
    },
    cancelText: {
      ...typography.bodyLg,
      color: colors.onSurfaceVariant,
      fontFamily: 'HankenGrotesk_700Bold',
      fontWeight: '700',
    },
  }), [colors]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + spacing.stackSm,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {message && <Text style={styles.message}>{message}</Text>}
            </View>
          )}

          <View style={styles.actionsContainer}>
            {actions
              .filter((a) => a.style !== 'cancel')
              .map((action, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [
                    styles.actionItem,
                    pressed && styles.actionItemPressed,
                  ]}
                  onPress={() => {
                    onClose();
                    setTimeout(() => action.onPress?.(), 250);
                  }}
                >
                  {action.icon && (
                    <MaterialIcons
                      name={action.icon as any}
                      size={20}
                      color={getActionColor(action.style)}
                    />
                  )}
                  <Text
                    style={[
                      styles.actionText,
                      { color: getActionColor(action.style) },
                    ]}
                  >
                    {action.text}
                  </Text>
                </Pressable>
              ))}
          </View>

          {actions.some((a) => a.style === 'cancel') && (
            <>
              <View style={styles.cancelGap} />
              <View style={styles.cancelContainer}>
                {actions
                  .filter((a) => a.style === 'cancel')
                  .map((action, i) => (
                    <Pressable
                      key={i}
                      style={({ pressed }) => [
                        styles.cancelItem,
                        pressed && styles.actionItemPressed,
                      ]}
                      onPress={() => {
                        onClose();
                        setTimeout(() => action.onPress?.(), 250);
                      }}
                    >
                      <Text style={styles.cancelText}>{action.text}</Text>
                    </Pressable>
                  ))}
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}


