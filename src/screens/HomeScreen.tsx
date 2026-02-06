import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StarMascot } from '../components';
import { AnimatedPressable, Button, Card } from '../components/ui';
import { CATEGORIES } from '../data/affirmations';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { MainTabParamList, RootStackParamList, CategoryInfo } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PASTEL_COLORS = [
  COLORS.lavender,
  COLORS.coral,
  COLORS.mint,
  '#FFE0B2',
  '#C5CAE9',
  '#F8BBD0',
  '#DCEDC8',
  '#B3E5FC',
  '#FFD180',
  '#E1BEE7',
];

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeNavProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode, selectedCategories } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const userCategories = CATEGORIES.filter((c) => selectedCategories.includes(c.id)).slice(0, 4);

  const renderCategoryCard = (category: CategoryInfo, index: number) => {
    const bgColor = PASTEL_COLORS[index % PASTEL_COLORS.length];
    return (
      <AnimatedPressable
        key={category.id}
        onPress={() => navigation.navigate('DailyAffirmation', { categories: [category.id] })}
        style={[styles.forYouCard, { backgroundColor: bgColor + '40' }]}
      >
        <Text style={styles.forYouEmoji}>{category.emoji}</Text>
        <Text style={[styles.forYouName, { color: colors.text }]}>{category.name}</Text>
      </AnimatedPressable>
    );
  };

  const renderExploreCard = (category: CategoryInfo, index: number) => {
    const bgColor = PASTEL_COLORS[index % PASTEL_COLORS.length];
    return (
      <AnimatedPressable
        key={category.id}
        onPress={() => navigation.navigate('DailyAffirmation', { categories: [category.id] })}
        style={[styles.exploreCard, { backgroundColor: bgColor + '30' }]}
      >
        <Text style={styles.exploreEmoji}>{category.emoji}</Text>
        <Text style={[styles.exploreName, { color: colors.text }]}>{category.name}</Text>
      </AnimatedPressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          {getGreeting()}
        </Text>

        {/* Star Mascot */}
        <View style={styles.mascotContainer}>
          <StarMascot size={120} animation="idle" />
        </View>

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          <Button
            title="Create my own mix"
            onPress={() => navigation.navigate('CreateMix')}
          />
        </View>

        {/* For You Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>For you</Text>
          <View style={styles.forYouGrid}>
            {userCategories.map((cat, i) => renderCategoryCard(cat, i))}
          </View>
        </View>

        {/* Explore Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreScroll}
          >
            {CATEGORIES.map((cat, i) => renderExploreCard(cat, i))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  greeting: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  mascotContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  ctaContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  forYouGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  forYouCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    ...SHADOWS.card,
  },
  forYouEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  forYouName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  exploreScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  exploreCard: {
    width: 120,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    ...SHADOWS.card,
  },
  exploreEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  exploreName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;
