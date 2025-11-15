import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { sendOTPViaBackend, verifyOTPViaBackend, signInWithCustomToken } from '@/services/phone-auth-api';
import { useRouter } from 'expo-router';
import { AuthoSecLogo } from '@/components/logo';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';

export default function PhoneSignIn() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTPViaBackend(phoneNumber);
      setOtpSent(true);
      startCountdown();
      Alert.alert('Success', result.message || 'OTP sent to your phone number');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTPViaBackend(phoneNumber, otp);
      await signInWithCustomToken(result.token);
      Alert.alert('Success', 'Logged in successfully');
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const onResendOTP = async () => {
    setOtp('');
    setOtpSent(false);
    await onSendOTP();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <AuthoSecLogo size={80} showText={true} />
          </View>

          <Text style={styles.title}>Accountant Login</Text>
          <Text style={styles.subtitle}>
            {!otpSent ? 'Enter your phone number' : 'Enter OTP sent to your phone'}
          </Text>

          {!otpSent ? (
            <>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  value={phoneNumber}
                  placeholder="Phone Number"
                  placeholderTextColor={brandColors.light[500]}
                  onChangeText={setPhoneNumber}
                  style={styles.phoneInput}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={onSendOTP}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                value={otp}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={brandColors.light[500]}
                onChangeText={setOtp}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={onVerifyOTP}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={styles.resendText}>
                    Resend OTP in {countdown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={onResendOTP} disabled={loading}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.changeNumberButton}
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                  if (countdownRef.current) clearInterval(countdownRef.current);
                }}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.changeNumberText}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Login with email? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.link}>Click here</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.h1,
    color: brandColors.light[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: brandColors.light[600],
    marginBottom: spacing['2xl'],
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.light[100],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: brandColors.light[300],
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  countryCode: {
    color: brandColors.light[900],
    ...typography.body,
    fontWeight: '600',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: brandColors.light[300],
  },
  phoneInput: {
    flex: 1,
    padding: spacing.lg,
    ...typography.body,
    color: brandColors.light[900],
  },
  input: {
    backgroundColor: brandColors.light[100],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...typography.body,
    color: brandColors.light[900],
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: brandColors.light[300],
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
    ...shadows.sm,
  },
  button: {
    backgroundColor: brandColors.primary[600],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    color: brandColors.light[600],
    ...typography.caption,
  },
  resendLink: {
    color: brandColors.primary[600],
    ...typography.caption,
    fontWeight: '600',
  },
  changeNumberButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  changeNumberText: {
    color: brandColors.light[600],
    ...typography.caption,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: brandColors.light[600],
    ...typography.caption,
  },
  link: {
    color: brandColors.primary[600],
    ...typography.caption,
    fontWeight: '600',
  },
});
