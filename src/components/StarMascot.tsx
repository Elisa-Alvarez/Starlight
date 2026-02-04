import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

type AnimationType = 'idle' | 'interaction' | 'achievement' | 'loading';

interface StarMascotProps {
  size?: number;
  showFace?: boolean;
  animation?: AnimationType;
}

export const StarMascot: React.FC<StarMascotProps> = ({
  size = 120,
  showFace = true,
  animation = 'idle',
}) => {
  const glowOpacity = useSharedValue(0.3);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    switch (animation) {
      case 'idle':
        glowOpacity.value = withRepeat(
          withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        );
        scale.value = 1;
        translateY.value = 0;
        rotation.value = 0;
        break;

      case 'interaction':
        translateY.value = withSequence(
          withSpring(-10, { damping: 8, stiffness: 300 }),
          withSpring(0, { damping: 8, stiffness: 300 }),
        );
        scale.value = withSequence(
          withSpring(1.1, { damping: 8, stiffness: 300 }),
          withSpring(1, { damping: 8, stiffness: 300 }),
        );
        break;

      case 'achievement':
        scale.value = withSequence(
          withSpring(1.3, { damping: 6, stiffness: 200 }),
          withSpring(1, { damping: 8, stiffness: 300 }),
        );
        glowOpacity.value = withSequence(
          withTiming(0.8, { duration: 200 }),
          withTiming(0.4, { duration: 400 }),
        );
        break;

      case 'loading':
        rotation.value = withRepeat(
          withTiming(360, { duration: 2000, easing: Easing.linear }),
          -1,
          false,
        );
        break;
    }
  }, [animation]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.glow,
          { width: size * 1.3, height: size * 1.3 },
          glowStyle,
        ]}
      />
      <Animated.View style={mascotStyle}>
        <Image
          source={require('./StarMascot.png')}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: COLORS.starGlow,
    borderRadius: 9999,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default StarMascot;
