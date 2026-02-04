import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableComponentProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  haptic?: boolean;
}

export const AnimatedPressable: React.FC<AnimatedPressableComponentProps> = ({
  children,
  style,
  scaleValue = 0.95,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      style={[animatedStyle, style]}
      onPressIn={(e) => {
        scale.value = withSpring(scaleValue, { damping: 15, stiffness: 400 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
};
