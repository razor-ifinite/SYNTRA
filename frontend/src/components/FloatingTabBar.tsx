import React from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SYNTRA_THEME } from '../../constants/Theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

export const FloatingTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.container}>
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
        let labelName = 'Home';
        
        if (route.name === 'index') { iconName = isFocused ? 'home' : 'home-outline'; labelName = 'Home'; }
        if (route.name === 'decision-ai') { iconName = isFocused ? 'git-branch' : 'git-branch-outline'; labelName = 'Syntra AI'; }
        if (route.name === 'future-me') { iconName = isFocused ? 'trending-up' : 'trending-up-outline'; labelName = 'Future Me'; }
        if (route.name === 'profile') { iconName = isFocused ? 'person' : 'person-outline'; labelName = 'Profile'; }

        // Index 2 is CoreFAB
        if (index === 2) {
          return (
            <View key={route.key} style={styles.coreFabContainer}>
              <Pressable
                style={styles.coreFab}
                onPress={() => navigation.navigate('goals/create')}
              >
                <Ionicons name="add" size={24} color={SYNTRA_THEME.colors.white} />
              </Pressable>
            </View>
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
              color={isFocused ? SYNTRA_THEME.colors.primary : SYNTRA_THEME.colors.textMuted}
            />
            <Text style={[
              styles.label, 
              { color: isFocused ? SYNTRA_THEME.colors.primary : SYNTRA_THEME.colors.textMuted }
            ]}>
              {labelName}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 80,
    backgroundColor: SYNTRA_THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: SYNTRA_THEME.colors.backgroundAlt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 20, // SafeArea allowance for bottom
    shadowColor: SYNTRA_THEME.colors.textPrimary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: {
    width: 74,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  coreFabContainer: {
    width: 74,
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-start',
    transform: [{ translateY: -20 }], // elevated above bar
  },
  coreFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: SYNTRA_THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SYNTRA_THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
