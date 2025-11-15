import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { onAuthChange, signOut as firebaseSignOut, User } from '@/services/auth';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { brandColors, spacing, typography, borderRadius, shadows } from '@/constants/brand';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await firebaseSignOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.displayName || 'User'}
        </Text>
        <Text style={styles.email}>
          {user?.email || user?.phoneNumber || 'No email'}
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <IconSymbol size={24} name="person.fill" color={brandColors.primary[500]} />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
          </View>
          <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <IconSymbol size={24} name="building.2.fill" color={brandColors.primary[500]} />
            </View>
            <Text style={styles.menuText}>Company Details</Text>
          </View>
          <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <IconSymbol size={24} name="shield.fill" color={brandColors.primary[500]} />
            </View>
            <Text style={styles.menuText}>Security</Text>
          </View>
          <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <IconSymbol size={24} name="questionmark.circle.fill" color={brandColors.primary[500]} />
            </View>
            <Text style={styles.menuText}>Help Center</Text>
          </View>
          <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <IconSymbol size={24} name="info.circle.fill" color={brandColors.primary[500]} />
            </View>
            <Text style={styles.menuText}>About</Text>
          </View>
          <IconSymbol size={20} name="chevron.right" color={brandColors.light[400]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  profileSection: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: brandColors.light[200],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: brandColors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    ...typography.h3,
    color: brandColors.light[900],
    marginBottom: 4,
  },
  email: {
    ...typography.caption,
    color: brandColors.light[600],
  },
  section: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.small,
    fontWeight: '600',
    color: brandColors.light[500],
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: brandColors.light[300],
    ...shadows.sm,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${brandColors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    ...typography.body,
    color: brandColors.light[900],
    fontWeight: '500',
  },
  signOutButton: {
    margin: spacing.xl,
    marginTop: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: brandColors.error[500],
    ...shadows.sm,
  },
  signOutText: {
    ...typography.body,
    fontWeight: '600',
    color: brandColors.error[500],
  },
  version: {
    textAlign: 'center',
    color: brandColors.light[500],
    ...typography.small,
    marginBottom: 32,
  },
});
