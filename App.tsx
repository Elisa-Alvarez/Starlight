import React, { useEffect, useState } from 'react';
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
import AuthProvider from './src/providers/auth-provider';
import { QueryProvider } from './src/providers/query-provider';
import AnimatedSplash from './src/components/AnimatedSplash';
import { ErrorBoundary } from './src/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

const { posthogApiKey, posthogHost } = Constants.expoConfig?.extra ?? {};

function AppContent() {
  const { darkMode } = useStore();
  const { initialize: initializeSubscriptions, isInitialized: subInitialized } = useSubscriptionStore();
  const { initialize: initializeAuth, isInitialized: authInitialized, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      await initializeSubscriptions().catch(() => {});
    };

    init();
  }, []);

  if (!authInitialized || (isAuthenticated && !subInitialized)) {
    return null;
  }

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const { darkMode } = useStore();

  if (!splashDone) {
    return <AnimatedSplash onFinish={() => setSplashDone(true)} />;
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: darkMode ? COLORS.dark.background : COLORS.light.background }]}>
      <PostHogProvider
        apiKey={posthogApiKey}
        options={{
          host: posthogHost || 'https://us.i.posthog.com',
          enableSessionReplay: true,
        }}
        autocapture
      >
        <SafeAreaProvider>
          <QueryProvider>
            <AuthProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </AuthProvider>
          </QueryProvider>
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