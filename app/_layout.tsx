import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { onAuthChange, User } from '@/services/auth';
import '../config/firebase'; // Initialize Firebase

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      // Redirect to main app
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      // Redirect to sign-in
      router.replace('/(auth)/sign-in');
    }
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="transaction/initiate" options={{ presentation: 'modal', title: 'Initiate Transaction' }} />
      <Stack.Screen name="transaction/scan-qr1" options={{ presentation: 'modal', title: 'Scan QR Code' }} />
      <Stack.Screen name="transaction/scan-qr2" options={{ presentation: 'modal', title: 'Scan QR2' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide splash screen when app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <InitialLayout />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
