import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StarMascot } from '../components';
import { AnimatedPressable, Card } from '../components/ui';
import { useStore } from '../store/useStore';
import { useFavorites } from '../hooks/useFavorites';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { MainTabParamList, RootStackParamList, FavoriteResponse } from '../types';

type FavoritesNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'FavoritesTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface FavoritesScreenProps {
  navigation: FavoritesNavProp;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useStore();
  const { data: favorites, isLoading } = useFavorites();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  const renderFavorite = ({ item }: { item: FavoriteResponse }) => (
    <AnimatedPressable
      onPress={() => navigation.navigate('DailyAffirmation', { categories: [item.affirmation.category] })}
    >
      <Card style={styles.card}>
        <Text style={[styles.affirmationText, { color: colors.text }]}>
          {item.affirmation.text}
        </Text>
        <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
          {item.affirmation.category}
        </Text>
      </Card>
    </AnimatedPressable>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <View style={styles.emptyContainer}>
          <StarMascot size={100} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Tap the heart on any affirmation to save it here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  card: {
    marginBottom: 0,
  },
  affirmationText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
    lineHeight: 26,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FavoritesScreen;
