import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { useStore } from '../store/useStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { getManagementURL, ENTITLEMENT_ID } from '../services/revenuecat';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';

interface CustomerCenterScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CustomerCenter'>;
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

export const CustomerCenterScreen: React.FC<CustomerCenterScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useStore();
  const { isPro, customerInfo, restore, isLoading, refreshCustomerInfo } = useSubscriptionStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;
  const [managementURL, setManagementURL] = useState<string | null>(null);

  useEffect(() => {
    refreshCustomerInfo();
    loadManagementURL();
  }, []);

  const loadManagementURL = async () => {
    const url = await getManagementURL();
    setManagementURL(url);
  };

  const handleManageSubscription = async () => {
    if (managementURL) {
      await Linking.openURL(managementURL);
    } else {
      // Fallback to app store settings
      if (Platform.OS === 'ios') {
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else {
        await Linking.openURL('https://play.google.com/store/account/subscriptions');
      }
    }
  };

  const handleRestorePurchases = async () => {
    const success = await restore();
    if (success) {
      Alert.alert('Success', 'Your purchases have been restored!');
    } else {
      Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
    }
  };

  const handleContactSupport = () => {
    const email = 'support@starlight.app';
    const subject = 'Starlight Pro Support';
    const body = `
App Version: 1.0.0
Platform: ${Platform.OS}
User ID: ${customerInfo?.originalAppUserId || 'Unknown'}
Pro Status: ${isPro ? 'Active' : 'Inactive'}
    `.trim();

    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  // Get active subscription info
  const activeEntitlement = customerInfo?.entitlements.active[ENTITLEMENT_ID];
  const expirationDate = activeEntitlement?.expirationDate
    ? new Date(activeEntitlement.expirationDate)
    : null;
  const isLifetime = activeEntitlement?.expirationDate === null && isPro;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Subscription Status
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>Plan</Text>
              <View style={styles.statusValueContainer}>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {isPro ? 'Starlight Pro' : 'Free'}
                </Text>
                {isPro && (
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                )}
              </View>
            </View>

            {isPro && (
              <>
                <View style={[styles.divider, { backgroundColor: darkMode ? COLORS.dividerDark : COLORS.divider }]} />
                <View style={styles.statusRow}>
                  <Text style={[styles.statusLabel, { color: colors.text }]}>Status</Text>
                  <Text style={[styles.statusValue, { color: '#4CAF50' }]}>Active</Text>
                </View>

                {!isLifetime && expirationDate && (
                  <>
                    <View style={[styles.divider, { backgroundColor: darkMode ? COLORS.dividerDark : COLORS.divider }]} />
                    <View style={styles.statusRow}>
                      <Text style={[styles.statusLabel, { color: colors.text }]}>
                        {activeEntitlement?.willRenew ? 'Renews' : 'Expires'}
                      </Text>
                      <Text style={[styles.statusValue, { color: colors.textSecondary }]}>
                        {formatDate(expirationDate)}
                      </Text>
                    </View>
                  </>
                )}

                {isLifetime && (
                  <>
                    <View style={[styles.divider, { backgroundColor: darkMode ? COLORS.dividerDark : COLORS.divider }]} />
                    <View style={styles.statusRow}>
                      <Text style={[styles.statusLabel, { color: colors.text }]}>Duration</Text>
                      <Text style={[styles.statusValue, { color: colors.textSecondary }]}>Lifetime</Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Manage
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {isPro && (
              <TouchableOpacity style={styles.actionRow} onPress={handleManageSubscription}>
                <Text style={[styles.actionText, { color: colors.text }]}>
                  Manage Subscription
                </Text>
                <ChevronIcon color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {!isPro && (
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => navigation.navigate('Paywall')}
              >
                <Text style={[styles.actionText, { color: COLORS.primary }]}>
                  Upgrade to Pro
                </Text>
                <ChevronIcon color={COLORS.primary} />
              </TouchableOpacity>
            )}

            <View style={[styles.divider, { backgroundColor: darkMode ? COLORS.dividerDark : COLORS.divider }]} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleRestorePurchases}
              disabled={isLoading}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>
                Restore Purchases
              </Text>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.textSecondary} />
              ) : (
                <ChevronIcon color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Support
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.actionRow} onPress={handleContactSupport}>
              <Text style={[styles.actionText, { color: colors.text }]}>Contact Support</Text>
              <ChevronIcon color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: darkMode ? COLORS.dividerDark : COLORS.divider }]} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => Linking.openURL('https://starlight.app/privacy')}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>Privacy Policy</Text>
              <ChevronIcon color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: darkMode ? COLORS.dividerDark : COLORS.divider }]} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => Linking.openURL('https://starlight.app/terms')}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>Terms of Service</Text>
              <ChevronIcon color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* User ID (for support) */}
        {customerInfo && (
          <View style={styles.userIdContainer}>
            <Text style={[styles.userIdLabel, { color: colors.textSecondary }]}>
              User ID: {customerInfo.originalAppUserId?.slice(0, 20)}...
            </Text>
          </View>
        )}
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
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  statusLabel: {
    fontSize: FONT_SIZES.md,
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  proBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  proBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    marginHorizontal: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  actionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  userIdContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  userIdLabel: {
    fontSize: FONT_SIZES.xs,
  },
});

export default CustomerCenterScreen;
