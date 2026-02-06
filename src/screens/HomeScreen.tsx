import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { StarMascot, AffirmationCard } from '../components';
import { useStore } from '../store/useStore';
import { getCategoryById } from '../data/affirmations';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { RootStackParamList } from '../types';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
}

const SettingsIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode, currentAffirmation, initializeAffirmation, getNewAffirmation } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;

  useEffect(() => {
    initializeAffirmation();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      paddingTop: insets.top,
    }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          {getGreeting()}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <SettingsIcon color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Star Mascot */}
      <View style={styles.mascotContainer}>
        <StarMascot size={140} />
      </View>

      {/* Affirmation */}
      {currentAffirmation && (
        <View style={styles.affirmationContainer}>
          <AffirmationCard
            affirmation={currentAffirmation}
            darkMode={darkMode}
          />
        </View>
      )}

      {/* See Another Button */}
      <TouchableOpacity
        style={styles.anotherButton}
        onPress={getNewAffirmation}
      >
        <Text style={[styles.anotherButtonText, { color: colors.textSecondary }]}>
          See another →
        </Text>
      </TouchableOpacity>

      {/* Browse Link */}
      <TouchableOpacity
        style={styles.browseLink}
        onPress={() => navigation.navigate('Browse')}
      >
        <Text style={[styles.browseLinkText, { color: COLORS.primary }]}>
          Browse all affirmations
        </Text>
      </TouchableOpacity>
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
  greeting: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  mascotContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  affirmationContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  anotherButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  anotherButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  browseLink: {
    alignSelf: 'center',
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  browseLinkText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default HomeScreen;
