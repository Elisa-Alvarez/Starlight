jest.mock('react-native', () => {
  const React = require('react');
  return {
    Alert: { alert: jest.fn() },
    Platform: { OS: 'ios' },
    Dimensions: { get: () => ({ width: 375, height: 812 }) },
    StyleSheet: { create: (s: any) => s },
    View: (props: any) => React.createElement('View', props),
    Text: (props: any) => React.createElement('Text', props),
    TouchableOpacity: (props: any) => React.createElement('TouchableOpacity', props),
  };
});

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { apiUrl: 'http://localhost:3000' } },
}));

jest.mock('react-native-purchases', () => ({}));
jest.mock('expo-secure-store', () => ({}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));
