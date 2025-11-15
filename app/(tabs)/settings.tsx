import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { onAuthChange, User } from '@/services/auth';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';
import { userApi } from '@/services/api';

export default function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      if (authUser) {
        setProfile({
          displayName: authUser.displayName || '',
          email: authUser.email || '',
          phone: authUser.phoneNumber || '',
        });
        loadProfile();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userApi.getProfile();
      if (response.success && response.data) {
        const userData = response.data as any;
        setProfile({
          displayName: userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const [firstName, ...lastNameParts] = profile.displayName.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      await userApi.updateProfile({
        firstName,
        lastName,
        email: profile.email,
      });
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner text="Loading settings..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={profile.displayName}
            onChangeText={(text) => setProfile({ ...profile, displayName: text })}
            placeholder="Enter your name"
            placeholderTextColor={brandColors.light[500]}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            placeholder="Enter your email"
            placeholderTextColor={brandColors.light[500]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={profile.phone}
            editable={false}
            placeholderTextColor={brandColors.light[500]}
          />
          <Text style={styles.helperText}>Phone number cannot be changed</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <IconSymbol size={24} name="lock.fill" color={brandColors.primary[500]} />
            <Text style={styles.menuItemText}>Change Password</Text>
          </View>
          <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <IconSymbol size={24} name="shield.fill" color={brandColors.primary[500]} />
            <Text style={styles.menuItemText}>Two-Factor Authentication</Text>
          </View>
          <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
        </TouchableOpacity>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <IconSymbol size={24} name="bell.fill" color={brandColors.primary[500]} />
            <Text style={styles.menuItemText}>Notification Preferences</Text>
          </View>
          <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <IconSymbol size={24} name="moon.fill" color={brandColors.primary[500]} />
            <Text style={styles.menuItemText}>Theme</Text>
          </View>
          <Text style={styles.menuItemValue}>Light</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <IconSymbol size={24} name="info.circle.fill" color={brandColors.primary[500]} />
            <Text style={styles.menuItemText}>App Version</Text>
          </View>
          <Text style={styles.menuItemValue}>1.0.0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <IconSymbol size={24} name="questionmark.circle.fill" color={brandColors.primary[500]} />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
        </TouchableOpacity>
      </View>
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
  section: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: brandColors.light[900],
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.sm,
  },
  label: {
    ...typography.caption,
    color: brandColors.light[600],
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  input: {
    ...typography.body,
    color: brandColors.light[900],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: brandColors.light[100],
    borderWidth: 1,
    borderColor: brandColors.light[300],
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: brandColors.light[200],
  },
  helperText: {
    ...typography.small,
    color: brandColors.light[500],
    marginTop: spacing.xs,
  },
  saveButton: {
    backgroundColor: brandColors.primary[600],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.body,
    color: '#ffffff',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.sm,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  menuItemText: {
    ...typography.body,
    color: brandColors.light[900],
    fontWeight: '500',
  },
  menuItemValue: {
    ...typography.body,
    color: brandColors.light[600],
  },
});
