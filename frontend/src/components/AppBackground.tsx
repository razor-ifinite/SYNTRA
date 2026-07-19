import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';
import { SYNTRA_THEME } from '../../constants/Theme';

interface AppBackgroundProps {
  backgroundColor?: string;
  dotColor?: string;
  opacity?: number;
}

export const AppBackground = ({ 
  backgroundColor = SYNTRA_THEME.colors.background,
  dotColor = SYNTRA_THEME.colors.primary,
  opacity = 0.15 
}: AppBackgroundProps) => {
  return (
    <View style={[styles.container, { backgroundColor }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="1.5" fill={dotColor} opacity={opacity} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dot-grid)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});
