import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { brandColors, spacing, borderRadius, shadows, glassEffect } from '@/constants/brand';
import { IconSymbol } from './ui/icon-symbol';

export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
  ALERT = 'ALERT',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

interface NotificationCardProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: Date;
  onPress?: () => void;
  onMarkAsRead?: (id: string) => void;
  style?: ViewStyle;
  dark?: boolean;
}

export function NotificationCard({
  id,
  title,
  message,
  type,
  priority,
  isRead,
  createdAt,
  onPress,
  onMarkAsRead,
  style,
  dark = true,
}: NotificationCardProps) {
  const getTypeIcon = () => {
    switch (type) {
      case NotificationType.TRANSACTION:
        return 'arrow.left.arrow.right';
      case NotificationType.SECURITY:
        return 'shield.fill';
      case NotificationType.SYSTEM:
        return 'gear';
      case NotificationType.ALERT:
        return 'exclamationmark.triangle.fill';
      default:
        return 'bell.fill';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return brandColors.error[500];
      case NotificationPriority.HIGH:
        return brandColors.warning[500];
      case NotificationPriority.NORMAL:
        return brandColors.primary[500];
      case NotificationPriority.LOW:
        return brandColors.light[500];
      default:
        return brandColors.light[500];
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.card, dark && styles.darkCard, !isRead && styles.unreadCard, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.indicator, { backgroundColor: getPriorityColor() }]} />
      <View style={styles.iconContainer}>
        <IconSymbol size={24} name={getTypeIcon()} color={getPriorityColor()} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {!isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(createdAt)}</Text>
          <Text style={[styles.priority, { color: getPriorityColor() }]}>{priority}</Text>
        </View>
      </View>
      {!isRead && onMarkAsRead && (
        <TouchableOpacity
          style={styles.markReadButton}
          onPress={() => onMarkAsRead(id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol size={16} name="checkmark.circle" color={brandColors.light[500]} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
  },
  darkCard: {
    ...glassEffect,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: brandColors.primary[500],
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: brandColors.light[900],
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brandColors.primary[500],
    marginLeft: spacing.xs,
  },
  message: {
    fontSize: 14,
    color: brandColors.light[600],
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  date: {
    fontSize: 12,
    color: brandColors.light[500],
  },
  priority: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  markReadButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

