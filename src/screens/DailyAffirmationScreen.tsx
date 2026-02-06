import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '../components/ui';
import { useStore } from '../store/useStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { getAffirmationsByCategory, AFFIRMATIONS } from '../data/affirmations';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { RootStackParamList, Category, Affirmation } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface DailyAffirmationScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DailyAffirmation'>;
  route: RouteProp<RootStackParamList, 'DailyAffirmation'>;
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

const ShareIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeartIcon = ({ color, filled }: { color: string; filled: boolean }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DailyAffirmationScreen: React.FC<DailyAffirmationScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  const categories = route.params?.categories;
  const affirmations = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.flatMap((c: Category) => getAffirmationsByCategory(c));
    }
    return [...AFFIRMATIONS].sort(() => Math.random() - 0.5);
  }, [categories]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const heartScale = useSharedValue(1);

  const currentAffirmation = affirmations[currentIndex] as Affirmation | undefined;
  const isCurrentFavorite = currentAffirmation ? isFavorite(currentAffirmation.id) : false;

  const goToNext = useCallback(() => {
    if (currentIndex < affirmations.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, affirmations.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        runOnJS(goToNext)();
      } else if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        runOnJS(goToPrev)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${translateX.value / 40}deg` },
    ],
  }));

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleToggleFavorite = () => {
    if (!currentAffirmation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );
    if (isCurrentFavorite) {
      removeFavorite(currentAffirmation.id);
    } else {
      addFavorite(currentAffirmation.id, currentAffirmation.text, currentAffirmation.category);
    }
  };

  const handleShare = async () => {
    if (!currentAffirmation) return;
    await Share.share({
      message: `"${currentAffirmation.text}" - Starlight`,
    });
  };

  if (!currentAffirmation) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No affirmations found
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.closeButton}>
          <CloseIcon color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.counter, { color: colors.textSecondary }]}>
          {currentIndex + 1} / {affirmations.length}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Affirmation Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardContainer, cardStyle]}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.affirmationText, { color: colors.text }]}>
              {currentAffirmation.text}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Bottom actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + SPACING.md }]}>
        <AnimatedPressable onPress={handleShare} style={styles.actionButton}>
          <ShareIcon color={colors.textSecondary} />
        </AnimatedPressable>

        <AnimatedPressable onPress={handleToggleFavorite} style={styles.actionButton}>
          <Animated.View style={heartAnimStyle}>
            <HeartIcon
              color={isCurrentFavorite ? COLORS.primary : colors.textSecondary}
              filled={isCurrentFavorite}
            />
          </Animated.View>
        </AnimatedPressable>
      </View>
    </GestureHandlerRootView>
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
    paddingBottom: SPACING.md,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  counter: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  placeholder: {
    width: 40,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  card: {
    borderRadius: 24,
    padding: SPACING.xl + SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  affirmationText: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 40,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xxl,
    paddingTop: SPACING.lg,
  },
  actionButton: {
    padding: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default DailyAffirmationScreen;
