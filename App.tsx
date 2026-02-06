import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { AppNavigator } from './src/navigation';
import { useStore } from './src/store/useStore';
import { useSubscriptionStore } from './src/store/subscriptionStore';
import { useAuthStore } from './src/store/authStore';
import { COLORS } from './src/constants/theme';
import { PostHogProvider } from 'posthog-react-native';
import { ActivityIndicator, View } from 'react-native';
import AuthProvider from './src/providers/auth-provider';

const { posthogApiKey, posthogHost } = Constants.expoConfig?.extra ?? {};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { darkMode } = useStore();
  const { initialize: initializeSubscriptions } = useSubscriptionStore();
  const { initialize: initializeAuth, isInitialized: authInitialized } = useAuthStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  // Initialize auth and RevenueCat
  useEffect(() => {
    const init = async () => {
      // Initialize auth first
      await initializeAuth();

      // Then initialize RevenueCat after a short delay
      setTimeout(() => {
        initializeSubscriptions().catch(console.error);
      }, 100);
    };

    init();
  }, []);

  // Show loading while auth initializes
  if (!authInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  const { darkMode } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>      
      <PostHogProvider
        apiKey={posthogApiKey}
        options={{
          host: posthogHost || 'https://us.i.posthog.com',
          enableSessionReplay: true,
        }}
        autocapture
      >
        <SafeAreaProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SafeAreaProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});