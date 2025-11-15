import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { brandColors, spacing, borderRadius, shadows, glassEffect } from '@/constants/brand';
import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  style?: ViewStyle;
  dark?: boolean;
}

export function StatCard({ label, value, icon, trend, style, dark = true }: StatCardProps) {
  return (
    <View style={[styles.card, dark && styles.darkCard, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trend, trend.isPositive ? styles.trendPositive : styles.trendNegative]}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    alignItems: 'center',
    minHeight: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
  },
  darkCard: {
    ...glassEffect,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    color: brandColors.light[600],
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: brandColors.light[900],
    marginBottom: spacing.xs,
  },
  trendContainer: {
    marginTop: spacing.xs,
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendPositive: {
    color: brandColors.success[500],
  },
  trendNegative: {
    color: brandColors.error[500],
  },
});

