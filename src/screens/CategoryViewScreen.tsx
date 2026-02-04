import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Share,
  Image,
  StatusBar,
  ActivityIndicator,
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
  withTiming,
  withRepeat,
  runOnJS,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '../components/ui';
import { getCategoryById, getAffirmationsByCategory } from '../data/affirmations';
import { useCategoryAffirmations, useTrackView } from '../hooks/useAffirmations';
import { useCategories } from '../hooks/useCategories';
import { useToggleFavorite } from '../hooks/useFavorites';
import { SPACING } from '../constants/theme';
import { RootStackParamList, Affirmation, AffirmationResponse } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

// SVG Icons
const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="#FFFFFF"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill={filled ? '#FF6B6B' : 'none'}
  >
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={filled ? '#FF6B6B' : '#FFFFFF'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronDownIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9l6 6 6-6"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Progress dots component (for <=12 affirmations)
const ProgressDots = ({
  total,
  current,
}: {
  total: number;
  current: number;
}) => {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.dotActive,
            total > 8 && styles.dotCondensed,
            total > 8 && i === current && styles.dotActiveCondensed,
          ]}
        />
      ))}
    </View>
  );
};

// Progress bar component (for >12 affirmations)
const ProgressBar = ({
  total,
  current,
}: {
  total: number;
  current: number;
}) => {
  const progress = ((current + 1) / total) * 100;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
    </View>
  );
};

interface CategoryViewScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CategoryView'>;
  route: RouteProp<RootStackParamList, 'CategoryView'>;
}

