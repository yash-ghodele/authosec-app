import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { transactionApi } from '@/services/api';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;

export default function VerifyOTP() {
  const router = useRouter();
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_MINUTES * 60); // seconds
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every((digit) => digit !== '') && !loading) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    // Handle backspace to focus previous input
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    if (!transactionId) {
      Alert.alert('Error', 'Transaction ID not found');
      return;
    }

    if (otpCode.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify OTP
      const verifyResponse = await transactionApi.verifyOTP(transactionId, otpCode);
      
      if (!verifyResponse.success) {
        throw new Error(verifyResponse.message || 'Failed to verify OTP');
      }

      // Step 2: Complete payment automatically
      try {
        const completeResponse = await transactionApi.completePayment(transactionId);
        
        if (completeResponse.success) {
          Alert.alert(
            'Success',
            'Payment completed successfully!',
            [
              {
                text: 'View Transaction',
                onPress: () => {
                  router.replace(`/transaction/${transactionId}`);
                },
              },
            ]
          );
        } else {
          throw new Error(completeResponse.message || 'Failed to complete payment');
        }
      } catch (completeError: any) {
        console.error('Complete payment error:', completeError);
        
        // Even if completion fails, OTP is verified
        Alert.alert(
          'OTP Verified',
          'OTP verified successfully, but failed to complete payment. Please try again from the transaction screen.',
          [
            {
              text: 'View Transaction',
              onPress: () => {
                router.replace(`/transaction/${transactionId}`);
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!transactionId || !canResend || resending) return;

    setResending(true);

    try {
      const response = await transactionApi.sendOTP(transactionId);
      
      if (response.success) {
        // Reset timer and OTP
        setTimeLeft(OTP_EXPIRY_MINUTES * 60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        Alert.alert('Success', 'OTP has been resent to your phone');
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = () => {
    const otpCode = otp.join('');
    handleVerifyOtp(otpCode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your phone
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(index, value)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        <View style={styles.timerContainer}>
          {timeLeft > 0 ? (
            <Text style={styles.timerText}>
              Code expires in {formatTime(timeLeft)}
            </Text>
          ) : (
            <Text style={styles.expiredText}>Code expired</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || otp.some((d) => !d)) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || otp.some((d) => !d)}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Verify & Complete Payment</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.resendButton,
            (!canResend || resending) && styles.resendButtonDisabled,
          ]}
          onPress={handleResendOtp}
          disabled={!canResend || resending}
        >
          {resending ? (
            <ActivityIndicator color="#6366f1" size="small" />
          ) : (
            <Text
              style={[
                styles.resendButtonText,
                !canResend && styles.resendButtonTextDisabled,
              ]}
            >
              Resend OTP
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#6366f1',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  expiredText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  resendButtonDisabled: {
    borderColor: '#d1d5db',
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#9ca3af',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
