import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StarMascot } from '../components';
import {
  HeroBackground,
  SectionHeader,
  AffirmationGridCard,
  CategoryPill,
  HOME_PILL_CATEGORIES,
  LastListenedCard,
} from '../components/home';
import { getAffirmationsByCategory } from '../data/affirmations';
import { useStore } from '../store/useStore';
import { useCategories } from '../hooks/useCategories';
import { useDailyAffirmations } from '../hooks/useAffirmations';
import { useToggleFavorite } from '../hooks/useFavorites';
import { COLORS, SPACING, GLASS_COLORS } from '../constants/theme';
import { MainTabParamList, RootStackParamList, Affirmation, AffirmationResponse } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.42;

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeNavProp;
}

// Map server response to local Affirmation shape for component compatibility
function toAffirmation(a: AffirmationResponse): Affirmation {
  return { id: a.id, text: a.text, category: a.category };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode, selectedCategories, currentAffirmation } = useStore();
  const { toggle: toggleFavorite, isFavorite } = useToggleFavorite();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  // Fetch data from API
  const { data: categories } = useCategories();
  const { data: dailyData } = useDailyAffirmations();

  // Scroll tracking
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Mascot 8-second pulse animation
  const mascotScale = useSharedValue(1);
  const mascotOpacity = useSharedValue(0.9);

  useEffect(() => {
    mascotScale.value = withRepeat(
      withTiming(1.05, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
    mascotOpacity.value = withRepeat(
      withTiming(1.0, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, []);

  // Parallax + fade for hero
  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HERO_HEIGHT],
          [0, HERO_HEIGHT * 0.5],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      scrollY.value,
      [0, HERO_HEIGHT * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  // Mascot pulse wrapper
  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
    opacity: mascotOpacity.value,
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  // Use API daily affirmations, fall back to hardcoded data
  const todayAffirmations = useMemo(() => {
    if (dailyData?.affirmations && dailyData.affirmations.length > 0) {
      return dailyData.affirmations.slice(0, 4).map(toAffirmation);
    }
    // Fallback to hardcoded data
    const cats =
      selectedCategories.length > 0
        ? selectedCategories
        : ['anxiety', 'energy', 'mindfulness', 'peace'];
    const all = cats.flatMap((c) => getAffirmationsByCategory(c as any));
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [dailyData, selectedCategories]);

  // Category pills: use API categories, fall back to hardcoded
  const categoryPills = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c) => ({
        id: c.id,
        label: `${c.emoji} ${c.name}`,
      }));
    }
    return HOME_PILL_CATEGORIES;
  }, [categories]);

  // Last listened: use currentAffirmation or fall back to first of today
  const lastListened = currentAffirmation || todayAffirmations[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Section - absolutely positioned behind scroll */}
      <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
        <HeroBackground
          width={SCREEN_WIDTH}
          height={HERO_HEIGHT}
          darkMode={darkMode}
        />
        {/* Mascot centered where the sun would be */}
        <Animated.View
          style={[
            styles.mascotOverlay,
            { top: HERO_HEIGHT * 0.22 + insets.top },
            mascotAnimatedStyle,
          ]}
        >
          <StarMascot size={100} animation="idle" />
        </Animated.View>
      </Animated.View>

      {/* Main scrollable content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HERO_HEIGHT - 40 },
        ]}
      >
        {/* Content sheet with rounded top corners */}
        <View
          style={[
            styles.contentSheet,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Greeting */}
          <Text
            style={[styles.greeting, { color: colors.textSecondary }]}
          >
            {getGreeting()}
          </Text>

          {/* Affirmations for Today */}
          <SectionHeader
            title="Affirmations for today"
            onSeeAll={() => navigation.navigate('DailyAffirmation', { categories: selectedCategories })}
            darkMode={darkMode}
          />
          <View style={styles.affirmationGrid}>
            {todayAffirmations.map((aff, i) => (
              <AffirmationGridCard
                key={aff.id}
                affirmation={aff}
                colorVariant={i % 2 === 0 ? 'blue' : 'pink'}
                index={i}
                onPress={() =>
                  navigation.navigate('DailyAffirmation', {
                    categories: [aff.category],
                  })
                }
                onToggleFavorite={() => {
                  toggleFavorite(aff);
                }}
                isFavorite={isFavorite(aff.id)}
              />
            ))}
          </View>

          {/* Affirmations Categories */}
          <SectionHeader
            title="Affirmations categories"
            onSeeAll={() => navigation.navigate('Browse')}
            darkMode={darkMode}
          />
          <View style={styles.pillsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScroll}
            >
              {categoryPills.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  category={cat}
                  isSelected={false}
                  onPress={() => navigation.navigate('CategoryView', { category: cat.id as any })}
                  darkMode={darkMode}
                />
              ))}
            </ScrollView>
            {/* Right edge fade gradient */}
            <LinearGradient
              colors={['transparent', colors.background]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.pillFadeGradient}
              pointerEvents="none"
            />
          </View>

          {/* Last Listened Affirmation */}
          {lastListened && (
            <>
              <SectionHeader
                title="Last listened Affirmation"
                darkMode={darkMode}
              />
              <LastListenedCard
                affirmation={lastListened}
                onPress={() =>
                  navigation.navigate('DailyAffirmation', {
                    categories: [lastListened.category],
                  })
                }
                darkMode={darkMode}
              />
            </>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    zIndex: 0,
  },
  mascotOverlay: {
    position: 'absolute',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl + 40,
  },
  contentSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: SPACING.lg,
    minHeight: SCREEN_HEIGHT,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '500',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  affirmationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  pillsContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  pillsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  pillFadeGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
  },
});

export default HomeScreen;
