import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { CATEGORIES } from '../data/affirmations';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { api } from '../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';

interface SettingsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
}

const BackIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    darkMode,
    setDarkMode,
    selectedCategories,
    toggleCategory,
    notificationTimes,
    toggleNotificationTime,
  } = useStore();
  const { isPro, hasAccess } = useSubscriptionStore();
  const { signOut, isAuthenticated, user } = useAuthStore();

  const colors = darkMode ? COLORS.dark : COLORS.light;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ],
    );
  };

  const formatTime = (hour: number, minute: number) => {
    const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const m = minute.toString().padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${h}:${m} ${period}`;
  };

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      paddingTop: insets.top,
    }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BackIcon color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pro Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Subscription
          </Text>
          {isPro ? (
            <TouchableOpacity
              style={[styles.proCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('CustomerCenter')}
            >
              <View style={styles.proCardLeft}>
                <View style={styles.proBadge}>
                  <StarIcon />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
                <Text style={[styles.proStatus, { color: colors.text }]}>
                  Starlight Pro Active
                </Text>
              </View>
              <ChevronIcon color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => navigation.navigate('Paywall')}
            >
              <View>
                <Text style={styles.upgradeTitle}>Upgrade to Pro ✨</Text>
                <Text style={styles.upgradeSubtitle}>Unlock all features</Text>
              </View>
              <ChevronIcon color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Dark Mode */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Appearance
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Dark Mode
              </Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Widget */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Widget
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                hasAccess
                  ? navigation.navigate('WidgetCustomization')
                  : navigation.navigate('Paywall', { dismissable: true })
              }
            >
              <View style={styles.widgetRowLeft}>
                <View>
                  <View style={styles.widgetLabelRow}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Home Screen Widget
                    </Text>
                    {!hasAccess && (
                      <View style={styles.proBadgeSmall}>
                        <Text style={styles.proBadgeSmallText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                    See today's affirmation without opening the app
                  </Text>
                </View>
              </View>
              <ChevronIcon color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Times */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Check-in Times
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {notificationTimes.map((time, index) => (
              <View
                key={time.id}
                style={[
                  styles.settingRow,
                  index < notificationTimes.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: darkMode ? COLORS.dividerDark : COLORS.divider,
                  },
                ]}
              >
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {time.label}
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                    {formatTime(time.hour, time.minute)}
                  </Text>
                </View>
                <Switch
                  value={time.enabled}
                  onValueChange={() => toggleNotificationTime(time.id)}
                  trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Categories
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Choose what kinds of affirmations you receive
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {CATEGORIES.map((category, index) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.settingRow,
                    index < CATEGORIES.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: darkMode ? COLORS.dividerDark : COLORS.divider,
                    },
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      {category.name}
                    </Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}>
                    {isSelected && (
                      <Svg width={14} height={14} viewBox="0 0 24 24">
                        <Path
                          d="M20 6L9 17l-5-5"
                          stroke="#FFF"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </Svg>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Account
          </Text>
          {isAuthenticated && user && (
            <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
              {user.email}
            </Text>
          )}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.settingRow, {
                borderBottomWidth: 1,
                borderBottomColor: darkMode ? COLORS.dividerDark : COLORS.divider,
              }]}
              onPress={() => navigation.navigate('CustomerCenter')}
            >
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Manage Subscription
              </Text>
              <ChevronIcon color={colors.textSecondary} />
            </TouchableOpacity>
            {isAuthenticated ? (
              <>
                <TouchableOpacity
                  style={[styles.settingRow, {
                    borderBottomWidth: 1,
                    borderBottomColor: darkMode ? COLORS.dividerDark : COLORS.divider,
                  }]}
                  onPress={handleLogout}
                >
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={handleDeleteAccount}
                >
                  <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>
                    Delete Account
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={[styles.settingLabel, { color: COLORS.primary }]}>
                  Sign In
                </Text>
                <ChevronIcon color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            About
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Version
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with ✨ for your daily calm
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
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
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  // Pro card styles
  proCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  proCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
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
  proStatus: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  upgradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  upgradeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  upgradeSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  settingValue: {
    fontSize: FONT_SIZES.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
  },
  accountEmail: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  widgetRowLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  widgetLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  proBadgeSmall: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  proBadgeSmallText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default SettingsScreen;