export const CategoryViewScreen: React.FC<CategoryViewScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { toggle: toggleFavorite, isFavorite } = useToggleFavorite();
  const trackView = useTrackView();

  const { category } = route.params;

  // Fetch from API, fall back to hardcoded data
  const { data: apiAffirmations, isLoading } = useCategoryAffirmations(category);
  const { data: categories } = useCategories();

  const categoryInfo = categories?.find((c) => c.id === category) || getCategoryById(category);
  const affirmations: Affirmation[] = apiAffirmations
    ? apiAffirmations.map((a) => ({ id: a.id, text: a.text, category: a.category }))
    : getAffirmationsByCategory(category);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);

  const currentAffirmation = affirmations[currentIndex] as
    | Affirmation
    | undefined;
  const isCurrentFavorite = currentAffirmation
    ? isFavorite(currentAffirmation.id)
    : false;

  // Animation values
  const translateY = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const imageZoom = useSharedValue(1);
  const hintOpacity = useSharedValue(1);

  // Slow zoom on background
  useEffect(() => {
    imageZoom.value = 1;
    imageZoom.value = withRepeat(
      withTiming(1.05, {
        duration: 20000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [currentIndex]);

  // Track view when affirmation changes
  useEffect(() => {
    if (currentAffirmation) {
      trackView.mutate({ affirmationId: currentAffirmation.id });
    }
  }, [currentIndex]);

  // Swipe hint: auto-hide after 3 seconds
  useEffect(() => {
    if (showHint) {
      hintOpacity.value = withRepeat(
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
      const timer = setTimeout(() => {
        hintOpacity.value = withTiming(0, { duration: 400 });
        setShowHint(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  // Preload adjacent images
  useEffect(() => {
    const urls: string[] = [];
    for (let i = 1; i <= 2; i++) {
      const nextIdx = currentIndex + i;
      if (nextIdx < affirmations.length) {
        const apiAff = apiAffirmations?.[nextIdx];
        if (apiAff?.backgroundUrl) urls.push(apiAff.backgroundUrl);
      }
    }
    if (currentIndex > 0) {
      const prevAff = apiAffirmations?.[currentIndex - 1];
      if (prevAff?.backgroundUrl) urls.push(prevAff.backgroundUrl);
    }
    if (urls.length > 0) {
      urls.forEach((url) => Image.prefetch(url));
    }
  }, [currentIndex, affirmations, apiAffirmations]);

  const goToNext = useCallback(() => {
    if (currentIndex < affirmations.length - 1) {
      setCurrentIndex((i) => i + 1);
      setShowHint(false);
    }
  }, [currentIndex, affirmations.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const hasNext = currentIndex < affirmations.length - 1;
  const hasPrev = currentIndex > 0;

  // Vertical pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const delta = e.translationY;
      // Rubber band at edges
      if ((!hasPrev && delta > 0) || (!hasNext && delta < 0)) {
        translateY.value = delta / 3;
      } else {
        translateY.value = delta;
      }
      contentOpacity.value = interpolate(
        Math.abs(delta),
        [0, SCREEN_HEIGHT * 0.3],
        [1, 0.3],
        Extrapolation.CLAMP,
      );
    })
    .onEnd((e) => {
      const delta = e.translationY;
      const velocity = Math.abs(e.velocityY);
      const shouldNavigate =
        Math.abs(delta) > SWIPE_THRESHOLD || velocity > 500;

      if (shouldNavigate) {
        if (delta < 0 && hasNext) {
          // Swipe up -> next
          translateY.value = withTiming(
            -SCREEN_HEIGHT,
            { duration: 350, easing: Easing.out(Easing.cubic) },
            () => {
              runOnJS(goToNext)();
              translateY.value = 0;
              contentOpacity.value = withTiming(1, { duration: 300 });
            },
          );
        } else if (delta > 0 && hasPrev) {
          // Swipe down -> previous
          translateY.value = withTiming(
            SCREEN_HEIGHT,
            { duration: 350, easing: Easing.out(Easing.cubic) },
            () => {
              runOnJS(goToPrev)();
              translateY.value = 0;
              contentOpacity.value = withTiming(1, { duration: 300 });
            },
          );
        } else {
          // Edge bounce
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
          contentOpacity.value = withTiming(1, { duration: 200 });
        }
      } else {
        // Snap back
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        contentOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: contentOpacity.value,
  }));

  const imageZoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageZoom.value }],
  }));

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  const handleToggleFavorite = () => {
    if (!currentAffirmation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    heartScale.value = withSequence(
      withSpring(1.4, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );
    toggleFavorite(currentAffirmation);
  };

  const handleShare = async () => {
    if (!currentAffirmation) return;
    await Share.share({
      message: `"${currentAffirmation.text}" \u2014 Starlight`,
    });
  };

  if (isLoading && !affirmations.length) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!currentAffirmation) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.emptyText}>No affirmations found</Text>
      </View>
    );
  }

  const currentApiAff = apiAffirmations?.[currentIndex];
  const imageUrl = currentApiAff?.backgroundUrl;
  const gradientColors: [string, string] = [
    currentApiAff?.backgroundColorPrimary || '#1a1a2e',
    currentApiAff?.backgroundColorSecondary || '#16213e',
  ];
  const textColor = currentApiAff?.displayColor || '#FFFFFF';

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Fallback gradient */}
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
      />

      {/* Swipeable background + content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[StyleSheet.absoluteFill, slideStyle]}>
          {/* Background image with slow zoom */}
          {imageUrl && (
            <Animated.View style={[StyleSheet.absoluteFill, imageZoomStyle]}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.backgroundImage}
                resizeMode="cover"
              />
            </Animated.View>
          )}

          {/* Dark gradient overlay */}
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0.4)',
              'rgba(0, 0, 0, 0.1)',
              'rgba(0, 0, 0, 0.3)',
              'rgba(0, 0, 0, 0.55)',
            ]}
            locations={[0, 0.35, 0.65, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Centered affirmation text */}
          <View style={styles.textContainer}>
            <Text style={[styles.affirmationText, { color: textColor }]}>
              {currentAffirmation.text}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Top navigation bar */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.15)', 'transparent']}
        style={[styles.topBar, { paddingTop: insets.top + SPACING.sm }]}
        pointerEvents="box-none"
      >
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BackIcon />
          {categoryInfo && (
            <Text style={styles.categoryTitle}>{categoryInfo.name}</Text>
          )}
        </AnimatedPressable>

        <View style={styles.counterArea}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {affirmations.length}
          </Text>
        </View>
      </LinearGradient>

      {/* Progress indicator */}
      <View
        style={[
          styles.progressArea,
          { bottom: insets.bottom + 100 },
        ]}
        pointerEvents="none"
      >
        {affirmations.length <= 12 ? (
          <ProgressDots total={affirmations.length} current={currentIndex} />
        ) : (
          <ProgressBar total={affirmations.length} current={currentIndex} />
        )}
      </View>

      {/* Bottom actions */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.45)']}
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + SPACING.lg },
        ]}
        pointerEvents="box-none"
      >
        <AnimatedPressable onPress={handleShare} style={styles.actionButton}>
          <ShareIcon />
        </AnimatedPressable>

        <AnimatedPressable
          onPress={handleToggleFavorite}
          style={styles.actionButton}
        >
          <Animated.View style={heartAnimStyle}>
            <HeartIcon filled={isCurrentFavorite} />
          </Animated.View>
        </AnimatedPressable>
      </LinearGradient>

      {/* Swipe hint (auto-hides) */}
      {showHint && (
        <Animated.View
          style={[
            styles.swipeHint,
            { bottom: insets.bottom + 160 },
            hintStyle,
          ]}
          pointerEvents="none"
        >
          <ChevronDownIcon />
          <Text style={styles.swipeHintText}>Swipe to explore</Text>
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl + SPACING.sm,
  },
  affirmationText: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 46,
    textAlign: 'center',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl + SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  counterArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Progress indicators
  progressArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  dotCondensed: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActiveCondensed: {
    width: 16,
    borderRadius: 3,
  },
  progressBarContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingTop: SPACING.xxl,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Swipe hint
  swipeHint: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 4,
  },
  swipeHintText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: SCREEN_HEIGHT * 0.45,
  },
});

export default CategoryViewScreen;
