import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';
import { transactionApi, userApi } from '@/services/api';
import { Transaction, TransactionStatus } from '@/types/shared';
import { onAuthChange, User } from '@/services/auth';

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TransactionStatus | 'ALL'>('ALL');
  const [currentUserDbId, setCurrentUserDbId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user?.uid) {
        // Fetch user profile to get database ID
        userApi.getProfile().then((response) => {
          if (response.success && response.data) {
            const profile = response.data as any;
            setCurrentUserDbId(profile.id);
          }
        }).catch(() => {
          // Silently fail
        });
      }
    });
    loadTransactions();
    return () => unsubscribe();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionApi.getAll(1, 50);
      if (response.success && response.data) {
        setTransactions(response.data as Transaction[]);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return brandColors.success[500];
      case TransactionStatus.FAILED:
      case TransactionStatus.CANCELLED:
        return brandColors.error[500];
      case TransactionStatus.OTP_SENT:
      case TransactionStatus.OTP_VERIFIED:
        return brandColors.warning[500];
      default:
        return brandColors.primary[500];
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'checkmark.circle.fill';
      case TransactionStatus.FAILED:
        return 'xmark.circle.fill';
      case TransactionStatus.CANCELLED:
        return 'minus.circle.fill';
      default:
        return 'clock.fill';
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      t.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    
    // Determine if transaction is sent or received based on current user
    // Check if current user is the sender (transaction initiated by current user)
    // For account users, they typically receive payments, so default to received if unsure
    const transactionData = item as any;
    const senderId = transactionData.senderId || transactionData.sender_id || transactionData.sender?.id;
    const receiverId = transactionData.receiverId || transactionData.receiver_id || transactionData.receiver?.id;
    const isSent = currentUserDbId && senderId === currentUserDbId;
    const isReceived = currentUserDbId && receiverId === currentUserDbId;
    
    // Default to received if we can't determine (account users typically receive)
    const isOutgoing = isSent && !isReceived;
    
    // For completed transactions, use green badge
    const badgeColor = item.status === TransactionStatus.COMPLETED 
      ? brandColors.success[500] 
      : statusColor;
    const badgeBgColor = item.status === TransactionStatus.COMPLETED 
      ? `${brandColors.success[500]}20` 
      : `${statusColor}20`;

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => router.push(`/transaction/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionContent}>
          <View style={[styles.statusIndicator, { backgroundColor: badgeColor }]} />
          <View style={styles.transactionIcon}>
            <IconSymbol size={24} name={statusIcon} color={badgeColor} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionNumber}>{item.transactionNumber}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.createdAt || item.initiatedAt)}</Text>
            {item.description && <Text style={styles.transactionDescription}>{item.description}</Text>}
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[styles.amountText, { color: isOutgoing ? brandColors.error[500] : brandColors.success[500] }]}>
              {isOutgoing ? '-' : '+'}{formatCurrency(item.amount || 0)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: badgeBgColor }]}>
              <Text style={[styles.statusText, { color: badgeColor }]}>
                {item.status === TransactionStatus.COMPLETED 
                  ? 'COMPLETED' 
                  : item.status.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Loading transactions..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => router.push('/transaction/initiate')}
        >
          <IconSymbol size={20} name="plus.circle.fill" color="#ffffff" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <IconSymbol size={20} name="magnifyingglass" color={brandColors.light[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={brandColors.light[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {(['ALL', TransactionStatus.INITIATED, TransactionStatus.COMPLETED, TransactionStatus.FAILED] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, filter === status && styles.filterButtonActive]}
              onPress={() => setFilter(status)}
            >
              <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon="tray"
          title={searchQuery || filter !== 'ALL' ? 'No transactions found' : 'No Transactions Yet'}
          message={
            searchQuery || filter !== 'ALL'
              ? 'Try adjusting your search or filter'
              : 'Start your first transaction to see it here'
          }
          actionLabel={searchQuery || filter !== 'ALL' ? undefined : 'Start Transaction'}
          onAction={searchQuery || filter !== 'ALL' ? undefined : () => router.push('/transaction/initiate')}
          dark={false}
        />
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  newButtonText: {
    ...typography.body,
    color: '#ffffff',
    fontWeight: '600',
  },
  searchContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: brandColors.light[100],
    borderWidth: 1,
    borderColor: brandColors.light[300],
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: brandColors.light[900],
  },
  filters: {
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  filtersContent: {
    paddingHorizontal: spacing.xl,
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
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  list: {
    padding: spacing.xl,
    paddingTop: spacing.md,
  },
  transactionCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.sm,
    overflow: 'hidden',
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  transactionIcon: {
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNumber: {
    ...typography.body,
    fontWeight: '600',
    color: brandColors.light[900],
    marginBottom: spacing.xs,
  },
  transactionDescription: {
    ...typography.caption,
    color: brandColors.light[600],
    marginBottom: spacing.xs,
  },
  transactionDate: {
    ...typography.small,
    color: brandColors.light[500],
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    ...typography.small,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
