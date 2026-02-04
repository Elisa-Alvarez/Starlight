import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { getAffirmationsByCategory, AFFIRMATIONS } from '../data/affirmations';
import { useMultiCategoryAffirmations, useDailyAffirmations, useTrackView } from '../hooks/useAffirmations';
import { useToggleFavorite } from '../hooks/useFavorites';
import { SPACING } from '../constants/theme';
import { RootStackParamList, Category, Affirmation, AffirmationResponse } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;

// SVG Icons
const CloseIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
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

interface DailyAffirmationScreenProps {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'DailyAffirmation'
  >;
  route: RouteProp<RootStackParamList, 'DailyAffirmation'>;
}

export const DailyAffirmationScreen: React.FC<
  DailyAffirmationScreenProps
> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { toggle: toggleFavorite, isFavorite } = useToggleFavorite();
  const trackView = useTrackView();

  const categories = route.params?.categories;

  // Fetch from API
  const { data: multiCatData, isLoading: multiLoading } = useMultiCategoryAffirmations(
    categories && categories.length > 0 ? categories : undefined,
  );
  const { data: dailyData, isLoading: dailyLoading } = useDailyAffirmations();

  // Build affirmations list: API data -> fallback to hardcoded
  const { affirmations, apiAffirmations } = useMemo(() => {
    // If specific categories were requested, use multi-category fetch
    if (categories && categories.length > 0 && multiCatData && multiCatData.length > 0) {
      return {
        apiAffirmations: multiCatData,
        affirmations: multiCatData.map((a) => ({ id: a.id, text: a.text, category: a.category })),
      };
    }

    // Otherwise use daily affirmations
    if (!categories && dailyData?.affirmations && dailyData.affirmations.length > 0) {
      return {
        apiAffirmations: dailyData.affirmations,
        affirmations: dailyData.affirmations.map((a) => ({ id: a.id, text: a.text, category: a.category })),
      };
    }

    // Fallback to hardcoded data
    const fallback = categories && categories.length > 0
      ? categories.flatMap((c: Category) => getAffirmationsByCategory(c))
      : [...AFFIRMATIONS].sort(() => Math.random() - 0.5);

    return { apiAffirmations: null, affirmations: fallback };
  }, [categories, multiCatData, dailyData]);

  const isLoading = categories ? multiLoading : dailyLoading;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentAffirmation = affirmations[currentIndex] as
    | Affirmation
    | undefined;
  const isCurrentFavorite = currentAffirmation
    ? isFavorite(currentAffirmation.id)
    : false;

  // Swipe animation values
  const translateX = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const heartScale = useSharedValue(1);

  // Slow zoom animation on background image
  const imageZoom = useSharedValue(1);

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

  // Preload adjacent images
  useEffect(() => {
    const urls: string[] = [];
    if (currentIndex > 0) {
      const prevApi = apiAffirmations?.[currentIndex - 1];
      if (prevApi?.backgroundUrl) urls.push(prevApi.backgroundUrl);
    }
    if (currentIndex < affirmations.length - 1) {
      const nextApi = apiAffirmations?.[currentIndex + 1];
      if (nextApi?.backgroundUrl) urls.push(nextApi.backgroundUrl);
    }
    if (urls.length > 0) {
      urls.forEach((url) => Image.prefetch(url));
    }
  }, [currentIndex, affirmations, apiAffirmations]);

  // Reset image loaded state on index change
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

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
      // Fade content slightly as user swipes
      contentOpacity.value = interpolate(
        Math.abs(e.translationX),
        [0, SCREEN_WIDTH * 0.4],
        [1, 0.3],
        Extrapolation.CLAMP,
      );
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        // Slide out left
        translateX.value = withTiming(
          -SCREEN_WIDTH,
          { duration: 300, easing: Easing.out(Easing.ease) },
          () => {
            runOnJS(goToNext)();
            translateX.value = 0;
            contentOpacity.value = withTiming(1, { duration: 300 });
          },
        );
      } else if (e.translationX > SWIPE_THRESHOLD) {
        // Slide out right
        translateX.value = withTiming(
          SCREEN_WIDTH,
          { duration: 300, easing: Easing.out(Easing.ease) },
          () => {
            runOnJS(goToPrev)();
            translateX.value = 0;
            contentOpacity.value = withTiming(1, { duration: 300 });
          },
        );
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        contentOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: contentOpacity.value,
  }));

  const imageZoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageZoom.value }],
  }));

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
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

  if (isLoading && affirmations.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
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
          colors={['#1a1a2e', '#16213e', '#0f3460']}
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

      {/* Fallback gradient (shows while image loads) */}
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
      />

      {/* Background image with slow zoom */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[StyleSheet.absoluteFill, slideStyle]}>
          {imageUrl && (
            <Animated.View style={[StyleSheet.absoluteFill, imageZoomStyle]}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.backgroundImage}
                resizeMode="cover"
                onLoad={() => setImageLoaded(true)}
              />
            </Animated.View>
          )}

          {/* Dark gradient overlay for readability */}
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0.25)',
              'rgba(0, 0, 0, 0.15)',
              'rgba(0, 0, 0, 0.35)',
              'rgba(0, 0, 0, 0.5)',
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Affirmation text - centered */}
          <View style={styles.textContainer}>
            <Text style={[styles.affirmationText, { color: textColor }]}>
              {currentAffirmation.text}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Top bar with gradient backdrop */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.35)', 'transparent']}
        style={[styles.topBar, { paddingTop: insets.top + SPACING.sm }]}
        pointerEvents="box-none"
      >
        <AnimatedPressable
          onPress={() => navigation.goBack()}
          style={styles.glassButton}
        >
          <CloseIcon />
        </AnimatedPressable>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {affirmations.length}
        </Text>
        {/* Spacer to balance layout */}
        <View style={{ width: 44 }} />
      </LinearGradient>

      {/* Bottom actions with gradient backdrop */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.4)']}
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + SPACING.lg },
        ]}
        pointerEvents="box-none"
      >
        <AnimatedPressable
          onPress={handleShare}
          style={styles.actionButton}
        >
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
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
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: SCREEN_HEIGHT * 0.45,
  },
});

export default DailyAffirmationScreen;
