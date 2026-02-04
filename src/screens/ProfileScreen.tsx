import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { AnimatedPressable, Card } from '../components/ui';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { api } from '../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { MainTabParamList, RootStackParamList } from '../types';

type ProfileNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'ProfileTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ProfileScreenProps {
  navigation: ProfileNavProp;
}

const ChevronIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StarIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={COLORS.primary}>
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </Svg>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode, setDarkMode } = useStore();
  const { isPro, isTrialActive, trialEndsAt } = useSubscriptionStore();
  const { signOut, isAuthenticated, user } = useAuthStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          await signOut();
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await api.delete('/api/users/me');
              if (!result.success) {
                Alert.alert('Error', 'Failed to delete account. Please try again.');
                return;
              }
            } catch {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
              return;
            }
            await signOut();
            navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ],
    );
  };

  const renderRow = (
    label: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    textColor?: string,
  ) => (
    <AnimatedPressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.row}
      haptic={!!onPress}
    >
      <Text style={[styles.rowLabel, { color: textColor || colors.text }]}>
        {label}
      </Text>
      {rightElement || (onPress && <ChevronIcon color={colors.textSecondary} />)}
    </AnimatedPressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User info */}
        {isAuthenticated && user && (
          <View style={styles.userSection}>
            <View style={[styles.avatar, { backgroundColor: COLORS.primary + '20' }]}>
              <Text style={styles.avatarText}>
                {(user.email?.[0] || 'U').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>
              {(user as any).user_metadata?.full_name || user.email}
            </Text>
            {isPro && (
              <View style={styles.proBadge}>
                <StarIcon />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
        )}

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Subscription
          </Text>
          <Card>
            {isPro ? (
              <>
                {renderRow('Manage Subscription', () => navigation.navigate('CustomerCenter'))}
              </>
            ) : isTrialActive && trialEndsAt ? (
              <>
                <View style={styles.trialCard}>
                  <Text style={[styles.trialTitle, { color: colors.text }]}>Free Trial</Text>
                  <Text style={[styles.trialCountdown, { color: COLORS.primary }]}>
                    {Math.max(1, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))} day{Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)) !== 1 ? 's' : ''} remaining
                  </Text>
                </View>
                {renderRow('Upgrade to Pro', () => navigation.navigate('Paywall', { dismissable: true }))}
              </>
            ) : (
              <>
                {renderRow('Upgrade to Pro', () => navigation.navigate('Paywall', { dismissable: true }))}
              </>
            )}
          </Card>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Appearance
          </Text>
          <Card>
            {renderRow(
              'Dark Mode',
              undefined,
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />,
            )}
            {renderRow('Customize Themes', () => navigation.navigate('Customize'))}
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Settings
          </Text>
          <Card>
            {renderRow('Notifications & Categories', () => navigation.navigate('Settings'))}
            {renderRow('Widget Settings', () => navigation.navigate('WidgetCustomization'))}
          </Card>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Account
          </Text>
          <Card>
            {isAuthenticated ? (
              <>
                {renderRow('Sign Out', handleLogout)}
                {renderRow('Delete Account', handleDeleteAccount, undefined, '#FF3B30')}
              </>
            ) : (
              renderRow('Sign In', () => navigation.navigate('Login'))
            )}
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            About
          </Text>
          <Card>
            {renderRow(
              'Version',
              undefined,
              <Text style={[styles.versionText, { color: colors.textSecondary }]}>1.0.0</Text>,
            )}
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with love for your daily calm
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  proBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  rowLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  trialCard: {
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  trialTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  trialCountdown: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  versionText: {
    fontSize: FONT_SIZES.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
  },
});

export default ProfileScreen;
