import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { onAuthChange, User } from '@/services/auth';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FadeInView } from '@/components/animated';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';
import { transactionApi } from '@/services/api';
import { Transaction, TransactionStatus } from '@/types/shared';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    totalAmount: 0,
    thisMonth: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        loadDashboard();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const transactionsResponse = await transactionApi.getAll(1, 20);
      if (transactionsResponse.success && transactionsResponse.data) {
        const transactions = transactionsResponse.data as any[];
        setRecentTransactions(transactions.slice(0, 5));

        const pending = transactions.filter(
          (t) => 
            t.status !== TransactionStatus.COMPLETED && 
            t.status !== TransactionStatus.FAILED && 
            t.status !== TransactionStatus.CANCELLED &&
            t.status !== TransactionStatus.OTP_VERIFIED
        ).length;
        const completed = transactions.filter((t) => t.status === TransactionStatus.COMPLETED).length;
        const totalAmount = transactions
          .filter((t) => t.status === TransactionStatus.COMPLETED)
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const now = new Date();
        const thisMonthTransactions = transactions.filter((t) => {
          const tDate = new Date(t.createdAt);
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        });
        const thisMonth = thisMonthTransactions
          .filter((t) => t.status === TransactionStatus.COMPLETED)
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        setStats({ pending, completed, totalAmount, thisMonth });
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Loading dashboard..." />
      </View>
    );
  }

  const quickActions = [
    {
      id: 'send',
      title: 'Send Money',
      icon: 'arrow.up.circle.fill',
      color: '#f9ab00',
      bgColor: '#fef3e7',
      onPress: () => router.push('/transaction/initiate'),
    },
    {
      id: 'receive',
      title: 'Receive',
      icon: 'arrow.down.circle.fill',
      color: '#10b981',
      bgColor: '#E8F5E9',
      onPress: () => router.push('/transaction/scan-qr1'),
    },
    {
      id: 'scan',
      title: 'Scan QR',
      icon: 'qrcode.viewfinder',
      color: '#e09100',
      bgColor: '#fff3e0',
      onPress: () => router.push('/transaction/scan-qr1'),
    },
    {
      id: 'history',
      title: 'History',
      icon: 'clock.fill',
      color: '#ffca28',
      bgColor: '#fffde7',
      onPress: () => router.push('/transactions'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
      showsVerticalScrollIndicator={false}
    >
      {/* PhonePe-style Header with Orange Gradient */}
      <FadeInView delay={0}>
        <LinearGradient
          colors={['#f9ab00', '#ffb833', '#ffca28']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greetingText}>Hi, {user?.displayName?.split(' ')[0] || 'User'}</Text>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(stats.totalAmount)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
              >
                <IconSymbol size={24} name="bell.fill" color="#FFFFFF" />
                {stats.pending > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{stats.pending}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </FadeInView>

      {/* Quick Actions Grid - PhonePe Style */}
      <FadeInView delay={100}>
        <View style={styles.quickActionsSection}>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
                  <IconSymbol size={32} name={action.icon} color={action.color} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </FadeInView>

      {/* Stats Cards */}
      <FadeInView delay={150}>
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
              <IconSymbol size={24} name="clock.fill" color="#f9ab00" />
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <IconSymbol size={24} name="checkmark.circle.fill" color="#10b981" />
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
              <IconSymbol size={24} name="calendar" color="#f9ab00" />
              <Text style={styles.statValue}>{formatCurrency(stats.thisMonth)}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </View>
      </FadeInView>

      {/* Recent Transactions */}
      <FadeInView delay={200}>
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="tray"
              title="No recent transactions"
              message="Your transactions will appear here"
              dark={false}
            />
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction, index) => {
                const isCompleted = transaction.status === TransactionStatus.COMPLETED;
                const isPending = transaction.status === TransactionStatus.INITIATED || 
                                 transaction.status === TransactionStatus.QR1_SCANNED;
                
                return (
                  <TouchableOpacity
                    key={transaction.id}
                    style={[
                      styles.transactionCard,
                      index === recentTransactions.length - 1 && styles.lastTransactionCard
                    ]}
                    onPress={() => router.push(`/transaction/${transaction.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.transactionLeft}>
                      <View style={[
                        styles.transactionIconContainer,
                        isCompleted ? { backgroundColor: '#E8F5E9' } : { backgroundColor: '#fff3e0' }
                      ]}>
                        <IconSymbol
                          size={24}
                          name={isCompleted ? 'checkmark.circle.fill' : 'clock.fill'}
                          color={isCompleted ? '#10b981' : '#f9ab00'}
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionTitle}>
                          {isCompleted ? 'Payment Received' : 'Transaction Pending'}
                        </Text>
                        <Text style={styles.transactionSubtitle}>
                          {transaction.transactionNumber} • {formatDate(transaction.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text style={[
                        styles.transactionAmount,
                        isCompleted ? { color: '#10b981' } : { color: '#f9ab00' }
                      ]}>
                        {isCompleted ? '+' : ''}{formatCurrency(transaction.amount || 0)}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        isCompleted ? { backgroundColor: '#E8F5E9' } : { backgroundColor: '#fff3e0' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          isCompleted ? { color: '#10b981' } : { color: '#f9ab00' }
                        ]}>
                          {isCompleted ? 'Success' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    marginTop: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  balanceLabel: {
    ...typography.caption,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.h1,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 36,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f9ab00',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: -spacing.xl,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  quickActionCard: {
    alignItems: 'center',
    width: '25%',
    marginBottom: spacing.md,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    ...typography.caption,
    color: brandColors.light[900],
    fontWeight: '500',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    ...typography.h3,
    color: brandColors.light[900],
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: brandColors.light[600],
    fontWeight: '500',
  },
  transactionsSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: brandColors.light[900],
    fontWeight: '600',
  },
  seeAllText: {
    ...typography.body,
    color: '#f9ab00',
    fontWeight: '600',
  },
  transactionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.light[200],
  },
  lastTransactionCard: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: brandColors.light[900],
    marginBottom: spacing.xs,
  },
  transactionSubtitle: {
    ...typography.caption,
    color: brandColors.light[500],
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.small,
    fontWeight: '600',
    fontSize: 10,
  },
});
