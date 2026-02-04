import React, { useEffect } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const imageSize = width * 0.5;

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    SplashScreen.hideAsync();


    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.exp) });

    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1
    );

    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 600 });
      setTimeout(onFinish, 700);
    }, 3000);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Image
          source={require("./StarMascot.png")}
          style={{ width: imageSize, height: imageSize }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
  },
});
