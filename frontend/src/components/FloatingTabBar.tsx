import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SYNTRA_THEME } from '../../constants/Theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export const FloatingTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const tabWidth = 74; // Spec: 5 columns x 74px wide
  const activeIndex = state.index;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(activeIndex * tabWidth) }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.activeIndicator, animatedStyle]} />
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
        if (route.name === 'decision-ai') iconName = isFocused ? 'git-branch' : 'git-branch-outline';
        if (route.name === 'future-me') iconName = isFocused ? 'trending-up' : 'trending-up-outline';
        if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

        // Index 2 is CoreFAB
        if (index === 2) {
          return (
            <Pressable
              key={route.key}
              style={styles.coreFab}
              onPress={() => navigation.navigate('goals/create')}
            >
              <Ionicons name="add" size={32} color={SYNTRA_THEME.colors.white} />
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={onPress}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? SYNTRA_THEME.colors.white : SYNTRA_THEME.colors.textMuted}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 370, // 5 * 74
    height: 64,
    backgroundColor: SYNTRA_THEME.colors.white,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: SYNTRA_THEME.colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: {
    width: 74,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    width: 74,
    height: '100%',
    backgroundColor: SYNTRA_THEME.colors.primary,
    borderRadius: 32,
    zIndex: 0,
  },
  coreFab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SYNTRA_THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -20 }], // elevated 20px above bar
    shadowColor: SYNTRA_THEME.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 2,
    marginLeft: 1, // centering tweak
    marginRight: 1,
  },
});
