import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { StarMascot } from '../components';
import { Card } from '../components/ui';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export const ProgressScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  const streakAnim = useSharedValue(0);

  useEffect(() => {
    streakAnim.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, []);

  const streakStyle = useAnimatedStyle(() => ({
    opacity: streakAnim.value,
    transform: [{ scale: 0.8 + streakAnim.value * 0.2 }],
  }));

  // Placeholder data
  const currentStreak = 3;
  const longestStreak = 7;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak section */}
        <Animated.View style={streakStyle}>
          <Card style={styles.streakCard}>
            <StarMascot size={80} />
            <Text style={[styles.streakNumber, { color: COLORS.primary }]}>
              {currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.text }]}>
              Day Streak
            </Text>
            <Text style={[styles.streakSub, { color: colors.textSecondary }]}>
              Longest: {longestStreak} days
            </Text>
          </Card>
        </Animated.View>

        {/* Calendar placeholder */}
        <Card style={styles.calendarCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            This Month
          </Text>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            Calendar view coming soon
          </Text>
        </Card>

        {/* Recent quotes */}
        <Card style={styles.quotesCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recently Viewed
          </Text>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            Your viewed affirmations will appear here
          </Text>
        </Card>
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
    gap: SPACING.md,
  },
  streakCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: '800',
    marginTop: SPACING.md,
  },
  streakLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
  },
  streakSub: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  calendarCard: {
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  placeholderText: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
  quotesCard: {
    paddingVertical: SPACING.lg,
  },
});

export default ProgressScreen;
