import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { COLORS } from '../constants/theme';

interface StarMascotProps {
  size?: number;
  showFace?: boolean;
}

export const StarMascot: React.FC<StarMascotProps> = ({
  size = 120,
  showFace = true,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow effect */}
      <View style={[styles.glow, { width: size * 1.3, height: size * 1.3 }]} />

      <Image
        source={require('./StarMascot.png')}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
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
    opacity: 0.4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default StarMascot;
