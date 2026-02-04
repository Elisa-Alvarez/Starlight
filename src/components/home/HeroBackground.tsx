import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Rect,
  G,
  Circle,
} from 'react-native-svg';
import { HERO_COLORS } from '../../constants/theme';

interface HeroBackgroundProps {
  width: number;
  height: number;
  darkMode: boolean;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  width,
  height,
  darkMode,
}) => {
  const colors = darkMode ? HERO_COLORS.dark : HERO_COLORS.light;
  const w = width;
  const h = height;

  return (
    <View style={[styles.container, { width: w, height: h }]}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <LinearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.skyTop} />
            <Stop offset="0.6" stopColor={colors.skyBottom} />
            <Stop offset="1" stopColor={darkMode ? '#1A1A1A' : '#C9BBE0'} />
          </LinearGradient>
          <LinearGradient id="sunGlow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={darkMode ? '#2D2456' : '#FFDAB3'} stopOpacity="0.6" />
            <Stop offset="1" stopColor={darkMode ? '#2D2456' : '#FFB5A0'} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Sky */}
        <Rect x="0" y="0" width={w} height={h} fill="url(#skyGradient)" />

        {/* Sun/moon glow behind mascot area */}
        <Circle
          cx={w / 2}
          cy={h * 0.32}
          r={h * 0.22}
          fill="url(#sunGlow)"
        />

        {/* Stars (small dots scattered in sky - visible more in dark mode) */}
        <G opacity={darkMode ? 0.6 : 0.2}>
          <Circle cx={w * 0.1} cy={h * 0.12} r={1.5} fill="#FFFFFF" />
          <Circle cx={w * 0.25} cy={h * 0.08} r={1} fill="#FFFFFF" />
          <Circle cx={w * 0.4} cy={h * 0.15} r={1.5} fill="#FFFFFF" />
          <Circle cx={w * 0.6} cy={h * 0.1} r={1} fill="#FFFFFF" />
          <Circle cx={w * 0.75} cy={h * 0.18} r={1.5} fill="#FFFFFF" />
          <Circle cx={w * 0.88} cy={h * 0.06} r={1} fill="#FFFFFF" />
          <Circle cx={w * 0.15} cy={h * 0.22} r={1} fill="#FFFFFF" />
          <Circle cx={w * 0.85} cy={h * 0.25} r={1.5} fill="#FFFFFF" />
        </G>

        {/* Far mountains - soft, light */}
        <Path
          d={`
            M0,${h * 0.55}
            Q${w * 0.08},${h * 0.42} ${w * 0.18},${h * 0.48}
            Q${w * 0.25},${h * 0.38} ${w * 0.35},${h * 0.45}
            Q${w * 0.42},${h * 0.35} ${w * 0.5},${h * 0.42}
            Q${w * 0.58},${h * 0.32} ${w * 0.68},${h * 0.44}
            Q${w * 0.78},${h * 0.38} ${w * 0.88},${h * 0.46}
            Q${w * 0.95},${h * 0.40} ${w},${h * 0.50}
            L${w},${h}
            L0,${h}
            Z
          `}
          fill={colors.mountainFar}
          opacity={0.6}
        />

        {/* Mid mountains - medium depth */}
        <Path
          d={`
            M0,${h * 0.62}
            Q${w * 0.06},${h * 0.52} ${w * 0.14},${h * 0.58}
            Q${w * 0.22},${h * 0.48} ${w * 0.32},${h * 0.56}
            Q${w * 0.4},${h * 0.44} ${w * 0.5},${h * 0.54}
            Q${w * 0.6},${h * 0.46} ${w * 0.7},${h * 0.55}
            Q${w * 0.8},${h * 0.50} ${w * 0.9},${h * 0.56}
            Q${w * 0.96},${h * 0.52} ${w},${h * 0.58}
            L${w},${h}
            L0,${h}
            Z
          `}
          fill={colors.mountainMid}
          opacity={0.8}
        />

        {/* Near mountains - darkest, most prominent */}
        <Path
          d={`
            M0,${h * 0.72}
            Q${w * 0.05},${h * 0.64} ${w * 0.12},${h * 0.68}
            Q${w * 0.2},${h * 0.58} ${w * 0.3},${h * 0.66}
            Q${w * 0.38},${h * 0.60} ${w * 0.48},${h * 0.65}
            Q${w * 0.55},${h * 0.56} ${w * 0.65},${h * 0.64}
            Q${w * 0.72},${h * 0.58} ${w * 0.82},${h * 0.66}
            Q${w * 0.9},${h * 0.62} ${w},${h * 0.68}
            L${w},${h}
            L0,${h}
            Z
          `}
          fill={colors.mountainNear}
        />

        {/* Tree silhouettes - left cluster */}
        <G fill={colors.trees}>
          {/* Left tree group */}
          <Path
            d={`
              M${w * 0.02},${h}
              L${w * 0.05},${h * 0.72}
              L${w * 0.08},${h}
              Z
            `}
          />
          <Path
            d={`
              M${w * 0.06},${h}
              L${w * 0.10},${h * 0.68}
              L${w * 0.14},${h}
              Z
            `}
          />
          <Path
            d={`
              M${w * 0.10},${h}
              L${w * 0.14},${h * 0.70}
              L${w * 0.18},${h}
              Z
            `}
          />

          {/* Center-left trees */}
          <Path
            d={`
              M${w * 0.18},${h}
              L${w * 0.22},${h * 0.74}
              L${w * 0.26},${h}
              Z
            `}
          />

          {/* Right tree group */}
          <Path
            d={`
              M${w * 0.78},${h}
              L${w * 0.82},${h * 0.72}
              L${w * 0.86},${h}
              Z
            `}
          />
          <Path
            d={`
              M${w * 0.84},${h}
              L${w * 0.88},${h * 0.68}
              L${w * 0.92},${h}
              Z
            `}
          />
          <Path
            d={`
              M${w * 0.90},${h}
              L${w * 0.94},${h * 0.73}
              L${w * 0.98},${h}
              Z
            `}
          />
        </G>

        {/* Atmospheric haze near the bottom */}
        <Rect
          x="0"
          y={h * 0.85}
          width={w}
          height={h * 0.15}
          fill={darkMode ? '#1A1A1A' : '#F0EDE8'}
          opacity={0.4}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
