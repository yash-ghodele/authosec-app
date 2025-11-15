import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signIn } from '@/services/auth';
import { Link, useRouter } from 'expo-router';
import { AuthoSecLogo } from '@/components/logo';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';

export default function SignIn() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    setLoading(true);
    try {
      await signIn(emailAddress, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Sign in failed');
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

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to AuthoSec</Text>

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
            placeholder="Password"
            placeholderTextColor={brandColors.light[500]}
            secureTextEntry
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSignInPress}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.phoneButton}
            onPress={() => router.push('/(auth)/phone-signin')}
            activeOpacity={0.8}
          >
            <Text style={styles.phoneButtonText}>Login with Phone Number (Accountant)</Text>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: brandColors.light[300],
  },
  dividerText: {
    color: brandColors.light[500],
    ...typography.caption,
    paddingHorizontal: spacing.md,
  },
  phoneButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: brandColors.primary[500],
    ...shadows.sm,
  },
  phoneButtonText: {
    color: brandColors.primary[600],
    ...typography.body,
    fontWeight: '600',
  },
});
