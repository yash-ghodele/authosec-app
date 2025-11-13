import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnimatedCard, FadeInView } from '@/components/animated';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  date: string;
  type: 'sent' | 'received';
}

export default function TransactionsScreen() {
  const router = useRouter();
  const transactions: Transaction[] = [];

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={[
          styles.typeIndicator,
          { backgroundColor: item.type === 'sent' ? '#ef4444' : '#10b981' }
        ]} />
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionAmount}>
            {item.type === 'sent' ? '-' : '+'}${item.amount}
          </Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </View>
      <View style={[
        styles.statusBadge,
        { backgroundColor: item.status === 'completed' ? '#10b98120' : '#f59e0b20' }
      ]}>
        <Text style={[
          styles.statusText,
          { color: item.status === 'completed' ? '#10b981' : '#f59e0b' }
        ]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity 
          style={styles.newButton}
          onPress={() => router.push('/transaction/initiate')}
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyTitle}>No Transactions Yet</Text>
          <Text style={styles.emptyText}>
            Start your first transaction to see it here
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => router.push('/transaction/initiate')}
          >
            <Text style={styles.startButtonText}>Start Transaction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.light[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: 60,
    backgroundColor: brandColors.light[50],
  },
  title: {
    ...typography.h1,
    color: brandColors.light[900],
  },
  newButton: {
    backgroundColor: brandColors.primary[600],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: spacing.xl,
    paddingTop: spacing.md,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: brandColors.light[300],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    ...typography.body,
    fontWeight: '600',
    color: brandColors.light[900],
    marginBottom: 4,
  },
  transactionDate: {
    ...typography.small,
    color: brandColors.light[600],
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  statusText: {
    ...typography.small,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: brandColors.light[900],
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: brandColors.light[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  startButton: {
    backgroundColor: brandColors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    ...shadows.md,
  },
  startButtonText: {
    color: '#fff',
    ...typography.body,
    fontWeight: '600',
  },
});
