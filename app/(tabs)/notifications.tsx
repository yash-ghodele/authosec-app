import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { onAuthChange, User } from '@/services/auth';
import { NotificationCard, NotificationType, NotificationPriority } from '@/components/NotificationCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';
import { Notification } from '@/types/shared';
import { notificationApi } from '@/services/api';

export default function NotificationsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<NotificationType | 'ALL'>('ALL');

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        loadNotifications();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getAll();
      if (response.success && response.data) {
        setNotifications(response.data as Notification[]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.actionUrl) {
      // Navigate to action URL if needed
      console.log('Navigate to:', notification.actionUrl);
    }
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const filteredNotifications = filter === 'ALL' 
    ? notifications 
    : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Loading notifications..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {(['ALL', NotificationType.TRANSACTION, NotificationType.SECURITY, NotificationType.SYSTEM, NotificationType.ALERT] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
              onPress={() => setFilter(filterType)}
            >
              <Text style={[styles.filterText, filter === filterType && styles.filterTextActive]}>
                {filterType === 'ALL' ? 'All' : filterType}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon="bell.slash"
          title="No notifications"
          message={filter === 'ALL' ? "You're all caught up!" : `No ${filter.toLowerCase()} notifications`}
          dark={false}
        />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              id={item.id}
              title={item.title}
              message={item.message}
              type={item.type as any}
              priority={item.priority as any}
              isRead={item.isRead}
              createdAt={new Date(item.createdAt)}
              onPress={() => handleNotificationPress(item)}
              onMarkAsRead={handleMarkAsRead}
              dark={false}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brandColors.primary[500]} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: brandColors.light[200],
  },
  title: {
    ...typography.h1,
    color: brandColors.light[900],
  },
  badge: {
    backgroundColor: brandColors.error[500],
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.small,
    color: '#ffffff',
    fontWeight: '700',
  },
  filters: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: brandColors.light[200],
  },
  filtersContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: brandColors.light[100],
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: brandColors.light[300],
  },
  filterButtonActive: {
    backgroundColor: brandColors.primary[500],
    borderColor: brandColors.primary[500],
  },
  filterText: {
    ...typography.caption,
    color: brandColors.light[600],
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  list: {
    padding: spacing.xl,
  },
});
