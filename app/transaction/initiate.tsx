import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';
import { transactionApi } from '@/services/api';

export default function InitiateTransaction() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (phone: string): string => {
    // Trim whitespace
    let formatted = phone.trim();
    
    // Remove spaces, dashes, parentheses
    formatted = formatted.replace(/[\s\-()]/g, '');
    
    // If it already starts with +, check if valid
    if (formatted.startsWith('+')) {
      // Remove + for processing
      const digits = formatted.substring(1);
      // E.164 requires first digit after + to be 1-9
      if (/^[1-9]\d{0,13}$/.test(digits)) {
        return formatted;
      }
      // If invalid, remove + and continue
      formatted = digits;
    }
    
    // Remove all non-digit characters
    let cleaned = formatted.replace(/\D/g, '');
    
    // Remove leading zeros (country codes don't start with 0)
    while (cleaned.startsWith('0') && cleaned.length > 1) {
      cleaned = cleaned.substring(1);
    }
    
    // If it's a 10-digit number, assume India (+91)
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return `+91${cleaned}`;
    }
    
    // If it's 11-15 digits and starts with 1-9 (valid country code), add +
    if (cleaned.length >= 10 && cleaned.length <= 15 && /^[1-9]/.test(cleaned)) {
      return `+${cleaned}`;
    }
    
    // Return original if we can't format it properly
    return phone;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // E.164 format: +[country code][number], total 1-15 digits after +
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleInitiate = async () => {
    if (!amount || !receiverId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(receiverId.trim());
    
    // Validate phone number format
    if (!validatePhoneNumber(formattedPhone)) {
      Alert.alert(
        'Invalid Phone Number', 
        'Please enter a valid phone number with country code.\nExample: +919876543210 or 9876543210'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await transactionApi.initiate({
        receiverPhone: formattedPhone,
        amount: amountNum,
        description: description || undefined,
      });

      if (response.success) {
        Alert.alert('Success', 'Transaction initiated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to initiate transaction');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate transaction');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Initiating transaction..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol size={24} name="chevron.left" color={brandColors.light[900]} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Initiate Transaction</Text>
            <Text style={styles.subtitle}>Start a new secure payment</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Amount <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={brandColors.light[500]}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Receiver Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helperText}>
              Include country code (e.g., +91 for India)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="+919876543210 or 9876543210"
              placeholderTextColor={brandColors.light[500]}
              keyboardType="phone-pad"
              value={receiverId}
              onChangeText={setReceiverId}
              maxLength={15}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Add a note (optional)"
              placeholderTextColor={brandColors.light[500]}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleInitiate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <IconSymbol size={24} name="qrcode" color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {loading ? 'Initiating...' : 'Generate QR Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 32,
  },
  title: {
    ...typography.h2,
    color: brandColors.light[900],
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: brandColors.light[600],
    textAlign: 'center',
  },
  form: {
    padding: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.body,
    color: brandColors.light[900],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  required: {
    color: brandColors.error[500],
  },
  helperText: {
    ...typography.small,
    color: brandColors.light[500],
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.light[100],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.sm,
  },
  currencySymbol: {
    ...typography.h4,
    color: brandColors.light[900],
    fontWeight: '600',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: brandColors.light[900],
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: brandColors.light[100],
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.sm,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.primary[600],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.sm,
  },
  cancelButtonText: {
    ...typography.body,
    color: brandColors.light[600],
    fontWeight: '600',
  },
});
