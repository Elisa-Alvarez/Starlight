import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { AnimatedPressable, Card, Button } from '../components/ui';
import { useStore } from '../store/useStore';
import { useDailyAffirmations } from '../hooks/useAffirmations';
import { useWidgetAccess } from '../hooks/useWidgetAccess';
import { syncAffirmationToWidget } from '../utils/widgetBridge';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';

const FALLBACK_TEXT = 'Your light is always with you ✨';

interface WidgetCustomizationScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WidgetCustomization'>;
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

const LockIcon = ({ color }: { color: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const BG_OPTIONS = [
  { id: 'white', color: '#FFFFFF', label: 'White' },
  { id: 'cream', color: '#FAF8F4', label: 'Cream' },
  { id: 'lavender', color: '#DBC4F0', label: 'Lavender' },
  { id: 'coral', color: '#FFB5A7', label: 'Coral' },
  { id: 'mint', color: '#B5E7DD', label: 'Mint' },
  { id: 'dark', color: '#1A1A1A', label: 'Dark' },
];

const FONT_OPTIONS = [
  { id: 'small', size: 14, label: 'Small' },
  { id: 'medium', size: 16, label: 'Medium' },
  { id: 'large', size: 18, label: 'Large' },
];

const SYNC_DOT_COLORS: Record<SyncStatus, string> = {
  idle: '#A0A0A0',
  syncing: '#F5A623',
  synced: '#4CAF50',
  error: '#FF3B30',
};

const SYNC_LABELS: Record<SyncStatus, string> = {
  idle: 'Tap Save to sync',
  syncing: 'Syncing...',
  synced: 'Synced with widget',
  error: 'Sync failed — try again',
};

export const WidgetCustomizationScreen: React.FC<WidgetCustomizationScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { darkMode, currentAffirmation } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;
  const { canAccessWidget, promptUpgrade } = useWidgetAccess();
  const { data: dailyData } = useDailyAffirmations();

  const [selectedBg, setSelectedBg] = useState('cream');
  const [selectedFont, setSelectedFont] = useState('medium');
  const [textSource, setTextSource] = useState<'daily' | 'custom'>('daily');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const activeBg = BG_OPTIONS.find((b) => b.id === selectedBg)!;
  const activeFont = FONT_OPTIONS.find((f) => f.id === selectedFont)!;
  const isDarkBg = selectedBg === 'dark';

  const handleSave = async () => {
    const affirmationText =
      dailyData?.affirmations?.[0]?.text ??
      currentAffirmation?.text ??
      FALLBACK_TEXT;

    setSyncStatus('syncing');
    await syncAffirmationToWidget(affirmationText);
    setSyncStatus('synced');
  };

  // Subscription gate — show locked state for free users
  if (!canAccessWidget) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <BackIcon color={colors.text} />
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>Widget</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.lockedContainer}>
          <View style={[styles.lockedCard, { backgroundColor: colors.card }]}>
            <LockIcon color={colors.textSecondary} />
            <Text style={[styles.lockedTitle, { color: colors.text }]}>
              Widget is a Pro feature
            </Text>
            <Text style={[styles.lockedSubtitle, { color: colors.textSecondary }]}>
              See your daily affirmation on your home screen without opening the app.
            </Text>
            <Button
              title="Upgrade to Pro"
              onPress={promptUpgrade}
              style={styles.upgradeButton}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>Widget</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Widget Preview */}
        <View style={styles.previewSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Preview
          </Text>
          <View
            style={[
              styles.widgetPreview,
              { backgroundColor: activeBg.color },
            ]}
          >
            <Text
              style={[
                styles.widgetText,
                {
                  fontSize: activeFont.size,
                  color: isDarkBg ? '#F5F5F0' : '#1A1A1A',
                },
              ]}
            >
              "You're doing better than you think"
            </Text>
            <Text
              style={[
                styles.widgetBranding,
                { color: isDarkBg ? '#A0A0A0' : '#6B6B6B' },
              ]}
            >
              Starlight
            </Text>
          </View>
        </View>

        {/* Sync Status */}
        <View style={styles.syncRow}>
          <View style={[styles.syncDot, { backgroundColor: SYNC_DOT_COLORS[syncStatus] }]} />
          <Text style={[styles.syncLabel, { color: colors.textSecondary }]}>
            {SYNC_LABELS[syncStatus]}
          </Text>
        </View>

        {/* Text Source */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Text Source
          </Text>
          <View style={styles.optionRow}>
            <AnimatedPressable
              onPress={() => setTextSource('daily')}
              style={[
                styles.optionChip,
                { backgroundColor: colors.card },
                textSource === 'daily' && styles.optionChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: textSource === 'daily' ? COLORS.primary : colors.text },
                ]}
              >
                Daily affirmation
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => setTextSource('custom')}
              style={[
                styles.optionChip,
                { backgroundColor: colors.card },
                textSource === 'custom' && styles.optionChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: textSource === 'custom' ? COLORS.primary : colors.text },
                ]}
              >
                Custom text
              </Text>
            </AnimatedPressable>
          </View>
        </View>

        {/* Background Color */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Background
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bgScroll}
          >
            {BG_OPTIONS.map((bg) => (
              <AnimatedPressable
                key={bg.id}
                onPress={() => setSelectedBg(bg.id)}
                style={[
                  styles.bgOption,
                  { backgroundColor: bg.color },
                  selectedBg === bg.id && styles.bgOptionSelected,
                  bg.id !== 'dark' && styles.bgOptionBorder,
                ]}
              />
            ))}
          </ScrollView>
        </View>

        {/* Font Size */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Font Size
          </Text>
          <View style={styles.optionRow}>
            {FONT_OPTIONS.map((font) => (
              <AnimatedPressable
                key={font.id}
                onPress={() => setSelectedFont(font.id)}
                style={[
                  styles.optionChip,
                  { backgroundColor: colors.card },
                  selectedFont === font.id && styles.optionChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: selectedFont === font.id ? COLORS.primary : colors.text },
                  ]}
                >
                  {font.label}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>

        <Button title="Save" onPress={handleSave} style={styles.saveButton} />

        {/* Platform setup guide */}
        <View style={[styles.setupGuide, { backgroundColor: colors.card }]}>
          <Text style={[styles.setupTitle, { color: colors.text }]}>
            How to add the widget
          </Text>
          {Platform.OS === 'ios' ? (
            <View style={styles.setupSteps}>
              <Text style={[styles.setupStep, { color: colors.textSecondary }]}>
                1. Long press your home screen
              </Text>
              <Text style={[styles.setupStep, { color: colors.textSecondary }]}>
                2. Tap the + button in the top corner
              </Text>
              <Text style={[styles.setupStep, { color: colors.textSecondary }]}>
                3. Search for "Starlight"
              </Text>
              <Text style={[styles.setupStep, { color: colors.textSecondary }]}>
                4. Tap "Add Widget"
              </Text>
            </View>
          ) : (
            <View style={styles.setupSteps}>
              <Text style={[styles.setupStep, { color: colors.textSecondary }]}>
                1. Long press your home screen
              </Text>
              <Text style={[styles.setupStep, { color: colors.textSecondary }]}>
                2. Tap "Widgets"
              </Text>
              <Text style={[styles.setupStep, { color: colors.textSecondary }]}>
                3. Find "Starlight" and drag it to your home screen
              </Text>
            </View>
          )}
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
  // Locked state
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  lockedCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    gap: SPACING.md,
  },
  lockedTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  upgradeButton: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  previewSection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  widgetPreview: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  widgetText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  widgetBranding: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  // Sync status
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncLabel: {
    fontSize: FONT_SIZES.sm,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  optionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionChip: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionChipSelected: {
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  bgScroll: {
    gap: SPACING.sm,
  },
  bgOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  bgOptionSelected: {
    borderColor: COLORS.primary,
  },
  bgOptionBorder: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  saveButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  // Setup guide
  setupGuide: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  setupTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  setupSteps: {
    gap: SPACING.xs,
  },
  setupStep: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
});

export default WidgetCustomizationScreen;
