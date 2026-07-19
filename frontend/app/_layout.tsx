import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, ErrorBoundary, Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, View } from 'react-native';
import { Storage as SecureStore } from '../src/utils/storage';
import { AppBackground } from '../src/components/AppBackground';

// Prevent auto hide
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 2, gcTime: 1000 * 60 * 10 },
  },
});

const persister = createAsyncStoragePersister({ storage: AsyncStorage });

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true,
  } as any),
});

export { ErrorBoundary };

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    DMSans_700Bold,
  });

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('syntra_jwt');
        setIsLoggedIn(!!token);
      } catch (e) {
        setIsLoggedIn(false);
      } finally {
        setIsAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isAuthChecked) {
      SplashScreen.hideAsync();
      
      // Auto routing based on auth state
      const inAuthGroup = segments[0] === '(auth)';
      if (!isLoggedIn && !inAuthGroup) {
        // Redirect to login if not authenticated
        router.replace('/(auth)/login');
      } else if (isLoggedIn && inAuthGroup) {
        // Redirect to tabs if authenticated and trying to access auth screens
        router.replace('/(tabs)');
      }
    }
  }, [fontsLoaded, isAuthChecked, isLoggedIn, segments]);

  useEffect(() => {
    const registerPush = async () => {
      if (isLoggedIn && Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('syntra-goals', {
              name: 'Goal Reminders',
              importance: Notifications.AndroidImportance.HIGH,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#7C3AED',
            });
          }
        }
      }
    };
    registerPush();
  }, [isLoggedIn]);

  if (!fontsLoaded || !isAuthChecked) {
    return null;
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1 }}>
            <AppBackground />
            <View style={{ flex: 1 }}>
              <Slot />
            </View>
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <View style={{ flex: 1 }}>
          <AppBackground />
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
        </View>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
