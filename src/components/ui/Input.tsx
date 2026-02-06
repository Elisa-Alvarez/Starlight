import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { useStore } from '../../store/useStore';

interface InputProps extends TextInputProps {
  darkMode?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Input: React.FC<InputProps> = ({ style, ...rest }) => {
  const { darkMode } = useStore();
  const colors = darkMode ? COLORS.dark : COLORS.light;
  const glowOpacity = useSharedValue(0);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      <AnimatedView
        style={[
          styles.glow,
          { borderColor: COLORS.primary },
          glowStyle,
        ]}
      />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: darkMode ? COLORS.dividerDark : COLORS.divider,
          },
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        onFocus={() => {
          glowOpacity.value = withTiming(1, { duration: 200 });
        }}
        onBlur={() => {
          glowOpacity.value = withTiming(0, { duration: 200 });
        }}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.md + 2,
    borderWidth: 2,
    margin: -2,
  },
  input: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
  },
});
