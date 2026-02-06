import React from 'react';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { useStore } from '../../store/useStore';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  lifted?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, lifted = false }) => {
  const { darkMode } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;
  const shadow = lifted ? SHADOWS.cardLifted : SHADOWS.card;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card },
        shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
});
