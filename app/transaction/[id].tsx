import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';
import { transactionApi, userApi } from '@/services/api';
import { Transaction, TransactionStatus } from '@/types/shared';

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      loadTransaction();
      loadCurrentUser();
      startPolling();
    }
    return () => {
      stopPolling();
    };
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const response = await userApi.getProfile();
      if (response.success && response.data) {
        setCurrentUserId(response.data.id);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const startPolling = () => {
    // Poll every 5 seconds when transaction is pending
    pollingIntervalRef.current = setInterval(() => {
      loadTransaction();
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    // Stop polling when transaction is completed or failed
    if (transaction?.status === TransactionStatus.COMPLETED || 
        transaction?.status === TransactionStatus.FAILED ||
        transaction?.status === TransactionStatus.CANCELLED) {
      stopPolling();
    }
  }, [transaction?.status]);

  const loadTransaction = async () => {
    try {
      if (!loading) {
        // Silent refresh (don't show loading spinner)
      } else {
        setLoading(true);
      }
      const response = await transactionApi.getById(id!);
      if (response.success && response.data) {
        // API service already maps snake_case to camelCase
        // Backend may return { transaction: {...} } or just the transaction object
        const data = response.data as any;
        const transaction = data.transaction || data;
        
        // Ensure initiatedAt has a fallback to createdAt if missing
        const mappedTransaction: any = {
          ...transaction,
          initiatedAt: transaction.initiatedAt || transaction.createdAt,
          senderId: transaction.senderId || transaction.sender_id,
          receiverId: transaction.receiverId || transaction.receiver_id,
        };
        
        setTransaction(mappedTransaction);
      }
    } catch (error) {
      console.error('Failed to load transaction:', error);
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return 'N/A';
      
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
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

  const getStatusSteps = () => {
    const steps = [
      { status: TransactionStatus.INITIATED, label: 'Initiated' },
      { status: TransactionStatus.QR1_SCANNED, label: 'QR1 Scanned' },
      { status: TransactionStatus.QR2_GENERATED, label: 'QR2 Generated' },
      { status: TransactionStatus.QR2_SCANNED, label: 'QR2 Scanned' },
      { status: TransactionStatus.OTP_SENT, label: 'OTP Sent' },
      { status: TransactionStatus.OTP_VERIFIED, label: 'OTP Verified' },
      { status: TransactionStatus.COMPLETED, label: 'Completed' },
    ];
    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    const index = steps.findIndex((s) => s.status === transaction?.status);
    // Return the index, or if not found, return the last step index if completed
    if (index >= 0) return index;
    if (transaction?.status === TransactionStatus.COMPLETED) {
      return steps.length - 1;
    }
    return 0;
  };

  const isUserSender = () => currentUserId === transaction?.senderId;
  const isUserReceiver = () => currentUserId === transaction?.receiverId;

  const handleGenerateQR2 = async () => {
    if (!transaction || actionLoading) return;
    
    setActionLoading(true);
    try {
      const response = await transactionApi.generateQR2(transaction.id);
      if (response.success) {
        Alert.alert('Success', 'QR2 generated successfully!');
        loadTransaction();
      } else {
        throw new Error(response.message || 'Failed to generate QR2');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate QR2');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScanQR2 = () => {
    router.push('/transaction/scan-qr2');
  };

  const handleSendOTP = async () => {
    if (!transaction || actionLoading) return;
    
    setActionLoading(true);
    try {
      const response = await transactionApi.sendOTP(transaction.id);
      if (response.success) {
        Alert.alert('Success', 'OTP sent to your phone!');
        loadTransaction();
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    if (!transaction) return;
    router.push({
      pathname: '/transaction/verify-otp',
      params: { transactionId: transaction.id },
    });
  };

  const handleCompletePayment = async () => {
    if (!transaction || actionLoading) return;
    
    Alert.alert(
      'Complete Payment',
      'Are you sure you want to complete this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setActionLoading(true);
            try {
              const response = await transactionApi.completePayment(transaction.id);
              if (response.success) {
                Alert.alert('Success', 'Payment completed successfully!');
                loadTransaction();
              } else {
                throw new Error(response.message || 'Failed to complete payment');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to complete payment');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderActionButton = () => {
    if (!transaction || !currentUserId) return null;

    // Receiver actions
    if (isUserReceiver()) {
      if (transaction.status === TransactionStatus.QR1_SCANNED) {
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGenerateQR2}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol name="qrcode" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Generate QR2</Text>
              </>
            )}
          </TouchableOpacity>
        );
      }
    }

    // Sender actions
    if (isUserSender()) {
      if (transaction.status === TransactionStatus.QR2_GENERATED) {
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleScanQR2}
            disabled={actionLoading}
          >
            <IconSymbol name="camera" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Scan QR2</Text>
          </TouchableOpacity>
        );
      }

      if (transaction.status === TransactionStatus.QR2_SCANNED) {
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSendOTP}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol name="message" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Send OTP</Text>
              </>
            )}
          </TouchableOpacity>
        );
      }

      if (transaction.status === TransactionStatus.OTP_SENT) {
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleVerifyOTP}
            disabled={actionLoading}
          >
            <IconSymbol name="lock.shield" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Verify OTP</Text>
          </TouchableOpacity>
        );
      }

      if (transaction.status === TransactionStatus.OTP_VERIFIED) {
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSuccess]}
            onPress={handleCompletePayment}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol name="checkmark.circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Complete Payment</Text>
              </>
            )}
          </TouchableOpacity>
        );
      }
    }

    return null;
  };

  const renderQRCode = () => {
    if (!transaction) return null;

    // Show QR1 to sender when initiated
    if (isUserSender() && transaction.qr1Code && transaction.status === TransactionStatus.INITIATED) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your QR1 Code</Text>
          <View style={styles.qrCodeCard}>
            <Image
              source={{ uri: transaction.qr1Code }}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
            <Text style={styles.qrCodeHint}>Show this QR code to the receiver to scan</Text>
          </View>
        </View>
      );
    }

    // Show QR2 to sender after it's generated
    if (isUserSender() && transaction.qr2Code && transaction.status === TransactionStatus.QR2_GENERATED) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receiver's QR2 Code</Text>
          <View style={styles.qrCodeCard}>
            <Image
              source={{ uri: transaction.qr2Code }}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
            <Text style={styles.qrCodeHint}>Scan this QR code to proceed</Text>
          </View>
        </View>
      );
    }

    // Show QR2 to receiver after generation
    if (isUserReceiver() && transaction.qr2Code && 
        (transaction.status === TransactionStatus.QR2_GENERATED || 
         transaction.status === TransactionStatus.QR2_SCANNED)) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your QR2 Code</Text>
          <View style={styles.qrCodeCard}>
            <Image
              source={{ uri: transaction.qr2Code }}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
            <Text style={styles.qrCodeHint}>Show this QR code to the sender to scan</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Loading transaction..." />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <EmptyState icon="exclamationmark.triangle" title="Transaction not found" dark={false} />
      </View>
    );
  }

  const statusColor = getStatusColor(transaction.status);
  const currentStepIndex = getCurrentStepIndex();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={brandColors.light[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {transaction.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.transactionNumber}>{transaction.transactionNumber}</Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(transaction.amount || 0)}</Text>
        {transaction.description && <Text style={styles.description}>{transaction.description}</Text>}
      </View>

      {/* Action Button */}
      {renderActionButton()}

      {/* QR Code Display */}
      {renderQRCode()}

      {/* Status Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <View style={styles.timeline}>
          {getStatusSteps().map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const completedColor = transaction.status === TransactionStatus.COMPLETED 
              ? brandColors.success[500] 
              : brandColors.primary[600];
            return (
              <View key={step.status} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  <View style={styles.timelineDotContainer}>
                    {isCompleted ? (
                      <View style={[styles.timelineDotCompleted, { backgroundColor: completedColor }]}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.timelineDotIncomplete} />
                    )}
                    {isCurrent && !isCompleted && (
                      <View style={[styles.timelineDotCurrent, { borderColor: completedColor }]} />
                    )}
                  </View>
                  {index < getStatusSteps().length - 1 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        isCompleted 
                          ? { backgroundColor: completedColor, opacity: 0.4 }
                          : { backgroundColor: brandColors.light[300] },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text 
                    style={[
                      styles.timelineLabel, 
                      isCompleted 
                        ? [styles.timelineLabelActive, { color: completedColor }]
                        : styles.timelineLabelInactive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Transaction Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID</Text>
          </View>
          <View style={styles.infoRowFull}>
            <Text style={styles.infoValueFull} selectable>{transaction.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Initiated At</Text>
            <Text style={styles.infoValue}>
              {formatDateTime(transaction.initiatedAt || transaction.createdAt)}
            </Text>
          </View>
          {transaction.completedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Completed At</Text>
              <Text style={styles.infoValue}>{formatDateTime(transaction.completedAt)}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Currency</Text>
            <Text style={styles.infoValue}>{transaction.currency}</Text>
          </View>
        </View>
      </View>

      {/* QR Code Info */}
      {(transaction.qr1Code || transaction.qr2Code) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QR Codes</Text>
          <View style={styles.infoCard}>
            {transaction.qr1Code && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>QR1 Generated</Text>
                <Text style={styles.infoValue}>
                  {transaction.qr1GeneratedAt ? formatDateTime(transaction.qr1GeneratedAt) : 'N/A'}
                </Text>
              </View>
            )}
            {transaction.qr2Code && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>QR2 Generated</Text>
                <Text style={styles.infoValue}>
                  {transaction.qr2GeneratedAt ? formatDateTime(transaction.qr2GeneratedAt) : 'N/A'}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: spacing['3xl'],
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: brandColors.light[900],
    fontWeight: '600',
  },
  statusCard: {
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.small,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  transactionNumber: {
    ...typography.caption,
    color: brandColors.light[600],
  },
  amount: {
    ...typography.h1,
    color: brandColors.light[900],
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: brandColors.light[600],
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: brandColors.light[900],
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  timeline: {
    marginLeft: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineLine: {
    width: 2,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  timelineDotContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  timelineDotIncomplete: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: brandColors.light[300],
    borderWidth: 2,
    borderColor: brandColors.light[400],
  },
  timelineDotCurrent: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  timelineConnector: {
    flex: 1,
    width: 3,
    marginTop: spacing.xs,
    minHeight: 35,
    marginLeft: 8.5,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineLabel: {
    ...typography.body,
    fontSize: 14,
  },
  timelineLabelActive: {
    fontWeight: '700',
    fontSize: 15,
  },
  timelineLabelInactive: {
    color: brandColors.light[400],
    fontWeight: '400',
  },
  infoCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.light[200],
  },
  infoRowFull: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.light[200],
    width: '100%',
  },
  infoLabel: {
    ...typography.body,
    color: brandColors.light[600],
    flexShrink: 1,
  },
  infoValue: {
    ...typography.body,
    color: brandColors.light[900],
    fontWeight: '500',
    flexShrink: 1,
    flexWrap: 'wrap',
    textAlign: 'right',
    maxWidth: '60%',
  },
  infoValueFull: {
    ...typography.body,
    color: brandColors.light[900],
    fontWeight: '500',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flexWrap: 'wrap',
    width: '100%',
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: brandColors.primary[600],
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  actionButtonSuccess: {
    backgroundColor: brandColors.success[500],
  },
  actionButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  qrCodeCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.md,
    alignItems: 'center',
  },
  qrCodeImage: {
    width: 250,
    height: 250,
    marginBottom: spacing.md,
  },
  qrCodeHint: {
    ...typography.body,
    color: brandColors.light[600],
    textAlign: 'center',
  },
});

