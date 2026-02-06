import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StarMascot } from '../components';
import { CATEGORIES } from '../data/affirmations';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList, Category } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    selectedCategories,
    toggleCategory,
    notificationTimes,
    toggleNotificationTime,
    completeOnboarding
  } = useStore();
  const [step, setStep] = useState(0);
  const colors = COLORS.light;

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
        onPress={handleComplete}
      >
        <Text style={styles.primaryButtonText}>I'm ready ✨</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom
    }]}>
      {/* Progress dots */}
      <View style={styles.progressContainer}>
        {[0, 1, 2].map((i) => (
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
    backgroundColor: COLORS.starGlow,
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
    backgroundColor: COLORS.starGlow,
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
    color: '#3D3D3D',
  },
});

export default OnboardingScreen;
