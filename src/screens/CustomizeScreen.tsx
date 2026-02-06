import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { AnimatedPressable } from '../components/ui';
import { useStore } from '../store/useStore';
import { THEME_PRESETS, ThemePreset } from '../constants/themes';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';

interface CustomizeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Customize'>;
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

const ThemeCard = ({
  theme,
  isSelected,
  onSelect,
}: {
  theme: ThemePreset;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isSelected) {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isSelected]);

  const glowStyle = useAnimatedStyle(() => ({
    borderColor: isSelected
      ? `rgba(255, 87, 34, ${0.4 + glowOpacity.value * 0.6})`
      : 'transparent',
  }));

  return (
    <AnimatedPressable onPress={onSelect}>
      <Animated.View
        style={[
          styles.themeCard,
          { backgroundColor: theme.colors.background },
          glowStyle,
        ]}
      >
        <Text style={[styles.themePreviewText, { color: theme.colors.text }]}>
          Aa
        </Text>
        <Text style={[styles.themeName, { color: theme.colors.text }]}>
          {theme.name}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
};

export const CustomizeScreen: React.FC<CustomizeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode, selectedTheme, setSelectedTheme } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>Customize</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Affirmation Themes
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Choose a theme for your daily affirmation cards
        </Text>

        <View style={styles.grid}>
          {THEME_PRESETS.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={selectedTheme === theme.id}
              onSelect={() => setSelectedTheme(theme.id)}
            />
          ))}
        </View>
      </ScrollView>
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
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  themeCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    // Make cards 1/3 of grid
    minWidth: 100,
    maxWidth: 120,
  },
  themePreviewText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  themeName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});

export default CustomizeScreen;
