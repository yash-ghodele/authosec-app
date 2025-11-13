import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { onAuthChange, User } from '@/services/auth';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnimatedCard, FadeInView } from '@/components/animated';
import { AuthoSecLogo } from '@/components/logo';
import { brandColors, spacing, typography } from '@/constants/brand';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with Logo */}
      <FadeInView delay={0}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <AuthoSecLogo size={50} showText={false} />
            <View style={styles.brandText}>
              <Text style={styles.brandName}>AuthoSec</Text>
              <Text style={styles.brandTagline}>Secure Transactions</Text>
            </View>
          </View>
          
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.displayName || user?.email || 'User'}</Text>
          </View>
        </View>
      </FadeInView>

      {/* Quick Actions */}
      <FadeInView delay={100}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <AnimatedCard
            variant="primary"
            onPress={() => router.push('/transaction/initiate')}
            style={styles.actionCard}
          >
            <View style={styles.actionCardContent}>
              <View style={[styles.iconContainer, styles.primaryIcon]}>
                <IconSymbol size={28} name="qrcode" color="#fff" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Initiate Transaction</Text>
                <Text style={styles.actionSubtitle}>Start a new secure payment</Text>
              </View>
              <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
            </View>
          </AnimatedCard>

          <AnimatedCard
            variant="success"
            onPress={() => router.push('/transaction/scan-qr1')}
            style={styles.actionCard}
          >
            <View style={styles.actionCardContent}>
              <View style={[styles.iconContainer, styles.successIcon]}>
                <IconSymbol size={28} name="camera.fill" color="#fff" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Scan QR Code</Text>
                <Text style={styles.actionSubtitle}>Receive payment</Text>
              </View>
              <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
            </View>
          </AnimatedCard>
        </View>
      </FadeInView>

      {/* Stats Overview */}
      <FadeInView delay={200}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          
          <View style={styles.statsGrid}>
            <AnimatedCard style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Pending</Text>
              <View style={styles.statIndicator} />
            </AnimatedCard>
            
            <AnimatedCard style={styles.statCard}>
              <Text style={[styles.statValue, styles.successValue]}>0</Text>
              <Text style={styles.statLabel}>Completed</Text>
              <View style={[styles.statIndicator, styles.successIndicator]} />
            </AnimatedCard>
          </View>
        </View>
      </FadeInView>

      {/* Recent Activity Placeholder */}
      <FadeInView delay={300}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <AnimatedCard style={styles.emptyState}>
            <IconSymbol size={48} name="tray" color={brandColors.light[400]} />
            <Text style={styles.emptyStateText}>No recent transactions</Text>
            <Text style={styles.emptyStateSubtext}>Your transactions will appear here</Text>
          </AnimatedCard>
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.light[100],
  },
  contentContainer: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    padding: spacing.xl,
    paddingTop: 60,
    backgroundColor: brandColors.light[50],
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandText: {
    marginLeft: spacing.md,
  },
  brandName: {
    ...typography.h3,
    color: brandColors.light[950],
  },
  brandTagline: {
    ...typography.caption,
    color: brandColors.light[600],
  },
  greeting: {
    marginTop: spacing.lg,
  },
  greetingText: {
    ...typography.body,
    color: brandColors.light[600],
  },
  userName: {
    ...typography.h2,
    color: brandColors.light[900],
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: brandColors.light[900],
    marginBottom: spacing.lg,
  },
  actionCard: {
    marginBottom: spacing.md,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  primaryIcon: {
    backgroundColor: brandColors.primary[600],
  },
  successIcon: {
    backgroundColor: brandColors.success[600],
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: brandColors.light[900],
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    ...typography.caption,
    color: brandColors.light[600],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  statValue: {
    ...typography.h1,
    color: brandColors.primary[600],
    marginBottom: spacing.xs,
  },
  successValue: {
    color: brandColors.success[600],
  },
  statLabel: {
    ...typography.caption,
    color: brandColors.light[600],
  },
  statIndicator: {
    width: 32,
    height: 3,
    backgroundColor: brandColors.primary[500],
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  successIndicator: {
    backgroundColor: brandColors.success[500],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateText: {
    ...typography.body,
    color: brandColors.light[700],
    marginTop: spacing.lg,
  },
  emptyStateSubtext: {
    ...typography.caption,
    color: brandColors.light[500],
    marginTop: spacing.xs,
  },
});
