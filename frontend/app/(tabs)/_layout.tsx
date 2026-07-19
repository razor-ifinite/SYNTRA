import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../src/components/FloatingTabBar';
import { SYNTRA_THEME } from '../../constants/Theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...(props as any)} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="decision-ai" />
      {/* 
        This is a dummy route for the FAB.
        We don't actually render a screen here, the tab bar intercepts the press
        and navigates to the 'goals/create' screen.
      */}
      <Tabs.Screen name="core-fab" options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="future-me" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
