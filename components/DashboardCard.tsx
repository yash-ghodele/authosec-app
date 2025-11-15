import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { brandColors, spacing, borderRadius, shadows, glassEffect } from '@/constants/brand';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  dark?: boolean;
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  onPress,
  style,
  variant = 'default',
  dark = true,
}: DashboardCardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;

  const cardStyles = [
    styles.card,
    dark && styles.darkCard,
    variant === 'primary' && styles.primaryCard,
    variant === 'success' && styles.successCard,
    variant === 'warning' && styles.warningCard,
    style,
  ];

  const valueStyles = [
    styles.value,
    variant === 'primary' && styles.primaryValue,
    variant === 'success' && styles.successValue,
    variant === 'warning' && styles.warningValue,
  ];

  return (
    <CardComponent style={cardStyles} onPress={onPress} activeOpacity={0.7}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={valueStyles}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
  },
  darkCard: {
    ...glassEffect,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  primaryCard: {
    borderColor: brandColors.primary[500],
    borderWidth: 1,
  },
  successCard: {
    borderColor: brandColors.success[500],
    borderWidth: 1,
  },
  warningCard: {
    borderColor: brandColors.warning[500],
    borderWidth: 1,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: brandColors.light[600],
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: brandColors.light[900],
    marginBottom: spacing.xs,
  },
  primaryValue: {
    color: brandColors.primary[500],
  },
  successValue: {
    color: brandColors.success[500],
  },
  warningValue: {
    color: brandColors.warning[500],
  },
  subtitle: {
    fontSize: 12,
    color: brandColors.light[500],
    marginTop: spacing.xs,
  },
});

