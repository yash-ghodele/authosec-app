import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { registerUser } from '@/services/auth';
import { Link, useRouter } from 'expo-router';
import { AuthoSecLogo } from '@/components/logo';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';

export default function SignUp() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [hasCompany, setHasCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [loading, setLoading] = useState(false);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Phone number formatting to E.164 format
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

  // Phone number validation (E.164 format)
  const validatePhoneNumber = (phone: string): boolean => {
    // E.164 format: +[country code][number], total 1-15 digits after +
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const onSignUpPress = async () => {
    // Validate email
    if (!emailAddress || !emailAddress.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(emailAddress)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate password
    if (!password || !password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Validate company fields if company registration is enabled
    if (hasCompany) {
      if (!companyName || !companyName.trim()) {
        Alert.alert('Error', 'Please enter company name');
        return;
      }
      if (!businessType || !businessType.trim()) {
        Alert.alert('Error', 'Please enter business type');
        return;
      }
      if (!registrationId || !registrationId.trim()) {
        Alert.alert('Error', 'Please enter company registration ID');
        return;
      }
    }

    // Format and validate phone number if provided
    let formattedPhone: string | undefined;
    if (phone && phone.trim()) {
      formattedPhone = formatPhoneNumber(phone.trim());
      if (!validatePhoneNumber(formattedPhone)) {
        Alert.alert(
          'Invalid Phone Number',
          'Please enter a valid phone number with country code.\nExample: +919876543210 or 9876543210'
        );
        return;
      }
    }

    setLoading(true);
    try {
      // Register user in Firebase
      const firebaseUser = await registerUser(emailAddress.trim(), password);
      
      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();
      
      // Sync user to backend database
      const { userApi } = await import('@/services/api');
      const syncData: any = {};
      
      if (firstName && firstName.trim()) syncData.firstName = firstName.trim();
      if (lastName && lastName.trim()) syncData.lastName = lastName.trim();
      if (formattedPhone) syncData.phone = formattedPhone;
      
      if (hasCompany) {
        syncData.companyName = companyName.trim();
        syncData.businessType = businessType.trim();
        syncData.registrationId = registrationId.trim();
      }
      
      try {
        const syncResponse = await userApi.sync(syncData);
        if (!syncResponse.success) {
          console.warn('User sync failed:', syncResponse.error);
        }
      } catch (syncError: any) {
        console.warn('User sync error:', syncError);
        // Continue anyway - user is registered in Firebase
      }
      
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
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

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up for AuthoSec</Text>

          <TextInput
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email"
            placeholderTextColor={brandColors.light[500]}
            onChangeText={setEmailAddress}
            style={styles.input}
            keyboardType="email-address"
          />

          <TextInput
            value={password}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={brandColors.light[500]}
            secureTextEntry
            onChangeText={setPassword}
            style={styles.input}
          />

          <TextInput
            value={firstName}
            placeholder="First Name (optional)"
            placeholderTextColor={brandColors.light[500]}
            onChangeText={setFirstName}
            style={styles.input}
            autoCapitalize="words"
          />

          <TextInput
            value={lastName}
            placeholder="Last Name (optional)"
            placeholderTextColor={brandColors.light[500]}
            onChangeText={setLastName}
            style={styles.input}
            autoCapitalize="words"
          />

          <TextInput
            value={phone}
            placeholder="Phone Number (optional)"
            placeholderTextColor={brandColors.light[500]}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={15}
          />

          {/* Company Registration Toggle */}
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setHasCompany(!hasCompany)}
            activeOpacity={0.7}
          >
            <View style={[styles.toggle, hasCompany && styles.toggleActive]}>
              <View style={[styles.toggleIndicator, hasCompany && styles.toggleIndicatorActive]} />
            </View>
            <Text style={styles.toggleLabel}>Register with Company ID</Text>
          </TouchableOpacity>

          {/* Company Fields */}
          {hasCompany && (
            <>
              <TextInput
                value={companyName}
                placeholder="Company Name *"
                placeholderTextColor={brandColors.light[500]}
                onChangeText={setCompanyName}
                style={styles.input}
                autoCapitalize="words"
              />

              <TextInput
                value={businessType}
                placeholder="Business Type * (e.g., IT, Retail, Manufacturing)"
                placeholderTextColor={brandColors.light[500]}
                onChangeText={setBusinessType}
                style={styles.input}
                autoCapitalize="words"
              />

              <TextInput
                value={registrationId}
                placeholder="Company Registration ID *"
                placeholderTextColor={brandColors.light[500]}
                onChangeText={setRegistrationId}
                style={styles.input}
                autoCapitalize="characters"
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSignUpPress}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </Link>
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
  input: {
    backgroundColor: brandColors.light[100],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: brandColors.light[900],
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: brandColors.light[300],
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: brandColors.light[300],
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginRight: spacing.sm,
  },
  toggleActive: {
    backgroundColor: brandColors.primary[600],
  },
  toggleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end',
  },
  toggleLabel: {
    ...typography.body,
    color: brandColors.light[900],
    fontWeight: '500',
  },
});
