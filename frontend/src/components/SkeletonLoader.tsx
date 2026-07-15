import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { SYNTRA_THEME } from '../../constants/Theme';

interface SkeletonLoaderProps {
  style?: ViewStyle | ViewStyle[];
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ style }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.skeleton, style, animatedStyle]} />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 8,
  },
});
