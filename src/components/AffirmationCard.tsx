import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Affirmation } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getCategoryById } from '../data/affirmations';

interface AffirmationCardProps {
  affirmation: Affirmation;
  darkMode?: boolean;
}

export const AffirmationCard: React.FC<AffirmationCardProps> = ({
  affirmation,
  darkMode = false,
}) => {
  const category = getCategoryById(affirmation.category);
  const colors = darkMode ? COLORS.dark : COLORS.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
            {category.name}
          </Text>
        </View>
      )}
      <Text style={[styles.affirmationText, { color: colors.text }]}>
        {affirmation.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    ...SHADOWS.card,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  affirmationText: {
    fontSize: FONT_SIZES.affirmation,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: -0.3,
  },
});

export default AffirmationCard;
