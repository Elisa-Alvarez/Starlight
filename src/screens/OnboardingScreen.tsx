import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { StarMascot } from '../components';
import { CATEGORIES } from '../data/affirmations';
import { useStore } from '../store/useStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList, Category } from '../types';
import {
  formatPrice,
  getSubscriptionPeriod,
  calculateYearlySavings,
} from '../services/revenuecat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
}

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

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    selectedCategories,
    toggleCategory,
    notificationTimes,
    toggleNotificationTime,
    completeOnboarding
  } = useStore();
  const {
    isPro,
    isLoading: subLoading,
    offerings,
    error: subError,
    purchase,
    restore,
    clearError: clearSubError,
    fetchOfferings,
  } = useSubscriptionStore();
  const [step, setStep] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const colors = COLORS.light;

  useEffect(() => {
    if (step === 3 && !offerings) {
      fetchOfferings();
    }
  }, [step]);

  useEffect(() => {
    if (subError) {
      Alert.alert('Error', subError, [{ text: 'OK', onPress: clearSubError }]);
    }
  }, [subError]);

  const handleComplete = () => {
    completeOnboarding();
    navigation.replace('Login');
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <StarMascot size={160} />
      <Text style={[styles.title, { color: colors.text }]}>Meet Starlight</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Your quiet companion for the hard days.{'\n'}
        No pressure. No guilt. Just gentle reminders{'\n'}
        that you're doing okay.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep(1)}
      >
        <Text style={styles.primaryButtonText}>Nice to meet you</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategories = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        What do you need?
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Pick the vibes that fit your life right now.{'\n'}
        You can change these anytime.
      </Text>

      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[
                styles.categoryName,
                { color: isSelected ? colors.text : colors.textSecondary }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep(2)}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderNotifications = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        When should I check in?
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Pick times that work for you.{'\n'}
        Like a friend texting you something nice.
      </Text>

      <View style={styles.timesContainer}>
        {notificationTimes.map((time) => (
          <TouchableOpacity
            key={time.id}
            style={[
              styles.timeChip,
              time.enabled && styles.timeChipSelected,
            ]}
            onPress={() => toggleNotificationTime(time.id)}
          >
            <Text style={[
              styles.timeLabel,
              { color: time.enabled ? colors.text : colors.textSecondary }
            ]}>
              {time.label}
            </Text>
            <Text style={[styles.timeValue, { color: colors.textSecondary }]}>
              {time.hour > 12 ? time.hour - 12 : time.hour}:
              {time.minute.toString().padStart(2, '0')}
              {time.hour >= 12 ? ' PM' : ' AM'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep(3)}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPaywall = () => {
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
        handleComplete();
      }
    };

    const handleRestore = async () => {
      const success = await restore();
      if (success) {
        Alert.alert('Success', 'Your purchases have been restored!', [
          { text: 'OK', onPress: handleComplete },
        ]);
      }
    };

    const proFeatures = [
      'Unlimited affirmations',
      'All categories unlocked',
      'Custom notification schedules',
      'Widget customization',
      'No ads, ever',
    ];

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.paywallHero}>
          <StarMascot size={80} />
          <Text style={[styles.stepTitle, { color: colors.text, textAlign: 'center' }]}>
            Unlock Starlight Pro
          </Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary, textAlign: 'center' }]}>
            Support the app & get unlimited access
          </Text>
        </View>

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

        {subLoading && !packages.length ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
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

        {selectedPackage && (
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            disabled={subLoading}
          >
            {subLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.purchaseButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={[styles.restoreText, { color: colors.textSecondary }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipPaywallButton}
          onPress={handleComplete}
        >
          <Text style={[styles.skipPaywallText, { color: colors.textSecondary }]}>
            Start 3-day free trial
          </Text>
        </TouchableOpacity>

        <Text style={[styles.termsText, { color: colors.textSecondary }]}>
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
        </Text>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom
    }]}>
      {/* Progress dots */}
      <View style={styles.progressContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i === step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {step === 0 && renderWelcome()}
      {step === 1 && renderCategories()}
      {step === 2 && renderNotifications()}
      {step === 3 && renderPaywall()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.divider,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.light.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  categoryName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  timesContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  timeChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.light.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
  },
  timeLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: FONT_SIZES.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Paywall step styles
  paywallHero: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  featuresCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  purchaseButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  restoreText: {
    fontSize: FONT_SIZES.md,
  },
  skipPaywallButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipPaywallText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  termsText: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});

export default OnboardingScreen;
