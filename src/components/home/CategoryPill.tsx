import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { AnimatedPressable } from '../ui';
import { SPACING, BORDER_RADIUS, GLASS_COLORS } from '../../constants/theme';

export interface PillCategory {
  id: string;
  label: string;
}

export const HOME_PILL_CATEGORIES: PillCategory[] = [
  { id: 'anxiety', label: '\uD83E\uDEC2 Anxiety & Stress' },
  { id: 'energy', label: '\u2728 Energy' },
  { id: 'mindfulness', label: '\uD83C\uDF3F Mindfulness' },
  { id: 'peace', label: '\uD83D\uDD4A\uFE0F Peace' },
  { id: 'self-care', label: '\uD83D\uDEC1 Self-Care' },
  { id: 'sleep', label: '\uD83C\uDF19 Sleep' },
  { id: 'focus', label: '\uD83C\uDFAF Focus' },
  { id: 'winter', label: '\u2744\uFE0F Winter' },
  { id: 'overthinking', label: '\uD83E\uDDE0 Overthinking' },
  { id: 'hard-days', label: '\uD83D\uDC99 Hard Days' },
];

interface CategoryPillProps {
  category: PillCategory;
  isSelected: boolean;
  onPress: () => void;
  darkMode: boolean;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  category,
  isSelected,
  onPress,
  darkMode,
}) => {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.pill,
        isSelected ? styles.pillActive : styles.pillInactive,
        darkMode && !isSelected && styles.pillInactiveDark,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          { color: isSelected ? '#FFFFFF' : darkMode ? '#A0A0A0' : GLASS_COLORS.pillText },
        ]}
      >
        {category.label}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  pillInactiveDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pillActive: {
    backgroundColor: 'rgba(107, 123, 158, 0.9)',
    borderColor: 'transparent',
  },
  pillText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
