import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { AnimatedPressable } from '../ui';
import { getCategoryById } from '../../data/affirmations';
import { SPACING, GLASS_COLORS, COLORS } from '../../constants/theme';
import { Affirmation } from '../../types';

const PlayIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill={color}>
    <Polygon points="5,3 19,12 5,21" />
  </Svg>
);

interface LastListenedCardProps {
  affirmation: Affirmation;
  onPress: () => void;
  darkMode: boolean;
}

export const LastListenedCard: React.FC<LastListenedCardProps> = ({
  affirmation,
  onPress,
  darkMode,
}) => {
  const categoryInfo = getCategoryById(affirmation.category);
  const pastelColors = [
    COLORS.lavender,
    COLORS.coral,
    COLORS.mint,
    '#FFE0B2',
    '#C5CAE9',
  ];
  const colorIndex = affirmation.category.charCodeAt(0) % pastelColors.length;
  const thumbnailColor = pastelColors[colorIndex];

  return (
    <AnimatedPressable onPress={onPress} style={styles.card}>
      <View style={[styles.thumbnail, { backgroundColor: thumbnailColor + '60' }]}>
        <Text style={styles.thumbnailEmoji}>
          {categoryInfo?.emoji || '\u2728'}
        </Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.affirmationText} numberOfLines={2}>
          {affirmation.text}
        </Text>
        <Text style={styles.categoryName}>
          {categoryInfo?.name || 'Affirmation'}
        </Text>
      </View>
      <View style={styles.playButton}>
        <PlayIcon color="#FFFFFF" />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 21, 51, 0.7)',
    borderRadius: 20,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  affirmationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  categoryName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
