import 'dotenv/config';

export default {
  expo: {
    name: 'Starlight',
    slug: 'starlight',
    version: '1.0.0',
    scheme: 'starlight',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1B1E2F',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.starlight.affirmations',
      backgroundColor: '#1B1E2F',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1B1E2F',
      },
      package: 'com.starlight.affirmations',
      edgeToEdgeEnabled: true,
    },
    updates: {
      enabled: false,
      checkAutomatically: 'NEVER',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-font',
      '@react-native-community/datetimepicker',
      'expo-notifications',
      'expo-localization',
      [
        'expo-web-browser',
        {
          experimentalLauncherActivity: false,
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'd0bd808f-a64a-4ce5-8c18-97727c03d92c',
      },
      // RevenueCat API Keys
      revenueCatApiKeyApple: process.env.REVENUECAT_API_KEY_APPLE,
      revenueCatApiKeyGoogle: process.env.REVENUECAT_API_KEY_GOOGLE,
      // PostHog Analytics
      posthogApiKey: process.env.POSTHOG_API_KEY,
      posthogHost: process.env.POSTHOG_HOST,
      // API
      apiUrl: process.env.API_URL,
    },
  },
};
