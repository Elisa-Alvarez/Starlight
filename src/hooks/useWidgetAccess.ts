import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { RootStackParamList } from '../types';

export function useWidgetAccess(): {
  canAccessWidget: boolean;
  promptUpgrade: () => void;
} {
  const { hasAccess } = useSubscriptionStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const promptUpgrade = () => {
    navigation.navigate('Paywall', { dismissable: true });
  };

  return {
    canAccessWidget: hasAccess,
    promptUpgrade,
  };
}
