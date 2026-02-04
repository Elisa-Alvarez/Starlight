import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { StarMascot } from '../components';
import { useStore } from '../store/useStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';
import {
  formatPrice,
  getSubscriptionPeriod,
  calculateYearlySavings,
} from '../services/revenuecat';

interface PaywallScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Paywall'>;
  route: RouteProp<RootStackParamList, 'Paywall'>;
}

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useStore();
  const {
    isPro,
    isLoading,
    offerings,
    error,
    purchase,
    restore,
    clearError,
    fetchOfferings,
  } = useSubscriptionStore();

  const dismissable = route.params?.dismissable !== false;
  const colors = darkMode ? COLORS.dark : COLORS.light;
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    if (!offerings) {
      fetchOfferings();
    }
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  // Block hardware back button on Android when non-dismissable
  useEffect(() => {
    if (dismissable) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, [dismissable]);

  // If already pro, show success
  if (isPro) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {dismissable && (
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <CloseIcon color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.successContainer}>
          <StarMascot size={120} />
          <Text style={[styles.successTitle, { color: colors.text }]}>You're Pro!</Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            Thank you for supporting Starlight. Enjoy all the premium features!
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              if (dismissable) {
                navigation.goBack();
              } else {
                navigation.replace('Main');
              }
            }}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const packages = offerings?.availablePackages || [];
  const monthlyPkg = packages.find(p =>
    p.identifier.toLowerCase().includes('monthly') || p.packageType === 'MONTHLY'
  );
  const yearlyPkg = packages.find(p =>
    p.identifier.toLowerCase().includes('yearly') ||
    p.identifier.toLowerCase().includes('annual') ||
    p.packageType === 'ANNUAL'
  );
  const lifetimePkg = packages.find(p =>
    p.identifier.toLowerCase().includes('lifetime') || p.packageType === 'LIFETIME'
  );

  const savings = calculateYearlySavings(monthlyPkg, yearlyPkg);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    const pkg = packages.find(p => p.identifier === selectedPackage);
    if (!pkg) return;

    const success = await purchase(pkg);
    if (success) {
      if (dismissable) {
        navigation.goBack();
      } else {
        navigation.replace('Main');
      }
    }
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert('Success', 'Your purchases have been restored!', [
        {
          text: 'OK',
          onPress: () => {
            if (dismissable) {
              navigation.goBack();
            } else {
              navigation.replace('Main');
            }
          },
        },
      ]);
    }
  };

  const proFeatures = [
    'Unlimited affirmations',
    'All categories unlocked',
    'Custom notification schedules',
    'Widget customization',
    'No ads, ever',
    'Support indie development',
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        {dismissable && (
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <CloseIcon color={colors.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* Spacer when no header */}
        {!dismissable && <View style={{ height: SPACING.xl }} />}

        {/* Hero */}
        <View style={styles.heroSection}>
          <StarMascot size={100} />
          <Text style={[styles.title, { color: colors.text }]}>
            {dismissable ? 'Starlight Pro' : 'Your free trial has ended'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {dismissable
              ? 'Support the app & unlock everything'
              : 'Subscribe to continue using Starlight'}
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.featuresCard, { backgroundColor: colors.card }]}>
          {proFeatures.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkCircle}>
                <CheckIcon color={COLORS.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Packages */}
        {isLoading && !packages.length ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <View style={styles.packagesContainer}>
            {yearlyPkg && (
              <TouchableOpacity
                style={[
                  styles.packageCard,
                  { backgroundColor: colors.card },
                  selectedPackage === yearlyPkg.identifier && styles.packageCardSelected,
                ]}
                onPress={() => setSelectedPackage(yearlyPkg.identifier)}
              >
                {savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Save {savings}%</Text>
                  </View>
                )}
                <Text style={[styles.packageTitle, { color: colors.text }]}>Yearly</Text>
                <Text style={[styles.packagePrice, { color: colors.text }]}>
                  {formatPrice(yearlyPkg)}
                </Text>
                <Text style={[styles.packagePeriod, { color: colors.textSecondary }]}>
                  {getSubscriptionPeriod(yearlyPkg)}
                </Text>
              </TouchableOpacity>
            )}

            {monthlyPkg && (
              <TouchableOpacity
                style={[
                  styles.packageCard,
                  { backgroundColor: colors.card },
                  selectedPackage === monthlyPkg.identifier && styles.packageCardSelected,
                ]}
                onPress={() => setSelectedPackage(monthlyPkg.identifier)}
              >
                <Text style={[styles.packageTitle, { color: colors.text }]}>Monthly</Text>
                <Text style={[styles.packagePrice, { color: colors.text }]}>
                  {formatPrice(monthlyPkg)}
                </Text>
                <Text style={[styles.packagePeriod, { color: colors.textSecondary }]}>
                  {getSubscriptionPeriod(monthlyPkg)}
                </Text>
              </TouchableOpacity>
            )}

            {lifetimePkg && (
              <TouchableOpacity
                style={[
                  styles.packageCard,
                  styles.packageCardWide,
                  { backgroundColor: colors.card },
                  selectedPackage === lifetimePkg.identifier && styles.packageCardSelected,
                ]}
                onPress={() => setSelectedPackage(lifetimePkg.identifier)}
              >
                <View style={styles.lifetimeBadge}>
                  <Text style={styles.lifetimeBadgeText}>Best Value</Text>
                </View>
                <Text style={[styles.packageTitle, { color: colors.text }]}>Lifetime</Text>
                <Text style={[styles.packagePrice, { color: colors.text }]}>
                  {formatPrice(lifetimePkg)}
                </Text>
                <Text style={[styles.packagePeriod, { color: colors.textSecondary }]}>
                  One-time purchase
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Purchase Button */}
        <TouchableOpacity
          style={[styles.purchaseButton, !selectedPackage && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={!selectedPackage || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.purchaseButtonText}>
              {selectedPackage ? 'Continue' : 'Select a plan'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={[styles.restoreButtonText, { color: colors.textSecondary }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of
          the current period. Manage subscriptions in your Account Settings.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: SPACING.md,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  featuresCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    flex: 1,
  },
  loader: {
    marginVertical: SPACING.xl,
  },
  packagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  packageCard: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
  },
  packageCardWide: {
    width: '100%',
    flex: undefined,
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  savingsText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lifetimeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  lifetimeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  packageTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  packagePrice: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  packagePeriod: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  restoreButtonText: {
    fontSize: FONT_SIZES.md,
  },
  terms: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SPACING.md,
  },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.round,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PaywallScreen;
