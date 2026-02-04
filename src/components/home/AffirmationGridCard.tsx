import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '../ui';
import { SPACING, GLASS_COLORS } from '../../constants/theme';
import { Affirmation } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

const HeartIcon = ({ color, filled }: { color: string; filled: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface AffirmationGridCardProps {
  affirmation: Affirmation;
  colorVariant: 'blue' | 'pink';
  onPress: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  index: number;
}

export const AffirmationGridCard: React.FC<AffirmationGridCardProps> = ({
  affirmation,
  colorVariant,
  onPress,
  onToggleFavorite,
  isFavorite,
  index,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      index * 100,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
    translateY.value = withDelay(
      index * 100,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );
    onToggleFavorite();
  };

  const bgColor =
    colorVariant === 'blue' ? GLASS_COLORS.cardBlue : GLASS_COLORS.cardPink;

  return (
    <Animated.View style={cardAnimatedStyle}>
      <AnimatedPressable onPress={onPress} style={[styles.card, { backgroundColor: bgColor }]}>
        <Text style={styles.quoteMark}>{'\u201C'}</Text>
        <Text style={styles.affirmationText} numberOfLines={4}>
          {affirmation.text}
        </Text>
        <View style={styles.bottomRow}>
          <View style={{ flex: 1 }} />
          <AnimatedPressable onPress={handleFavorite} style={styles.heartButton}>
            <Animated.View style={heartAnimStyle}>
              <HeartIcon
                color={isFavorite ? '#FF6B8A' : 'rgba(255, 255, 255, 0.7)'}
                filled={isFavorite}
              />
            </Animated.View>
          </AnimatedPressable>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: SPACING.lg,
    minHeight: 180,
    borderWidth: 1,
    borderColor: GLASS_COLORS.border,
    justifyContent: 'space-between',
  },
  quoteMark: {
    fontSize: 40,
    lineHeight: 44,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '300',
  },
  affirmationText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: GLASS_COLORS.textOnCard,
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
