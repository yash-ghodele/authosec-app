import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { brandColors, spacing, typography } from '@/constants/brand';
import { ReactNode } from 'react';
import { IconSymbol } from './ui/icon-symbol';

interface EmptyStateProps {
  icon?: string | ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  dark?: boolean;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
  dark = true,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          {typeof icon === 'string' ? (
            <IconSymbol size={64} name={icon} color={brandColors.light[500]} />
          ) : (
            icon
          )}
        </View>
      )}
      <Text style={[styles.title, dark && styles.darkTitle]}>{title}</Text>
      {message && <Text style={[styles.message, dark && styles.darkMessage]}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  title: {
    ...typography.h4,
    color: brandColors.light[700],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  darkTitle: {
    color: brandColors.light[600],
  },
  message: {
    ...typography.body,
    color: brandColors.light[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  darkMessage: {
    color: brandColors.light[500],
  },
  actionButton: {
    backgroundColor: brandColors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  actionText: {
    ...typography.body,
    color: '#ffffff',
    fontWeight: '600',
  },
});

