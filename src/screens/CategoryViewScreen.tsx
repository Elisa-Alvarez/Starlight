import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { getCategoryById, getAffirmationsByCategory } from '../data/affirmations';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Affirmation } from '../types';

interface CategoryViewScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CategoryView'>;
  route: RouteProp<RootStackParamList, 'CategoryView'>;
}

const BackIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CategoryViewScreen: React.FC<CategoryViewScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  const { category } = route.params;
  const categoryInfo = getCategoryById(category);
  const affirmations = getAffirmationsByCategory(category);

  const renderAffirmation = ({ item }: { item: Affirmation }) => (
    <View style={[styles.affirmationCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.affirmationText, { color: colors.text }]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      paddingTop: insets.top,
    }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BackIcon color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {categoryInfo && (
            <>
              <Text style={styles.headerEmoji}>{categoryInfo.emoji}</Text>
              <Text style={[styles.title, { color: colors.text }]}>
                {categoryInfo.name}
              </Text>
            </>
          )}
        </View>
        <View style={styles.placeholder} />
      </View>

      {categoryInfo && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {categoryInfo.description}
        </Text>
      )}

      <FlatList
        data={affirmations}
        renderItem={renderAffirmation}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  description: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  affirmationCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  affirmationText: {
    fontSize: FONT_SIZES.lg,
    lineHeight: 28,
    fontWeight: '500',
  },
});

export default CategoryViewScreen;
