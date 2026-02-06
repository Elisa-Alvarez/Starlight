import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { AnimatedPressable, Button } from '../components/ui';
import { CATEGORIES } from '../data/affirmations';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList, Category } from '../types';

interface CreateMixScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateMix'>;
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

export const CreateMixScreen: React.FC<CreateMixScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;
  const [selected, setSelected] = useState<Category[]>([]);

  const toggleCategory = (id: Category) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleStart = () => {
    if (selected.length === 0) return;
    navigation.replace('DailyAffirmation', { categories: selected });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.closeButton}>
          <CloseIcon color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>Create your mix</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Pick the categories you want in your affirmation mix
      </Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {CATEGORIES.map((category) => {
            const isSelected = selected.includes(category.id);
            return (
              <AnimatedPressable
                key={category.id}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card },
                  isSelected && styles.chipSelected,
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={styles.chipEmoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.chipName,
                    { color: isSelected ? colors.text : colors.textSecondary },
                  ]}
                >
                  {category.name}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Button
          title={`Start with ${selected.length} ${selected.length === 1 ? 'category' : 'categories'}`}
          onPress={handleStart}
          disabled={selected.length === 0}
        />
      </View>
    </View>
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
    paddingVertical: SPACING.md,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  chipEmoji: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  chipName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
});

export default CreateMixScreen;
