import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginScreen,
  OnboardingScreen,
  SettingsScreen,
  BrowseScreen,
  CategoryViewScreen,
  PaywallScreen,
  CustomerCenterScreen,
  DailyAffirmationScreen,
  CreateMixScreen,
  CustomizeScreen,
  WidgetCustomizationScreen,
} from '../screens';
import { MainTabNavigator } from './MainTabNavigator';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { onboardingCompleted } = useStore();
  const { isAuthenticated } = useAuthStore();
  const { hasAccess } = useSubscriptionStore();

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!onboardingCompleted) return 'Onboarding';
    if (!isAuthenticated) return 'Login';
    if (!hasAccess) return 'Paywall';
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
        <Stack.Screen name="Main" component={MainTabNavigator} />
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
          initialParams={{ dismissable: !isAuthenticated || hasAccess ? true : false }}
          options={({ route }) => ({
            animation: 'slide_from_bottom',
            presentation: (route.params as any)?.dismissable === false ? undefined : 'modal',
            gestureEnabled: (route.params as any)?.dismissable !== false,
          })}
        />
        <Stack.Screen
          name="CustomerCenter"
          component={CustomerCenterScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="DailyAffirmation"
          component={DailyAffirmationScreen}
          options={{ animation: 'fade_from_bottom' }}
        />
        <Stack.Screen
          name="CreateMix"
          component={CreateMixScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Customize"
          component={CustomizeScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="WidgetCustomization"
          component={WidgetCustomizationScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
