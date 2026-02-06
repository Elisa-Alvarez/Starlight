import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginScreen,
  OnboardingScreen,
  HomeScreen,
  SettingsScreen,
  BrowseScreen,
  CategoryViewScreen,
  PaywallScreen,
  CustomerCenterScreen,
} from '../screens';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { onboardingCompleted } = useStore();
  const { isAuthenticated } = useAuthStore();

  // Determine initial route:
  // 1. If not onboarded -> Onboarding
  // 2. If onboarded but not authenticated -> Login
  // 3. If both -> Main
  const getInitialRoute = (): keyof RootStackParamList => {
    if (!onboardingCompleted) return 'Onboarding';
    if (!isAuthenticated) return 'Login';
    return 'Main';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
        initialRouteName={getInitialRoute()}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={HomeScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Browse"
          component={BrowseScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="CategoryView"
          component={CategoryViewScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="CustomerCenter"
          component={CustomerCenterScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
