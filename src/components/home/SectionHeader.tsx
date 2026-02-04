import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedPressable } from '../ui';
import { SPACING, GLASS_COLORS } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  darkMode: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onSeeAll,
  darkMode,
}) => {
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: darkMode ? '#F5F5F0' : GLASS_COLORS.sectionTitle },
        ]}
      >
        {title}
      </Text>
      {onSeeAll && (
        <AnimatedPressable onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
        </AnimatedPressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  seeAllButton: {
    padding: SPACING.xs,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: GLASS_COLORS.sectionSubtle,
  },
});
